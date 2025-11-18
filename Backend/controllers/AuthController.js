import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import sendEmail from '../utils/sendEmail.js';


// SIGNUP FUNCTION

export const signup = async (req, res) => {
  const { name, username, school, level, isAlumni, email, password, signupQuestions } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTP for the email before creating new
    await OTP.findOneAndDelete({ email });

    await OTP.create({
      email,
      otp: otpCode,
      password: hashedPassword,
      name,
      username,
      school,
      level,
      isAlumni,
      signupQuestions: signupQuestions || {},
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    });

    await sendEmail(email, 'Verify your CUNY Share Account', `Your OTP code is: ${otpCode}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};




// VERIFY OTP 
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // ✅ Get the most recent OTP for this email
    const existing = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!existing) return res.status(400).json({ message: 'OTP not found. Please request a new one.' });

    console.log('Stored OTP:', existing.otp);
    console.log('Received OTP:', otp);

    // Trim and compare
    if (existing.otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (existing.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // ✅ Create new user using OTP-stored data
    const newUser = new User({
      name: existing.name,
      username: existing.username,
      school: existing.school,
      level: existing.level,
      isAlumni: existing.isAlumni,
      email: existing.email,
      password: existing.password,
      signupQuestions: existing.signupQuestions || {},
      isVerified: true,
    });

    await newUser.save();

    // ✅ Delete all OTPs for this email
    await OTP.deleteMany({ email });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Account verified and created', token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// LOGIN FUNCTION

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email: email.trim() });
        if(!user) return res.status(400).json({message: "User not found"});

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if(!isMatch) {
            console.log(`Password mismatch for user ${email}`);
            return res.status(400).json({message: "Invalid credentials"});
        }

        // Auto-verify user if not already verified
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.status(200).json({token, user});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({message: "Server error", error: error.message});
    }
}


//FORGOT PWD

export const forgotPassword = async (req, res) => {

  const {email} = req.body;

  try {
    const user = await User.findOne({email});
    if(!user) return res.staqtus(404).json ({message: "User not found"});

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndDelete({email, purpose: 'reset'}); // Remove any existing OTP for this email
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
      purpose: 'reset',
    });

    await sendEmail(email, 'Reset your CUNY Share Password', `Your OTP code is: ${otpCode}`);

    res.status(200).json({message: 'OTP sent to email'});

  } catch (error) {
    res.status(500).json({message: 'server error', error: error.message});
  }
}

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const existing = await OTP.findOne({ email, purpose: 'reset' }).sort({ createdAt: -1 });
    if (!existing) return res.status(400).json({ message: 'OTP not found. Please request a new one.' });

    if (String(existing.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (existing.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    return res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    console.error('verifyResetOtp error:', err);
    return res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};
// RESET PASSWORD

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const otpRecord = await OTP.findOne({ email, purpose: 'reset' });
    if (!otpRecord) return res.status(400).json({ message: 'OTP not found or expired' });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

   const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, isVerified: true } // <-- Mark user as verified
    );
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  const { email, purpose = 'verify' } = req.body;

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndDelete({ email, purpose });

    await OTP.create({
      email,
      otp: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(email, `Your OTP for ${purpose}`, `Your OTP code is: ${otpCode}`);
    res.status(200).json({ message: 'New OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};
