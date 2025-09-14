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
  textbook: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Textbook', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for better query performance
messageSchema.index({ sender: 1, recipient: 1, textbook: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;