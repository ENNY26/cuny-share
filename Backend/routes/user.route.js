import express from 'express';
import auth from '../middleware/auth.js';
import { getUserProfile } from '../controllers/UserController.js';

const router = express.Router();

// Protected route to get profile
router.get('/profile', auth, getUserProfile);

export default router;
