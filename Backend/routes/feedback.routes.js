import express from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// Feedback route (public, no authentication required)
router.post('/submit', submitFeedback);

export default router;

