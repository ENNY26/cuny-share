import Note from "../models/Notes.js";
import User from "../models/User.js";
import { deleteFileFromS3 } from "../utils/s3Delete.js"; 

// UPLOAD NOTE
export const uploadNote = async (req, res) => {
    try {
        const { subject, professor, level, description, alumni, courseNumber, course } = req.body;

        if(!req.file){
            return res.status(400).json({ message: "File is required." });
        }

        const fileUrl = req.file.location;
        const fileKey = req.file.key; // Make sure this is being stored
        const fileType = req.file.mimetype;

        const note = new Note({
          subject,
          professor,
          level,
          description,
          alumni,
          courseNumber: courseNumber || course, // <- ensure stored
          fileUrl,
          fileKey,
          fileType,
          uploader: req.user._id,
        });

        await note.save();
        return res.status(201).json({ message: "Note uploaded successfully", note });

    } catch (error) {
        console.error("Error uploading note:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// GET ALL NOTES - Fixed response structure and field names
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploader', 'username _id') // Include _id for proper comparison
      .sort({ createdAt: -1 })
      .select('subject professor level uploaderUsername description alumni fileUrl fileKey likes views createdAt uploader');

    res.status(200).json(notes); // Return array directly
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

    const index = note.likes.indexOf(userId);
    if (index === -1) {
      note.likes.push(userId);
    } else {
      note.likes.splice(index, 1);
    }

    await note.save();
    res.status(200).json({
      message: "Note liked/unliked successfully",
      likes: note.likes,
      likesCount: note.likes.length
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
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("View count error:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
};