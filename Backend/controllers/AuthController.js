import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import sendEmail from '../utils/sendEmail.js';


// SIGNUP FUNCTION

export const signup = async (req, res) => {
  const { name, username, school, level, isAlumni, email, password, signupQuestions } = req.body;

  // Validate required fields
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Trim email
  const trimmedEmail = email.trim().toLowerCase();
  console.log('signup called with email:', trimmedEmail);

  try {
    // Check if user with email already exists
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) return res.status(400).json({ message: 'User with this email already exists' });

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otpCode);

    // Remove any existing OTP for the email before creating new
    await OTP.deleteMany({ email: trimmedEmail, purpose: 'verify' });

    const otpRecord = await OTP.create({
      email: trimmedEmail,
      otp: otpCode,
      password: hashedPassword,
      name: name.trim(),
      username: username.trim(),
      school: school?.trim() || '',
      level: level?.trim() || '',
      isAlumni: isAlumni || false,
      signupQuestions: signupQuestions || {},
      purpose: 'verify',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    });
    console.log('OTP created in DB:', otpRecord._id);

    // Check email configuration before attempting to send
    if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
      console.error('❌ EMAIL CONFIGURATION MISSING IN PRODUCTION!');
      console.error('Missing variables:', {
        SMTP_USER: !process.env.SMTP_USER,
        SMTP_PWD: !process.env.SMTP_PWD,
        SENDER_EMAIL: !process.env.SENDER_EMAIL,
        NODE_ENV: process.env.NODE_ENV
      });
    }

    // In development, send email synchronously to catch errors immediately
    // In production, send asynchronously to prevent timeout issues
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      // Synchronous in development - wait for email to send so we can catch errors
      try {
        const emailResult = await sendEmail(trimmedEmail, 'Verify your CUNY Share Account', `Your OTP code is: ${otpCode}`);
        console.log('✅ Email sent successfully to:', trimmedEmail);
        console.log('Message ID:', emailResult?.messageId);
        console.log('OTP Code:', otpCode);
        res.status(200).json({ 
          message: 'OTP sent to email',
          debugOtp: otpCode // Include OTP in response for development
        });
      } catch (emailError) {
        console.error('❌ EMAIL SENDING FAILED:');
        console.error('To:', trimmedEmail);
        console.error('Error:', emailError.message);
        console.error('Error code:', emailError.code);
        console.error('Full error:', emailError);
        console.error('OTP Code (for debugging):', otpCode);
        // Still return success since OTP was created, but log the error
        res.status(200).json({ 
          message: 'OTP generated but email failed to send. Check server logs.',
          debugOtp: otpCode,
          emailError: emailError.message
        });
      }
    } else {
      // Asynchronous in production - don't wait for email
      sendEmail(trimmedEmail, 'Verify your CUNY Share Account', `Your OTP code is: ${otpCode}`)
        .then((result) => {
          console.log('✅ Email sent successfully to:', trimmedEmail);
          console.log('Message ID:', result?.messageId);
        })
        .catch((emailError) => {
          console.error('❌ EMAIL SENDING FAILED (non-blocking):');
          console.error('To:', trimmedEmail);
          console.error('Error:', emailError.message);
          console.error('Error code:', emailError.code);
          console.error('Full error:', emailError);
        });
      
      const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL;
      res.status(200).json({ 
        message: hasEmailConfig ? 'OTP sent to email' : 'OTP generated. Please check your email configuration.'
      });
    }
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};




