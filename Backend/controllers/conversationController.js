// controllers/conversationController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'username profilePicture')
    .populate('textbook', 'title price images')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

// Create or get conversation
export const createConversation = async (req, res) => {
  try {
    const { recipientId, textbookId } = req.body;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      textbook: textbookId
    })
    .populate('participants', 'username profilePicture')
    .populate('textbook', 'title price images')
    .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        textbook: textbookId
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username profilePicture')
        .populate('textbook', 'title price images')
        .populate('lastMessage');
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create conversation' });
  }
};

// Get a specific conversation
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username profilePicture')
      .populate('textbook', 'title price images')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
};