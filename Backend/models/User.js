import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  school: { type: String, default: 'CUNY' }, // e.g., 'CCNY', 'Hunter', 'Baruch'
  level: { type: String, default: '' }, // e.g., 'Freshman', 'Sophomore', 'Junior', 'Senior'
  isAlumni: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  major: { type: String, default: '' }, // e.g., 'Computer Science'
  profilePic: { type: String, default: null }, // URL
  badge: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'none'], default: 'none' },
  points: { type: Number, default: 0 }, // reward points
  bio: { type: String, default: '' },
  // Seller reliability metrics
  totalSales: { type: Number, default: 0 },
  totalPosts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, // Average rating from buyers
  ratingCount: { type: Number, default: 0 },
  // Saved items
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  // Optional signup questions
  signupQuestions: {
    whatWouldYouLikeToDo: { type: String, default: '' },
    howDidYouHearAboutUs: { type: String, default: '' },
    interests: [{ type: String }],
    additionalInfo: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Method to calculate and update badge
userSchema.methods.updateBadge = function() {
  const score = (this.totalSales * 10) + (this.totalPosts * 2) + (this.totalLikes * 1) + (this.rating * 5);
  
  if (score >= 500) {
    this.badge = 'platinum';
  } else if (score >= 200) {
    this.badge = 'gold';
  } else if (score >= 100) {
    this.badge = 'silver';
  } else if (score >= 50) {
    this.badge = 'bronze';
  } else {
    this.badge = 'none';
  }
  
  return this.badge;
};

const User = mongoose.model('User', userSchema);
export default User;
