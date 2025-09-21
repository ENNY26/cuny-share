import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';


export const sendMessage = async (req, res) => {
  try {
    const { recipient, text, textbook } = req.body;

    if (!recipient || !text || !textbook) {
      return res.status(400).json({ message: 'recipient, text and textbook are required' });
    }

    // validate ids to avoid Mongoose CastError / bad input
    if (!mongoose.Types.ObjectId.isValid(recipient) || !mongoose.Types.ObjectId.isValid(textbook)) {
      return res.status(400).json({ message: 'Invalid recipient or textbook id' });
    }

    // prevent sending to self (optional)
    if (String(req.user._id) === String(recipient)) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipient,
      textbook: textbook,
      text
    });

    await message.populate('sender', 'username profilePicture');

    // Ensure upsert creates a conversation with participants and textbook set
    await Conversation.findOneAndUpdate(
      {
        participants: { $all: [req.user._id, recipient] },
        textbook: textbook
      },
      {
        $set: {
          lastMessage: message._id,
          updatedAt: new Date()
        },
        $setOnInsert: {
          participants: [req.user._id, recipient],
          textbook
        }
      },
      { upsert: true, new: true }
    );

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

    if (!userId || !textbookId) {
      return res.status(400).json({ message: 'userId and textbookId are required' });
    }

    // validate ObjectId format to avoid Mongoose CastError
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(textbookId)) {
      return res.status(400).json({ message: 'Invalid userId or textbookId' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      textbook: textbookId
    })
      .populate('sender', 'username profilePicture')
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