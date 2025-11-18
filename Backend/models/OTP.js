import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  password: { type: String },
  name: { type: String },
  username: { type: String },
  school: { type: String },
  level: { type: String },
  isAlumni: { type: Boolean },
  signupQuestions: {
    whatWouldYouLikeToDo: { type: String },
    howDidYouHearAboutUs: { type: String },
    interests: [{ type: String }],
    additionalInfo: { type: String }
  },
  purpose: { type: String, enum: ['verify', 'reset'], default: 'verify' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const OTP = mongoose.model('OTP', OTPSchema);
export default OTP;
