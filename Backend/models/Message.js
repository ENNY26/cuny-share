// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Support both textbook (legacy) and product/note (new)
  textbook: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Textbook'
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product'
  },
  note: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note'
  },
  text: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationSentAt: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for better query performance
messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;