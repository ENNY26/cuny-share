import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../utils/s3Upload.js';
import {
  uploadTextbook,
  getAllTextbooks,
  getTextbookById,
  deleteTextbook
} from '../controllers/TextbookController.js';

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadTextbook);
router.get('/', getAllTextbooks);
router.get('/:id', getTextbookById);
router.delete('/:id', auth, deleteTextbook);

export default router;
