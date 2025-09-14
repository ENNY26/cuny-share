// routes/conversationRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import {
  getConversations,
  createConversation,
  getConversation
} from '../controllers/conversationController.js';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', auth, getConversations);

// Create a new conversation or get existing one
router.post('/', auth, createConversation);

// Get a specific conversation
router.get('/:id', auth, getConversation);

export default router;