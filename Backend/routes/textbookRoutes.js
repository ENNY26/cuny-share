import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // your multer/s3 middleware
import { uploadTextbook, getAllTextbooks } from '../controllers/TextbookController.js';

const router = express.Router();

// change single -> array('files', maxCount)
router.post('/', auth, upload.array('files', 6), uploadTextbook);
router.get('/', getAllTextbooks);

export default router;
