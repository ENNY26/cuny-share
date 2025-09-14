import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  school: { type: String, required: true },
  level: { type: String, required: true },
  isAlumni: { type: Boolean, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
