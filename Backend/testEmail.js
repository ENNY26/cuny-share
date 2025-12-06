import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testEmail = async () => {
  try {
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PWD:', process.env.SMTP_PWD ? '***' : 'NOT SET');
    console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
      },
    });

    console.log('Testing email connection...');
    const result = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: 'eniolaorehin65@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email to verify SMTP configuration',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
};

testEmail();
