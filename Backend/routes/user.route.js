import express from 'express';
import auth from '../middleware/auth.js';
import { getUserProfile, updateUserProfile, addPoints } from '../controllers/UserController.js';

const router = express.Router();

router.get('/:id', auth, getUserProfile);
router.put('/:id', auth, updateUserProfile);
router.post('/:id/points', auth, addPoints); // admin or system only

export default router;
