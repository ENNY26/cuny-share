import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate pre-signed URL for a file
export const getPresignedUrl = async (req, res) => {
  try {
    const { key } = req.query; // key = file path in S3

    if (!key) return res.status(400).json({ message: 'File key is required' });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL valid for 5 minutes

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate pre-signed URL' });
  }
};
