import Textbook from "../models/Textbook.js";
import User from "../models/User.js";

// File type mapping for better organization
const FILE_TYPES = {
  pdf: ['pdf'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  docx: ['doc', 'docx'],
  pptx: ['ppt', 'pptx'],
  xlsx: ['xls', 'xlsx'],
  other: []
};

// Helper function to determine file type
const getFileType = (extension) => {
  for (const [type, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }
  return 'other';
};

export const uploadTextbook = async (req, res) => {
  try {
    const { title, author, edition, condition, price, isFlexible } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const extension = req.file.originalname.split('.').pop().toLowerCase();
    const fileType = getFileType(extension);

    if (!title || !author || !edition || !condition || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const textbook = new Textbook({
      title,
      author,
      edition,
      condition,
      price: parseFloat(price),
      isFlexible: isFlexible === 'true' || isFlexible === true,
      fileUrl: req.file.location,
      fileType,
      uploader: req.user._id,
      uploaderUsername: req.user.username,
      uploaderEmail: req.user.email,
    });

    await textbook.save();
    
    // Populate uploader info for response
    await textbook.populate('uploader', 'username email');
    
    res.status(201).json({ 
      message: 'Textbook uploaded successfully', 
      textbook 
    });
    
  } catch (error) {
    console.error('Error uploading textbook:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
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