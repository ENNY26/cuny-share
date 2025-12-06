import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    console.log('Sending email to:', to);
    
    // Check if email configuration is set
    if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
      console.error('Email configuration missing:', {
        hasSMTP_USER: !!process.env.SMTP_USER,
        hasSMTP_PWD: !!process.env.SMTP_PWD,
        hasSENDER_EMAIL: !!process.env.SENDER_EMAIL
      });
      throw new Error('Email service is not configured. Please set SMTP_USER, SMTP_PWD, and SENDER_EMAIL environment variables.');
    }
    
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PWD, 
      },
      connectionTimeout: 10000, // 10 seconds timeout for connection
      greetingTimeout: 10000, // 10 seconds timeout for greeting
      socketTimeout: 10000, // 10 seconds timeout for socket
    });

    // Add timeout wrapper for sendMail
    const sendMailPromise = transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
    });

    // Wrap with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout: Request took too long')), 15000);
    });

    const result = await Promise.race([sendMailPromise, timeoutPromise]);

    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Full error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
