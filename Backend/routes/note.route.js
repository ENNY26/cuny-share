import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../utils/s3Upload.js'
import { deleteNote, getAllNotes, getSavedNotes, likeNote, saveNote, searchAndFilterNotes, updateNote, uploadNote, viewNote, getTrendingPosts, addComment } from '../controllers/NotesController.js'

const router = express.Router();

// Handle both single file (legacy notes) and multiple files (forum posts)
router.post('/upload', auth, (req, res, next) => {
  // Use fields to handle both 'file' and 'files'
  upload.fields([{ name: 'files', maxCount: 5 }, { name: 'file', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, uploadNote);
router.get('/', getAllNotes)
router.get('/trending', getTrendingPosts)
router.get('/search', searchAndFilterNotes)
router.get('/saved', auth, getSavedNotes);
router.post('/:id/like', auth, likeNote)
router.post('/:id/comment', auth, addComment)
router.delete('/:id', auth, deleteNote);
router.put('/:id', auth, updateNote)
router.post('/:id/save', auth, saveNote);
router.get('/:id/view', viewNote);



export default router;