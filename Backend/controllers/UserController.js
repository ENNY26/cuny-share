import User from '../models/User.js';
import Note from '../models/Notes.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // Get basic user info
    const user = await User.findById(userId).select('-password -verificationCode');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's uploaded notes
    const notes = await Note.find({ uploader: userId });

    // (Later) Get user's uploaded textbooks
    // const textbooks = await Textbook.find({ uploader: userId });

    res.json({
      user,
      contributions: {
        notes,
        textbooks: [] // placeholder for now
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
