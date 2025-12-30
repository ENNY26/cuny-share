import sendEmail from '../utils/sendEmail.js';

/**
 * Submit feedback from users
 */
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Prepare email content
    const feedbackEmail = process.env.FEEDBACK_EMAIL || 'eniolaorehin65@gmail.com';
    const emailSubject = `CUNY Share Feedback: ${subject || 'General Feedback'}`;
    
    const emailBody = `
New feedback submitted on CUNY Share:

From: ${name || 'Anonymous'} (${email})
Type: ${type || 'General'}
Subject: ${subject || 'No subject'}

Message:
${message}

---
Submitted on: ${new Date().toLocaleString()}
User Agent: ${req.headers['user-agent'] || 'Unknown'}
IP Address: ${req.ip || req.connection.remoteAddress || 'Unknown'}
    `.trim();

    try {
      // Send feedback email
      await sendEmail(feedbackEmail, emailSubject, emailBody);
      
      console.log(`✅ Feedback submitted from ${email}`);
      
      res.status(200).json({ 
        message: 'Thank you for your feedback! We appreciate your input.',
        success: true 
      });
    } catch (emailError) {
      console.error('❌ Failed to send feedback email:', emailError);
      // Still return success to user, but log the error
      res.status(200).json({ 
        message: 'Thank you for your feedback! We have received it.',
        success: true,
        note: 'Email delivery may be delayed'
      });
    }

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ 
      message: 'Failed to submit feedback. Please try again later.',
      error: error.message 
    });
  }
};

