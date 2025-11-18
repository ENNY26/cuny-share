import Note from "../models/Notes.js";
import User from "../models/User.js";
import { deleteFileFromS3 } from "../utils/s3Delete.js";
import { getFileUrl, getFileKey } from "./helpers.js";

// Helper function to calculate trending score
const calculateTrendingScore = (note) => {
  const now = new Date();
  const hoursSinceCreation = (now - note.createdAt) / (1000 * 60 * 60);
  const likesCount = note.likes?.length || 0;
  const viewsCount = note.views || 0;
  const commentsCount = note.comments?.length || 0;
  
  // Trending algorithm: more recent + more engagement = higher score
  // Decay factor: older posts get lower scores
  const timeDecay = Math.max(0.1, 1 / (1 + hoursSinceCreation / 24)); // Decay over days
  const engagementScore = (likesCount * 10) + (viewsCount * 0.1) + (commentsCount * 5);
  
  return engagementScore * timeDecay;
};

// UPLOAD NOTE OR FORUM POST
export const uploadNote = async (req, res) => {
    try {
        const { 
          title, subject, professor, level, description, alumni, 
          courseNumber, course, postType = 'note' 
        } = req.body;

        // For forum posts, title is required. For notes, file is required
        if (postType === 'forum' && !title) {
          return res.status(400).json({ message: "Title is required for forum posts." });
        }
        
        // Check if any files were uploaded
        const hasFiles = req.file || 
          (req.files && ((req.files.files && req.files.files.length > 0) || (req.files.file && req.files.file.length > 0)));
        
        if (postType === 'note' && !hasFiles) {
          return res.status(400).json({ message: "File is required for notes." });
        }
        
        if (postType === 'forum' && !hasFiles) {
          return res.status(400).json({ message: "At least one image is required for forum posts." });
        }

        const uploader = await User.findById(req.user._id);
        if (!uploader) {
          return res.status(404).json({ message: "User not found" });
        }

        let fileUrl, fileKey, fileType;
        let images = [];
        let imageKeys = [];

        // Handle files from upload.fields() - files come as object with field names as keys
        const filesArray = [];
        if (req.files) {
          // Handle 'files' field (multiple files for forum posts)
          if (req.files.files && Array.isArray(req.files.files)) {
            filesArray.push(...req.files.files);
          }
          // Handle 'file' field (single file for legacy notes)
          if (req.files.file && Array.isArray(req.files.file)) {
            filesArray.push(...req.files.file);
          }
        }
        // Fallback to req.file (if using single() instead of fields())
        if (req.file) {
          filesArray.push(req.file);
        }

        // Process files
        if (filesArray.length > 0) {
          images = filesArray.map(getFileUrl).filter(Boolean);
          imageKeys = filesArray.map(getFileKey).filter(Boolean);
          if (images.length > 0) {
            fileUrl = images[0]; // First image/file as primary
            fileKey = imageKeys[0];
            fileType = filesArray[0].mimetype;
          }
        }

        const note = new Note({
          title: postType === 'forum' ? title : undefined,
          subject,
          professor,
          level,
          description,
          alumni,
          courseNumber: courseNumber || course,
          fileUrl,
          fileKey,
          fileType,
          images,
          imageKeys,
          postType,
          uploader: req.user._id,
          uploaderUsername: uploader.username,
          uploaderEmail: uploader.email,
        });

        // Calculate initial trending score
        note.trendingScore = calculateTrendingScore(note);
        await note.save();

        // Update user stats
        uploader.totalPosts += 1;
        const oldBadge = uploader.badge;
        uploader.updateBadge();
        await uploader.save();

        // Create badge notification if badge changed
        if (uploader.badge !== oldBadge && uploader.badge !== 'none') {
          const Notification = (await import('../models/Notification.js')).default;
          await Notification.create({
            user: uploader._id,
            type: 'badge',
            title: 'New Badge Earned!',
            message: `Congratulations! You've earned the ${uploader.badge} seller badge!`,
            relatedId: uploader._id,
            relatedType: 'User'
          });
        }

        return res.status(201).json({ message: `${postType === 'forum' ? 'Post' : 'Note'} uploaded successfully`, note });

    } catch (error) {
        console.error("Error uploading note:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// GET ALL NOTES - Fixed response structure and field names
export const getAllNotes = async (req, res) => {
  try {
    const { postType, sortBy = 'recent' } = req.query;
    const filter = {};
    
    if (postType) {
      filter.postType = postType;
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'trending') {
      sort = { trendingScore: -1, createdAt: -1 };
    } else if (sortBy === 'likes') {
      sort = { likes: -1, createdAt: -1 };
    }

    const notes = await Note.find(filter)
      .populate('uploader', 'username _id badge profilePic')
      .populate('likes', 'username')
      .sort(sort)
      .select('title subject professor level uploaderUsername description alumni fileUrl fileKey images postType likes views comments trendingScore createdAt uploader');

    // Recalculate trending scores for all notes
    for (const note of notes) {
      note.trendingScore = calculateTrendingScore(note);
      await note.save();
    }

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get notes', error: err.message });
  }
};

export const likeNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user._id;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const likedIndex = note.likes.findIndex(id => id.toString() === userId.toString());
    const wasLiked = likedIndex !== -1;

    if (wasLiked) {
      note.likes.splice(likedIndex, 1);
      user.totalLikes = Math.max(0, user.totalLikes - 1);
    } else {
      note.likes.push(userId);
      user.totalLikes += 1;
    }

    // Recalculate trending score
    note.trendingScore = calculateTrendingScore(note);
    await note.save();

    // Update uploader's stats
    const uploader = await User.findById(note.uploader);
    if (uploader) {
      if (wasLiked) {
        uploader.totalLikes = Math.max(0, uploader.totalLikes - 1);
      } else {
        uploader.totalLikes += 1;
      }
      uploader.updateBadge();
      await uploader.save();
    }

    user.updateBadge();
    await user.save();

    res.status(200).json({
      message: "Note liked/unliked successfully",
      likes: note.likes,
      likesCount: note.likes.length,
      liked: !wasLiked
    });

  } catch (error) {
    console.error("Error liking note:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Error liking the note" });
  }
};

