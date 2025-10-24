import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, default: 0 },
  category: { type: String, default: 'general' },
  condition: { type: String, enum: ['new', 'like-new', 'used', 'poor'], default: 'used' },
  location: { type: String },
  isAvailable: { type: Boolean, default: true },
  images: [{ type: String }], // array of file URLs
  imageKeys: [{ type: String }],
  fileTypes: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerUsername: { type: String },
  sellerEmail: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
export default Product;