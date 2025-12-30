import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIO, getUserSockets } from '../utils/socket.js';
import sendEmail from '../utils/sendEmail.js';


export const sendMessage = async (req, res) => {
  try {
    const { recipient, text, textbook, product, note } = req.body;

    if (!recipient || !text) {
      return res.status(400).json({ message: 'recipient and text are required' });
    }

    // At least one context (textbook, product, or note) should be provided
    if (!textbook && !product && !note) {
      return res.status(400).json({ message: 'textbook, product, or note is required' });
    }

    // validate ids to avoid Mongoose CastError / bad input
    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({ message: 'Invalid recipient id' });
    }

    // prevent sending to self (optional)
    if (String(req.user._id) === String(recipient)) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const messageData = {
      sender: req.user._id,
      recipient: recipient,
      text
    };

    if (textbook) messageData.textbook = textbook;
    if (product) messageData.product = product;
    if (note) messageData.note = note;

    const message = await Message.create(messageData);
    await message.populate('sender', 'username profilePic badge');

    // Build conversation query
    const conversationQuery = {
      participants: { $all: [req.user._id, recipient] }
    };

    if (textbook) conversationQuery.textbook = textbook;
    if (product) conversationQuery.product = product;
    if (note) conversationQuery.note = note;

    // Find existing conversation by participants + context, update or create
    const conversationData = { participants: { $all: [req.user._id, recipient] } };
    if (textbook) conversationData.textbook = textbook;
    if (product) conversationData.product = product;
    if (note) conversationData.note = note;

    const existingConv = await Conversation.findOne(conversationData);
    if (existingConv) {
      existingConv.lastMessage = message._id;
      existingConv.updatedAt = new Date();
      await existingConv.save();
    } else {
      const newConv = {
        participants: [req.user._id, recipient],
        lastMessage: message._id,
        updatedAt: new Date()
      };
      if (textbook) newConv.textbook = textbook;
      if (product) newConv.product = product;
      if (note) newConv.note = note;
      await Conversation.create(newConv);
    }

    // Create an in-app notification for the recipient
    try {
      await Notification.create({
        user: recipient,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${req.user.username || 'someone'}`,
        relatedId: message._id,
        relatedType: 'Message'
      });

      // Note: Email notifications are handled by the message notification scheduler
      // which sends emails after 10 minutes if the message remains unread
      // This prevents immediate email spam and gives users time to respond in-app

      // Emit socket events if io is available
      const io = getIO();
      const userSockets = getUserSockets();
      if (io) {
        const recipientSocketId = userSockets.get(String(recipient));
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', message);
          io.to(recipientSocketId).emit('new_notification', {
            type: 'message',
            title: 'New Message',
            message: `You have a new message from ${req.user.username || 'someone'}`,
            relatedId: message._id
          });
        }
        
        // Also emit to recipient's personal room (more reliable)
        io.to(`user_${recipient}`).emit('new_message', message);
        io.to(`user_${recipient}`).emit('new_notification', {
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${req.user.username || 'someone'}`,
          relatedId: message._id
        });
      }
    } catch (notifyErr) {
      console.error('Failed to create/emit notification:', notifyErr);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    const textbookId = req.query.textbookId || req.query.textbook;
    const productId = req.query.productId || req.query.product;
    const noteId = req.query.noteId || req.query.note;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // At least one context should be provided
    if (!textbookId && !productId && !noteId) {
      return res.status(400).json({ message: 'textbookId, productId, or noteId is required' });
    }

    // validate ObjectId format to avoid Mongoose CastError
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const messageQuery = {
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    };

    if (textbookId) {
      if (!mongoose.Types.ObjectId.isValid(textbookId)) {
        return res.status(400).json({ message: 'Invalid textbookId' });
      }
      messageQuery.textbook = textbookId;
    }
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid productId' });
      }
      messageQuery.product = productId;
    }
    if (noteId) {
      if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({ message: 'Invalid noteId' });
      }
      messageQuery.note = noteId;
    }

    const messages = await Message.find(messageQuery)
      .populate('sender', 'username profilePic badge')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'messageIds array required' });
    }

    // validate ids array
    const invalid = messageIds.some(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalid) {
      return res.status(400).json({ message: 'One or more messageIds are invalid' });
    }

    await Message.updateMany(
      { _id: { $in: messageIds }, recipient: req.user._id },
      { read: true }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ message: 'Failed to mark messages as read', error: err.message });
  }
};