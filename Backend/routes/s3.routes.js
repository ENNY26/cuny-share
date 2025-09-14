import express from 'express';
import { getPresignedUrl } from '../controllers/s3.controller.js';
const router = express.Router();

router.get('/presigned-url', getPresignedUrl);

export default router;
