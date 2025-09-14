// routes/messageRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  markAsRead
} from '../controllers/messageController.js';

const router = express.Router();

// Send a message
router.post('/', auth, sendMessage);

// Get messages for a conversation
router.get('/', auth, getMessages);

// Mark messages as read
router.patch('/read', auth, markAsRead);

export default router;