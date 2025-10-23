import mongoose from 'mongoose';

const textbookSchema = new mongoose.Schema({
  title: String,
  author: String,
  edition: String,
  condition: String,
  price: Number,
  isFlexible: Boolean,
  description: String,
  fileUrl: String,                 // first file (backward compat)
  fileKey: String,
  fileType: String,
  fileUrls: [String],             // new: array of uploaded file URLs
  fileKeys: [String],
  fileTypes: [String],
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderUsername: String,
  uploaderEmail: { type: String, index: true }, // store uploader's registered email
  createdAt: { type: Date, default: Date.now }
});

const Textbook = mongoose.model('Textbook', textbookSchema);
export default Textbook;
