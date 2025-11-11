import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  school: { type: String, default: 'CUNY' }, // e.g., 'CCNY', 'Hunter', 'Baruch'
  major: { type: String, default: '' }, // e.g., 'Computer Science'
  profilePic: { type: String, default: null }, // URL
  badge: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'none'], default: 'none' },
  points: { type: Number, default: 0 }, // reward points
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
