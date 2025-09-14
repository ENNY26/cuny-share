import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const fileFilter = (req, file, cb) =>{
    const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-powerpoint',
    
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      }else{
        cb(new Error('Invalid file type. Only PDF, JPEG, PNG, PPT, and Word documents are allowed.'), false);
      }
};
 const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },

        key: (req, file, cb) => {
            const filename = `notes/${Date.now()}-${file.originalname}`;
            cb(null, filename);       
         },
    }),

});
export default upload;