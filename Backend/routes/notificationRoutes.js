import express from 'express';
import auth from '../middleware/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.get('/unread/count', auth, getUnreadCount);
router.patch('/:id/read', auth, markAsRead);
router.patch('/read/all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);

export default router;

