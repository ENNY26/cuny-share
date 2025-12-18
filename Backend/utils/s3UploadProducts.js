import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Only initialize S3 if credentials are available
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
  try {
    s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  } catch (err) {
    console.warn('Failed to initialize S3 client:', err.message);
    s3 = null;
  }
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
  }
};

// Only create S3 upload if S3 is configured, otherwise return null (will use local upload)
let upload = null;
if (s3 && process.env.AWS_BUCKET_NAME) {
  try {
    upload = multer({
      fileFilter,
      storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        // Removed acl: 'public-read' - use bucket policy instead for public access
        // ACLs are disabled by default on newer S3 buckets for security
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        // Generate unique key with timestamp and random hash to prevent collisions
        key: (req, file, cb) => {
          const timestamp = Date.now();
          const randomHash = crypto.randomBytes(8).toString('hex');
          const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `products/${timestamp}-${randomHash}-${sanitizedName}`;
          cb(null, filename);
        },
      }),
    });
  } catch (err) {
    console.warn('Failed to create S3 upload middleware:', err.message);
    upload = null;
  }
}

export default upload;

