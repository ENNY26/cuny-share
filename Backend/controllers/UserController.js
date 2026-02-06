import User from '../models/User.js';
import Product from '../models/Product.js';

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ message: 'Failed to get current user', error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // get user's listings
    const listings = await Product.find({ seller: id }).sort({ createdAt: -1 });

    // get user's saved products (if current user is requesting own profile)
    let saved = [];
    if (String(req.user?._id) === String(id)) {
      const me = await User.findById(id).populate({
        path: 'savedProducts',
        populate: { path: 'seller', select: 'username profilePic school badge' }
      });
      saved = me.savedProducts || [];
    }

    res.status(200).json({
      user,
      listings,
      saved,
      listingsCount: listings.length
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user?._id) !== String(id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { school, major, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { school, major, bio, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.status(200).json(user);
  } catch (err) {
    console.error('updateUserProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

export const addPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { points } },
      { new: true }
    ).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error('addPoints error:', err);
    res.status(500).json({ message: 'Failed to add points', error: err.message });
  }
};
