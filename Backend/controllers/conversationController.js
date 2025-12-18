// controllers/conversationController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'username profilePic badge')
    .populate('textbook', 'title price images')
    .populate('product', 'title price images')
    .populate('note', 'title description images')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username profilePic badge'
      }
    })
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ message: 'Failed to fetch conversations', error: err.message });
  }
};

// Create or get conversation
export const createConversation = async (req, res) => {
  try {
    const { recipientId, textbookId, productId, noteId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    if (!textbookId && !productId && !noteId) {
      return res.status(400).json({ message: 'textbookId, productId, or noteId is required' });
    }

    const conversationQuery = {
      participants: { $all: [req.user._id, recipientId] }
    };

    if (textbookId) conversationQuery.textbook = textbookId;
    if (productId) conversationQuery.product = productId;
    if (noteId) conversationQuery.note = noteId;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne(conversationQuery)
    .populate('participants', 'username profilePic badge')
    .populate('textbook', 'title price images')
    .populate('product', 'title price images')
    .populate('note', 'title description images')
    .populate('lastMessage');

    if (!conversation) {
      const conversationData = {
        participants: [req.user._id, recipientId]
      };
      if (textbookId) conversationData.textbook = textbookId;
      if (productId) conversationData.product = productId;
      if (noteId) conversationData.note = noteId;

      conversation = await Conversation.create(conversationData);
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username profilePic badge')
        .populate('textbook', 'title price images')
        .populate('product', 'title price images')
        .populate('note', 'title description images')
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
      .populate('participants', 'username profilePic badge')
      .populate('textbook', 'title price images')
      .populate('product', 'title price images')
      .populate('note', 'title description images')
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