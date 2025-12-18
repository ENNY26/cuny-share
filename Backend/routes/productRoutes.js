import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
// Use S3 upload for products in production, fallback to local in development
import s3UploadProducts from '../utils/s3UploadProducts.js';
import upload from '../middleware/upload.js'; // fallback for local development
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

// Use S3 upload if available, otherwise use local upload
// s3UploadProducts will be null if AWS credentials are not configured
const hasS3Config = s3UploadProducts && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET_NAME;
const productUpload = hasS3Config
  ? s3UploadProducts.array('files', 6)
  : upload.array('files', 6);

// Log which upload method is being used
console.log('Product upload middleware:', hasS3Config ? 'S3' : 'Local');

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err);
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 25MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum is 6 files.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    return res.status(400).json({ message: err.message || 'File upload failed' });
  }
  next();
};

router.get('/', auth, getProducts); // or make public by removing auth
router.post('/', auth, productUpload, handleUploadError, createProduct);
router.get('/:id', auth, getProductById);
router.put('/:id', auth, productUpload, handleUploadError, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.post('/:id/like', auth, likeProduct);
router.post('/:id/save', auth, saveProduct);

export default router;