// SAVE/UNSAVE NOTE
export const saveNote = async (req, res) => {
  const userId = req.user._id;
  const noteId = req.params.id;

  try {
    const user = await User.findById(userId);
    const note = await Note.findById(noteId);

    if (!user || !note) {
      return res.status(404).json({ message: "User or note not found" });
    }

    const alreadySaved = user.savedNotes.includes(noteId);

    if (alreadySaved) {
      user.savedNotes.pull(noteId);
      await user.save();
      return res.json({
        message: 'Note removed from saved notes',
        saved: false
      });
    }

    user.savedNotes.push(noteId);
    await user.save();

    res.json({
      message: 'Note saved successfully',
      saved: true
    });

  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({ message: 'Failed to save note' });
  }
};

// GET SAVED NOTES
export const getSavedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedNotes',
        populate: { path: 'uploader', select: 'username _id' }
      });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user.savedNotes || []);
  } catch (error) {
    console.error('Get saved notes error:', error);
    res.status(500).json({ message: 'Failed to fetch saved notes' });
  }
};

// SEARCH & FILTER NOTES
export const searchAndFilterNotes = async (req, res) => {
  try {
    const { subject, professor, level, alumni, fileType, keyword } = req.query;

    const filter = {};

    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (professor) filter.professor = { $regex: professor, $options: 'i' };
    if (level) filter.level = level;
    if (alumni !== undefined) filter.alumni = alumni === 'true';
    if (fileType) filter.fileType = fileType;
    if (keyword) {
      filter.$or = [
        { description: { $regex: keyword, $options: 'i' } },
        { subject: { $regex: keyword, $options: 'i' } },
        { professor: { $regex: keyword, $options: 'i' } }
      ];
    }

    const notes = await Note.find(filter)
      .populate('uploader', 'username _id')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Search & Filter Error:', error);
    res.status(500).json({ message: 'Error fetching filtered notes' });
  }
};

// DELETE NOTE
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if(!note) return res.status(404).json({ message: "Note not found" });

        if(note.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to delete this note" });
        }

        // Delete file from S3 using fileKey
        if (note.fileKey) {
            await deleteFileFromS3(note.fileKey);
        } else {
            // Fallback to extracting key from URL
            await deleteFileFromS3(note.fileUrl);
        }

        await Note.findByIdAndDelete(req.params.id);

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE NOTE
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Check permission
    if (note.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this note' });
    }

    const { subject, professor, level, description, alumni } = req.body;

    if (subject) note.subject = subject;
    if (professor) note.professor = professor;
    if (level) note.level = level;
    if (description) note.description = description;
    if (alumni !== undefined) note.alumni = alumni === 'true';

    await note.save();

    res.json({ message: 'Note updated successfully', note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VIEW COUNT - Use 'views' consistently
export const viewNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.views = (note.views || 0) + 1;
    note.trendingScore = calculateTrendingScore(note);
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("View count error:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
};

// GET TRENDING POSTS
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Recalculate scores for all posts first
    const allNotes = await Note.find({ postType: 'forum' });
    for (const note of allNotes) {
      note.trendingScore = calculateTrendingScore(note);
      await note.save();
    }

    const trending = await Note.find({ postType: 'forum' })
      .populate('uploader', 'username _id badge profilePic')
      .populate('likes', 'username')
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('title description images likes views comments trendingScore createdAt uploader');

    res.status(200).json(trending);
  } catch (error) {
    console.error("Get trending error:", error);
    res.status(500).json({ message: "Failed to get trending posts" });
  }
};

// ADD COMMENT TO POST
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Post not found" });

    note.comments.push({
      user: userId,
      text: text.trim()
    });

    note.trendingScore = calculateTrendingScore(note);
    await note.save();

    const populatedNote = await Note.findById(id)
      .populate('comments.user', 'username profilePic badge')
      .populate('uploader', 'username _id badge profilePic');

    res.status(200).json({
      message: "Comment added successfully",
      note: populatedNote
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};