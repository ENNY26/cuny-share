import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send email using Resend API (recommended for production/hosting platforms)
 */
const sendEmailViaResend = async (to, subject, text) => {
  if (!resend) {
    throw new Error('Resend API key not configured. Set RESEND_API_KEY environment variable.');
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SENDER_EMAIL || 'onboarding@resend.dev';
  
  console.log('📧 Sending email via Resend API to:', to);
  console.log('From:', fromEmail);
  
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: subject,
    text: text,
  });

  if (error) {
    console.error('❌ Resend API error:', error);
    throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
  }

  console.log('✅ Email sent successfully via Resend!');
  console.log('Message ID:', data?.id);
  return { messageId: data?.id, success: true };
};

/**
 * Send email using SMTP (fallback for local development)
 */
const sendEmailViaSMTP = async (to, subject, text, retries = 2) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Longer timeouts for production environments
  const connectionTimeout = isProduction ? 30000 : 10000; // 30s for prod, 10s for dev
  const greetingTimeout = isProduction ? 30000 : 10000;
  const socketTimeout = isProduction ? 30000 : 10000;
  const sendTimeout = isProduction ? 45000 : 15000; // 45s for prod, 15s for dev

  // Check if email configuration is set
  if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
    throw new Error('SMTP configuration missing. Please set SMTP_USER, SMTP_PWD, and SENDER_EMAIL environment variables.');
  }
  
  // Try port 587 first (TLS), fallback to 465 (SSL) if needed
  const trySendEmail = async (port, secure) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PWD, 
      },
      connectionTimeout: connectionTimeout,
      greetingTimeout: greetingTimeout,
      socketTimeout: socketTimeout,
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      requireTLS: !secure,
    });

    // Verify connection first
    try {
      console.log(`🔌 Verifying SMTP connection on port ${port}...`);
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError.message);
      throw new Error(`SMTP connection verification failed: ${verifyError.message}`);
    }

    // Send email with timeout
    const sendMailPromise = transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), sendTimeout);
    });

    return await Promise.race([sendMailPromise, timeoutPromise]);
  };

  // Try port 587 first
  try {
    return await trySendEmail(587, false);
  } catch (error) {
    console.warn('Failed to send via port 587, trying port 465:', error.message);
    try {
      return await trySendEmail(465, true);
    } catch (sslError) {
      if (retries > 0) {
        console.log(`Retrying email send (${retries} retries left)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return sendEmailViaSMTP(to, subject, text, retries - 1);
      }
      throw sslError;
    }
  }
};

/**
 * Main email sending function
 * Uses Resend API if available (recommended for production), falls back to SMTP
 */
const sendEmail = async (to, subject, text) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('📧 Attempting to send email to:', to);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Prefer Resend API if available (works better on hosting platforms like Render)
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Using Resend API (recommended for production)');
      try {
        return await sendEmailViaResend(to, subject, text);
      } catch (resendError) {
        console.warn('⚠️ Resend API failed, falling back to SMTP:', resendError.message);
        // Fall through to SMTP fallback
      }
    } else if (isProduction) {
      console.warn('⚠️ WARNING: RESEND_API_KEY not set in production!');
      console.warn('⚠️ SMTP connections often fail on hosting platforms (Render, Heroku, etc.)');
      console.warn('⚠️ RECOMMENDED: Set RESEND_API_KEY environment variable for reliable email delivery');
      console.warn('⚠️ Get your API key at: https://resend.com/api-keys');
    }
    
    // Fallback to SMTP (works better for local development)
    if (process.env.SMTP_USER && process.env.SMTP_PWD && process.env.SENDER_EMAIL) {
      console.log('📧 Using SMTP fallback...');
      if (isProduction) {
        console.warn('⚠️ SMTP may fail due to hosting platform restrictions');
      }
      const result = await sendEmailViaSMTP(to, subject, text);
      console.log('✅ Email sent successfully via SMTP!');
      return result;
    }
    
    // No email service configured
    const errorMsg = isProduction
      ? 'No email service configured. Please set RESEND_API_KEY (recommended) or SMTP credentials (SMTP_USER, SMTP_PWD, SENDER_EMAIL).'
      : 'No email service configured. Please set either RESEND_API_KEY or SMTP credentials.';
    throw new Error(errorMsg);
    
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('To:', to);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Provide helpful error messages with actionable guidance
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('Connection timeout')) {
      const isProduction = process.env.NODE_ENV === 'production';
      const guidance = isProduction
        ? 'SMTP connections are often blocked on hosting platforms. SOLUTION: Set RESEND_API_KEY environment variable (get it at https://resend.com/api-keys). Resend API works reliably on all hosting platforms.'
        : 'SMTP connection timed out. Check your network/firewall settings or consider using Resend API instead.';
      throw new Error(`Connection timeout: Unable to connect to email server. ${guidance}`);
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error(`Connection refused: Email server is not accessible. Please verify your email service configuration or switch to Resend API.`);
    } else if (error.message.includes('authentication')) {
      throw new Error(`Authentication failed: Please verify your email service credentials (SMTP_USER, SMTP_PWD) or use Resend API instead.`);
    }
    
    throw error;
  }
};

export default sendEmail;
