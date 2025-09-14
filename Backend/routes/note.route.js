import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../utils/s3Upload.js'
import { deleteNote, getAllNotes, getSavedNotes, likeNote, saveNote, searchAndFilterNotes, updateNote, uploadNote, viewNote } from '../controllers/NotesController.js'

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadNote);
router.get('/', getAllNotes)
router.post('/:id/like', auth, likeNote)
router.get('/search', searchAndFilterNotes)
router.delete('/:id', auth, deleteNote);
router.put('/:id', auth, updateNote)
router.post('/:id/save', auth, saveNote);
router.get('/saved', auth, getSavedNotes);
router.get('/:id/view', viewNote);



export default router;