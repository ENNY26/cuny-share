// controllers/messageController.js
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { recipient, text, textbook } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      recipient,
      textbook,
      text
    });
    
    // Populate the message with sender info
    await message.populate('sender', 'username profilePicture');
    
    // Update the conversation's last message
    await Conversation.findOneAndUpdate(
      {
        participants: { $all: [req.user._id, recipient] },
        textbook: textbook
      },
      {
        lastMessage: message._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const { userId, textbookId } = req.query;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      textbook: textbookId
    })
    .populate('sender', 'username profilePicture')
    .sort('createdAt');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    await Message.updateMany(
      { _id: { $in: messageIds }, recipient: req.user._id },
      { read: true }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};