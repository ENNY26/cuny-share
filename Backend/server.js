import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import noteRoutes from './routes/note.route.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.route.js';
import textbookRoutes from './routes/textbookRoutes.js'
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import s3Routes from './routes/s3.routes.js';
import messageRoutes from './routes/message.routes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import policyRoutes from './routes/policy.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import User from './models/User.js';
import { setIO, getUserSockets } from './utils/socket.js';
import { startMessageNotificationScheduler } from './utils/messageNotificationScheduler.js';
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// List all allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cuny-share.vercel.app',
  'https://cunyshare.xyz',
  'https://www.cunyshare.xyz',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
].filter(Boolean); // Remove any undefined values

// Helper function to normalize origin (remove trailing slash and normalize www)
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  // Remove trailing slash and normalize to lowercase for comparison
  return origin.replace(/\/$/, '').toLowerCase();
};

// Helper to get domain without www for comparison
const getBaseDomain = (url) => {
  return url.replace(/^https?:\/\/(www\.)?/, '').toLowerCase();
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    const originBaseDomain = getBaseDomain(origin);
    
    // Check if origin matches any allowed origin (exact match or same base domain)
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = normalizeOrigin(allowed);
      const allowedBaseDomain = getBaseDomain(allowed);
      
      // Exact match or same base domain (handles www variations)
      return normalizedOrigin === normalizedAllowed || originBaseDomain === allowedBaseDomain;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/textbook', textbookRoutes);
app.use('/api/s3', s3Routes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Email configuration diagnostic endpoint (for debugging)
app.get('/api/email-config', (req, res) => {
  const config = {
    hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
    hasSMTP_USER: !!process.env.SMTP_USER,
    hasSMTP_PWD: !!process.env.SMTP_PWD,
    hasSENDER_EMAIL: !!process.env.SENDER_EMAIL,
    SMTP_USER_preview: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}...` : 'NOT SET',
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'NOT SET',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    isResendConfigured: !!process.env.RESEND_API_KEY,
    isSMTPConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL),
    recommendation: process.env.RESEND_API_KEY 
      ? 'Using Resend API (recommended)' 
      : process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL
        ? (process.env.NODE_ENV === 'production' 
          ? 'Using SMTP (may fail on hosting platforms - consider Resend API)' 
          : 'Using SMTP (OK for local development)')
        : 'No email service configured'
  };
  
  res.status(200).json(config);
});

// Serve static files from frontend build directory (if it exists)
// This handles production builds where frontend is served from backend
const frontendBuildPath = path.join(process.cwd(), '..', 'Frontend', 'Frontend', 'dist');

// Check if frontend build directory exists and serve static files
if (existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  
  // Catch-all handler: send back React's index.html file for any non-API routes
  // This is essential for client-side routing to work on page reload
  // MUST be placed after all other routes to avoid intercepting API calls
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes (shouldn't happen due to route order, but safety check)
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id username profilePic badge');
    if (!user) {
      return next(new Error('User not found'));
    }
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Make io available to controllers
setIO(io);

// Socket.io connection handling
const userSockets = getUserSockets(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  userSockets.set(socket.userId, socket.id);

  // Join user's personal room
  socket.join(`user_${socket.userId}`);

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { recipient, text, product, note, textbook } = data;

      if (!recipient || !text) {
        socket.emit('error', { message: 'Recipient and text are required' });
        return;
      }

      const messageData = {
        sender: socket.userId,
        recipient,
        text
      };

      if (textbook) messageData.textbook = textbook;
      if (product) messageData.product = product;
      if (note) messageData.note = note;

      const message = await Message.create(messageData);
      await message.populate('sender', 'username profilePic badge');

      // Update conversation
      // Find existing conversation by participants + context, update or create
      const conversationQuery = {
        participants: { $all: [socket.userId, recipient] }
      };
      if (textbook) conversationQuery.textbook = textbook;
      if (product) conversationQuery.product = product;
      if (note) conversationQuery.note = note;

      const existingConv = await Conversation.findOne(conversationQuery);
      if (existingConv) {
        existingConv.lastMessage = message._id;
        existingConv.updatedAt = new Date();
        await existingConv.save();
      } else {
        const newConv = {
          participants: [socket.userId, recipient],
          lastMessage: message._id,
          updatedAt: new Date()
        };
        if (textbook) newConv.textbook = textbook;
        if (product) newConv.product = product;
        if (note) newConv.note = note;
        await Conversation.create(newConv);
      }

      // Create notification for recipient
      const Notification = (await import('./models/Notification.js')).default;
      await Notification.create({
        user: recipient,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${socket.user.username}`,
        relatedId: message._id,
        relatedType: 'Message'
      });

      // Note: Email notifications are handled by the message notification scheduler
      // which sends emails after 10 minutes if the message remains unread
      // This prevents immediate email spam and gives users time to respond in-app

      // Emit notification to recipient if online
      const recipientSocketId = userSockets.get(String(recipient));
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', message);
        io.to(recipientSocketId).emit('new_notification', {
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${socket.user.username}`,
          relatedId: message._id
        });
      }
      
      // Also emit to recipient's personal room
      io.to(`user_${recipient}`).emit('new_message', message);
      io.to(`user_${recipient}`).emit('new_notification', {
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${socket.user.username}`,
        relatedId: message._id
      });

      // Confirm to sender
      socket.emit('message_sent', message);
    } catch (error) {
      console.error('Socket send_message error:', error);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { recipient, isTyping } = data;
    const recipientSocketId = userSockets.get(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    userSockets.delete(socket.userId);
  });
});

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  
  // Start message notification scheduler
  startMessageNotificationScheduler();
  
  // Email configuration check
  const isProduction = process.env.NODE_ENV === 'production';
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSMTP = !!(process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL);
  
  console.log('\n📧 Email Configuration Status:');
  if (hasResend) {
    console.log('✅ Resend API: Configured (Recommended for production)');
  } else {
    console.log('❌ Resend API: NOT configured');
    if (isProduction) {
      console.log('⚠️  WARNING: Resend API is recommended for production hosting platforms');
      console.log('⚠️  Get your API key at: https://resend.com/api-keys');
    }
  }
  
  if (hasSMTP) {
    console.log('✅ SMTP: Configured');
    if (isProduction && !hasResend) {
      console.log('⚠️  WARNING: SMTP connections often fail on hosting platforms (Render, Heroku, etc.)');
      console.log('⚠️  SMTP ports (587, 465) may be blocked by your hosting provider');
      console.log('⚠️  RECOMMENDED: Set RESEND_API_KEY for reliable email delivery');
    }
  } else {
    console.log('❌ SMTP: NOT configured');
  }
  
  if (!hasResend && !hasSMTP) {
    console.log('❌ ERROR: No email service configured!');
    console.log('❌ Set either RESEND_API_KEY (recommended) or SMTP credentials');
  }
  console.log('');
  
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('DB Connection Failed:', err));
