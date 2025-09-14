import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Generate pre-signed URL for a file
export const getPresignedUrl = (req, res) => {
  try {
    const { key } = req.query; // key = file path in S3

    if (!key) return res.status(400).json({ message: 'File key is required' });

    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 300, // URL valid for 5 minutes
    });

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate pre-signed URL' });
  }
};
