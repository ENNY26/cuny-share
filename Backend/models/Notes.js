import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  professor: { type: String },
  courseNumber: { type: String },
  level: { type: String },
  description: { type: String },
  alumni: { type: Boolean }, 
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderUsername: { type: String, required: true },
  uploaderEmail: { type: String },
  likes: { type: [String], default: [] },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
