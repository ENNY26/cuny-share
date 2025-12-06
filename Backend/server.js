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
import s3Routes from './routes/s3.routes.js';
import messageRoutes from './routes/message.routes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import User from './models/User.js';
import { setIO, getUserSockets } from './utils/socket.js';
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// List all allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cuny-share.vercel.app',
  process.env.FRONTEND_URL // optional, for prod
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
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


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});



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

      // Emit notification to recipient if online
      const recipientSocketId = userSockets.get(recipient);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', message);
        io.to(recipientSocketId).emit('new_notification', {
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${socket.user.username}`
        });
      }

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
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('DB Connection Failed:', err));
