import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // expect upload.array('files', max)
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  likeProduct,
  saveProduct
} from '../controllers/productsController.js';

const router = express.Router();

router.get('/', auth, getProducts); // or make public by removing auth
router.post('/', auth, upload.array('files', 6), createProduct);
router.get('/:id', auth, getProductById);
router.put('/:id', auth, upload.array('files', 6), updateProduct);
router.delete('/:id', auth, deleteProduct);
router.post('/:id/like', auth, likeProduct);
router.post('/:id/save', auth, saveProduct);

export default router;