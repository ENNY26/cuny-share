import mongoose from 'mongoose';

const textbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  edition: { type: String },
  condition: { type: String }, // e.g., New, Good, Used
  price: { type: Number }, // optional
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // pdf, docx, pptx, image
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderUsername: { type: String, required: true },
  uploaderEmail: { type: String },
  isFlexible: { type: Boolean, default: false }, // for exchange flexibility
  likes: { type: [String], default: [] },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const Textbook = mongoose.model('Textbook', textbookSchema);
export default Textbook;
