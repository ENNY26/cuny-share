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
    });

    const result = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Full error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
