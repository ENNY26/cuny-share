import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  // Forum post fields
  title: { type: String },
  subject: { type: String },
  professor: { type: String },
  courseNumber: { type: String },
  level: { type: String },
  description: { type: String },
  alumni: { type: Boolean }, 
  fileUrl: { type: String },
  fileType: { type: String },
  // Support multiple images for forum posts
  images: [{ type: String }],
  imageKeys: [{ type: String }],
  // Forum post type: 'note' or 'forum'
  postType: { type: String, enum: ['note', 'forum'], default: 'note' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderUsername: { type: String, required: true },
  uploaderEmail: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  // Trending score (calculated)
  trendingScore: { type: Number, default: 0 },
  // Comments for forum posts
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Index for trending queries
noteSchema.index({ trendingScore: -1, createdAt: -1 });
noteSchema.index({ likes: -1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;
