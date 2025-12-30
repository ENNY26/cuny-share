/**
 * Message Notification Scheduler
 * Checks for unread messages after 10 minutes and sends email notifications
 */

import Message from '../models/Message.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';

const NOTIFICATION_DELAY_MINUTES = 10; // 10 minutes delay before sending notification

/**
 * Check for unread messages that are 10+ minutes old and haven't received email notification
 */
export const checkAndSendMessageNotifications = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - NOTIFICATION_DELAY_MINUTES * 60 * 1000);
    
    // Find unread messages that:
    // 1. Are at least 10 minutes old
    // 2. Haven't had an email notification sent yet
    // 3. Are not from the recipient to themselves
    const unreadMessages = await Message.find({
      read: false,
      emailNotificationSent: false,
      createdAt: { $lte: tenMinutesAgo }
    })
    .populate('sender', 'username')
    .populate('recipient', 'email username')
    .sort({ createdAt: 1 });

    if (unreadMessages.length === 0) {
      return { checked: 0, sent: 0 };
    }

    console.log(`📧 Found ${unreadMessages.length} unread message(s) eligible for email notification`);

    let sentCount = 0;
    const frontendUrl = process.env.FRONTEND_URL || 'https://cunyshare.xyz';

    for (const message of unreadMessages) {
      try {
        // Skip if recipient doesn't have email
        if (!message.recipient?.email) {
          console.log(`⚠️ Skipping message ${message._id}: recipient has no email`);
          continue;
        }

        // Skip if sender and recipient are the same (shouldn't happen, but safety check)
        if (String(message.sender._id) === String(message.recipient._id)) {
          continue;
        }

        const senderUsername = message.sender?.username || 'Someone';
        const recipientUsername = message.recipient?.username || 'there';
        const messagePreview = message.text.length > 100 
          ? message.text.substring(0, 100) + '...' 
          : message.text;

        // Get context about what the message is about
        let listingContext = '';
        if (message.product) {
          const Product = (await import('../models/Product.js')).default;
          const productDoc = await Product.findById(message.product).select('title');
          if (productDoc) {
            listingContext = ` about your listing "${productDoc.title}"`;
          }
        } else if (message.textbook) {
          const Textbook = (await import('../models/Textbook.js')).default;
          const textbookDoc = await Textbook.findById(message.textbook).select('title');
          if (textbookDoc) {
            listingContext = ` about your textbook "${textbookDoc.title}"`;
          }
        } else if (message.note) {
          try {
            const Note = (await import('../models/Notes.js')).default;
            const noteDoc = await Note.findById(message.note).select('title');
            if (noteDoc) {
              listingContext = ` about your note "${noteDoc.title}"`;
            }
          } catch (err) {
            // Note might not exist
          }
        }

        const subject = `New Message Awaits You - CUNY Share`;
        const emailText = `Hello ${recipientUsername},

You have an unread message from ${senderUsername}${listingContext} on CUNY Share.

Message Preview:
"${messagePreview}"

This message was sent ${Math.round((Date.now() - message.createdAt) / 60000)} minutes ago and is waiting for you in the app.

View and respond to this message:
${frontendUrl}/messages

Thank you for using CUNY Share!

Best regards,
CUNY Share Team

---
You're receiving this because you have an unread message. Reply in the app to continue the conversation.`;

        // Send email notification
        await sendEmail(message.recipient.email, subject, emailText);

        // Mark email notification as sent
        message.emailNotificationSent = true;
        message.emailNotificationSentAt = new Date();
        await message.save();

        sentCount++;
        console.log(`✅ Sent email notification for message ${message._id} to ${message.recipient.email}`);

      } catch (error) {
        console.error(`❌ Failed to send email notification for message ${message._id}:`, error.message);
        // Don't mark as sent if email failed - will retry on next check
      }
    }

    console.log(`📧 Email notification check complete: ${sentCount} notification(s) sent`);
    return { checked: unreadMessages.length, sent: sentCount };

  } catch (error) {
    console.error('❌ Error in message notification scheduler:', error);
    return { checked: 0, sent: 0, error: error.message };
  }
};

/**
 * Start the scheduler - runs every minute
 */
export const startMessageNotificationScheduler = () => {
  console.log('🕐 Starting message notification scheduler (checks every minute for 10+ minute old unread messages)');
  
  // Run immediately on start (optional - you can remove this if you don't want it)
  // checkAndSendMessageNotifications();
  
  // Then run every minute
  setInterval(async () => {
    await checkAndSendMessageNotifications();
  }, 60 * 1000); // 60 seconds = 1 minute
};