// VERIFY OTP 
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedOtp = otp.trim();

  try {
    // ✅ Get the most recent OTP for this email with purpose 'verify'
    const existing = await OTP.findOne({ email: trimmedEmail, purpose: 'verify' }).sort({ createdAt: -1 });
    if (!existing) {
      console.error('OTP not found for email:', trimmedEmail);
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }

    console.log('Stored OTP:', existing.otp);
    console.log('Received OTP:', trimmedOtp);
    console.log('OTP expires at:', existing.expiresAt);
    console.log('Current time:', new Date());
    console.log('OTP is expired?', existing.expiresAt < new Date());

    // Check expiration first (more user-friendly)
    const now = new Date();
    if (existing.expiresAt < now) {
      console.error('OTP expired. Expires at:', existing.expiresAt, 'Current:', now);
      // Clean up expired OTP
      await OTP.deleteOne({ _id: existing._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Trim and compare (case-insensitive for better UX)
    const storedOtp = String(existing.otp).trim();
    const receivedOtp = trimmedOtp.trim();
    
    if (storedOtp !== receivedOtp) {
      console.error('OTP mismatch. Stored:', storedOtp, 'Received:', receivedOtp);
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Check if user already exists (might have been created between signup and verification)
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      await OTP.deleteMany({ email: trimmedEmail, purpose: 'verify' });
      return res.status(400).json({ message: 'User already exists. Please login instead.' });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username: existing.username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken. Please signup again with a different username.' });
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
    await OTP.deleteMany({ email: trimmedEmail, purpose: 'verify' });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Account verified and created', token, user: newUser });
  } catch (err) {
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists. Please try again.` });
    }
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// LOGIN FUNCTION

export const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: "Email and password are required"});
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
        const user = await User.findOne({ email: trimmedEmail });
        if(!user) return res.status(400).json({message: "User not found"});

        const isMatch = await bcrypt.compare(trimmedPassword, user.password);
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
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  console.log('forgotPassword called with email:', trimmedEmail);

  try {
    const user = await User.findOne({ email: trimmedEmail });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otpCode);

    await OTP.deleteMany({ email: trimmedEmail, purpose: 'reset' }); // Remove any existing OTP for this email
    const otpRecord = await OTP.create({
      email: trimmedEmail,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
      purpose: 'reset',
    });
    console.log('OTP created in DB:', otpRecord._id);

    // Check email configuration before attempting to send
    if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
      console.error('❌ EMAIL CONFIGURATION MISSING IN PRODUCTION!');
      console.error('Missing variables:', {
        SMTP_USER: !process.env.SMTP_USER,
        SMTP_PWD: !process.env.SMTP_PWD,
        SENDER_EMAIL: !process.env.SENDER_EMAIL,
        NODE_ENV: process.env.NODE_ENV
      });
    }

    // Send email asynchronously (non-blocking) to prevent timeout issues
    // Respond immediately to the client
    // In development, send email synchronously to catch errors immediately
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      // Synchronous in development - wait for email to send so we can catch errors
      try {
        const emailResult = await sendEmail(trimmedEmail, 'Reset your CUNY Share Password', `Your OTP code is: ${otpCode}`);
        console.log('✅ Email sent successfully to:', trimmedEmail);
        console.log('Message ID:', emailResult?.messageId);
        console.log('OTP Code:', otpCode);
        res.status(200).json({
          message: 'OTP sent to email',
          debugOtp: otpCode
        });
      } catch (emailError) {
        console.error('❌ EMAIL SENDING FAILED:');
        console.error('To:', trimmedEmail);
        console.error('Error:', emailError.message);
        console.error('Error code:', emailError.code);
        console.error('Full error:', emailError);
        console.error('OTP Code (for debugging):', otpCode);
        res.status(200).json({
          message: 'OTP generated but email failed to send. Check server logs.',
          debugOtp: otpCode,
          emailError: emailError.message
        });
      }
    } else {
      // Asynchronous in production
      sendEmail(trimmedEmail, 'Reset your CUNY Share Password', `Your OTP code is: ${otpCode}`)
        .then((result) => {
          console.log('✅ Email sent successfully to:', trimmedEmail);
          console.log('Message ID:', result?.messageId);
        })
        .catch((emailError) => {
          console.error('❌ EMAIL SENDING FAILED (non-blocking):');
          console.error('To:', trimmedEmail);
          console.error('Error:', emailError.message);
          console.error('Error code:', emailError.code);
          console.error('Full error:', emailError);
        });
      
      const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL;
      res.status(200).json({
        message: hasEmailConfig ? 'OTP sent to email' : 'OTP generated. Please check your email configuration.'
      });
    }

  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({message: 'server error', error: error.message});
  }
}

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedOtp = otp.trim();

  try {
    const existing = await OTP.findOne({ email: trimmedEmail, purpose: 'reset' }).sort({ createdAt: -1 });
    if (!existing) {
      console.error('Reset OTP not found for email:', trimmedEmail);
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }

    console.log('Stored Reset OTP:', existing.otp);
    console.log('Received OTP:', trimmedOtp);
    console.log('OTP expires at:', existing.expiresAt);
    console.log('Current time:', new Date());

    // Check expiration first
    const now = new Date();
    if (existing.expiresAt < now) {
      console.error('Reset OTP expired. Expires at:', existing.expiresAt, 'Current:', now);
      await OTP.deleteOne({ _id: existing._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Trim and compare
    const storedOtp = String(existing.otp).trim();
    const receivedOtp = trimmedOtp.trim();
    
    if (storedOtp !== receivedOtp) {
      console.error('Reset OTP mismatch. Stored:', storedOtp, 'Received:', receivedOtp);
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
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

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedOtp = otp.trim();

  try {
    const otpRecord = await OTP.findOne({ email: trimmedEmail, purpose: 'reset' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      console.error('Reset password OTP not found for email:', trimmedEmail);
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    console.log('Reset password - Stored OTP:', otpRecord.otp);
    console.log('Reset password - Received OTP:', trimmedOtp);

    // Check expiration first
    const now = new Date();
    if (otpRecord.expiresAt < now) {
      console.error('Reset password OTP expired');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Trim and compare
    const storedOtp = String(otpRecord.otp).trim();
    const receivedOtp = trimmedOtp.trim();
    if (storedOtp !== receivedOtp) {
      console.error('Reset password OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = await User.findOneAndUpdate(
      { email: trimmedEmail },
      { password: hashedPassword, isVerified: true }, // <-- Mark user as verified
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await OTP.deleteMany({ email: trimmedEmail, purpose: 'reset' });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  const { email, purpose = 'verify' } = req.body;

  console.log('resendOtp called with:', { email, purpose });

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    // Find existing OTP to preserve signup data if it's a verify purpose
    const existingOtp = await OTP.findOne({ email: trimmedEmail, purpose }).sort({ createdAt: -1 });
    console.log('Existing OTP found:', existingOtp ? 'Yes' : 'No');
    
    // If it's verify purpose and no existing OTP, user needs to signup again
    if (purpose === 'verify' && !existingOtp) {
      return res.status(400).json({ message: 'No signup found for this email. Please signup again.' });
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated new OTP:', otpCode);

    // Delete old OTP
    await OTP.deleteMany({ email: trimmedEmail, purpose });

    // Create new OTP, preserving signup data if it exists
    const newOtpData = {
      email: trimmedEmail,
      otp: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };

    // If resending for signup verification, preserve the signup data
    if (purpose === 'verify' && existingOtp) {
      newOtpData.password = existingOtp.password;
      newOtpData.name = existingOtp.name;
      newOtpData.username = existingOtp.username;
      newOtpData.school = existingOtp.school;
      newOtpData.level = existingOtp.level;
      newOtpData.isAlumni = existingOtp.isAlumni;
      newOtpData.signupQuestions = existingOtp.signupQuestions || {};
    }

    const createdOtp = await OTP.create(newOtpData);
    console.log('New OTP created in DB:', createdOtp._id);

    const emailSubject = purpose === 'reset' 
      ? 'Reset your CUNY Share Password' 
      : 'Verify your CUNY Share Account';
    
    // Check email configuration before attempting to send
    if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
      console.error('❌ EMAIL CONFIGURATION MISSING IN PRODUCTION!');
      console.error('Missing variables:', {
        SMTP_USER: !process.env.SMTP_USER,
        SMTP_PWD: !process.env.SMTP_PWD,
        SENDER_EMAIL: !process.env.SENDER_EMAIL,
        NODE_ENV: process.env.NODE_ENV
      });
    }

    // In development, send email synchronously to catch errors immediately
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      // Synchronous in development
      try {
        const emailResult = await sendEmail(trimmedEmail, emailSubject, `Your OTP code is: ${otpCode}`);
        console.log('✅ Email sent successfully for resend OTP to:', trimmedEmail);
        console.log('Message ID:', emailResult?.messageId);
        console.log('OTP Code:', otpCode);
        res.status(200).json({
          message: 'New OTP sent to email',
          debugOtp: otpCode
        });
      } catch (emailError) {
        console.error('❌ EMAIL SENDING FAILED:');
        console.error('To:', trimmedEmail);
        console.error('Error:', emailError.message);
        console.error('Error code:', emailError.code);
        console.error('Full error:', emailError);
        console.error('OTP Code (for debugging):', otpCode);
        res.status(200).json({
          message: 'New OTP generated but email failed to send. Check server logs.',
          debugOtp: otpCode,
          emailError: emailError.message
        });
      }
    } else {
      // Asynchronous in production
      sendEmail(trimmedEmail, emailSubject, `Your OTP code is: ${otpCode}`)
        .then((result) => {
          console.log('✅ Email sent successfully for resend OTP to:', trimmedEmail);
          console.log('Message ID:', result?.messageId);
        })
        .catch((emailError) => {
          console.error('❌ EMAIL SENDING FAILED (non-blocking):');
          console.error('To:', trimmedEmail);
          console.error('Error:', emailError.message);
          console.error('Error code:', emailError.code);
          console.error('Full error:', emailError);
        });
      
      const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL;
      res.status(200).json({
        message: hasEmailConfig ? 'New OTP sent to email' : 'New OTP generated. Please check your email configuration.'
      });
    }
  } catch (error) {
    console.error('resendOtp error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};
