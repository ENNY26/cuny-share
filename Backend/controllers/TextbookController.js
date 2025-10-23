import Textbook from '../models/Textbook.js';
import { getFileType } from './helpers.js'; // assume helper exists or inline

export const uploadTextbook = async (req, res) => {
  try {
    const { title, author, edition, condition, price, isFlexible, description } = req.body;

    // ensure files exist (supports multer array upload)
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: 'At least one file is required' });
    }

    // map uploaded files (S3 or local). adjust keys to your multer file properties
    const fileUrls = files.map(f => f.location || f.path || f.url);
    const fileKeys = files.map(f => f.key || f.filename || null);
    const fileTypes = files.map(f => getFileType((f.mimetype || f.originalname || '').split('/').pop()));

    // create textbook - keep backward-compatible single-file fields using first item
    const newTextbook = new Textbook({
      title,
      author,
      edition,
      condition,
      price: price ? Number(price) : undefined,
      isFlexible: isFlexible === 'true' || isFlexible === true,
      description,
      fileUrl: fileUrls[0],
      fileKey: fileKeys[0],
      fileType: fileTypes[0],
      fileUrls,
      fileKeys,
      fileTypes,
      uploader: req.user._id,
      uploaderUsername: req.user.username,
      uploaderEmail: req.user.email
    });

    await newTextbook.save();
    res.status(201).json(newTextbook);
  } catch (err) {
    console.error('uploadTextbook error:', err);
    res.status(500).json({ message: 'Failed to upload textbook', error: err.message });
  }
};

// Get all textbooks with pagination
export const getAllTextbooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const textbooks = await Textbook.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploader', 'username email');
    
    const total = await Textbook.countDocuments();
    
    res.json({
      textbooks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTextbooks: total
    });
  } catch (error) {
    console.error('Failed to fetch textbooks:', error);
    res.status(500).json({ 
      message: 'Failed to fetch textbooks', 
      error: error.message 
    });
  }
};

// Get textbook by ID
export const getTextbookById = async (req, res) => {
  try {
    const textbook = await Textbook.findById(req.params.id)
      .populate('uploader', 'username email');
    
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found' });
    }
    
    res.json(textbook);
  } catch (error) {
    console.error('Failed to fetch textbook:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid textbook ID' });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch textbook', 
      error: error.message 
    });
  }
};

// Delete Textbook
export const deleteTextbook = async (req, res) => {
  try {
    const textbook = await Textbook.findById(req.params.id);
    
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found' });
    }
    
    // Check if user is authorized to delete
    if (textbook.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Textbook.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Textbook deleted successfully' });
  } catch (error) {
    console.error('Failed to delete textbook:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid textbook ID' });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete textbook', 
      error: error.message 
    });
  }
};