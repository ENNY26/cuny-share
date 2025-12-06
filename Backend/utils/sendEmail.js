import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text, retries = 2) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Longer timeouts for production environments
  const connectionTimeout = isProduction ? 30000 : 10000; // 30s for prod, 10s for dev
  const greetingTimeout = isProduction ? 30000 : 10000;
  const socketTimeout = isProduction ? 30000 : 10000;
  const sendTimeout = isProduction ? 45000 : 15000; // 45s for prod, 15s for dev

  try {
    console.log('Sending email to:', to);
    console.log('Environment:', isProduction ? 'production' : 'development');
    
    // Check if email configuration is set
    if (!process.env.SMTP_USER || !process.env.SMTP_PWD || !process.env.SENDER_EMAIL) {
      console.error('Email configuration missing:', {
        hasSMTP_USER: !!process.env.SMTP_USER,
        hasSMTP_PWD: !!process.env.SMTP_PWD,
        hasSENDER_EMAIL: !!process.env.SENDER_EMAIL
      });
      throw new Error('Email service is not configured. Please set SMTP_USER, SMTP_PWD, and SENDER_EMAIL environment variables.');
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
        // Additional options for better reliability
        pool: false, // Don't use connection pooling
        maxConnections: 1,
        maxMessages: 1,
        requireTLS: !secure, // Require TLS for non-SSL ports
      });

      // Verify connection first
      try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
      } catch (verifyError) {
        console.error('SMTP verification failed:', verifyError.message);
        throw new Error(`SMTP connection verification failed: ${verifyError.message}`);
      }

      // Add timeout wrapper for sendMail
      const sendMailPromise = transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        text,
      });

      // Wrap with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout: Request took too long')), sendTimeout);
      });

      const result = await Promise.race([sendMailPromise, timeoutPromise]);
      return result;
    };

    // Try port 587 first (most common)
    let result;
    try {
      result = await trySendEmail(587, false);
    } catch (error) {
      console.warn('Failed to send via port 587, trying port 465:', error.message);
      // If port 587 fails, try port 465 (SSL)
      try {
        result = await trySendEmail(465, true);
      } catch (sslError) {
        // If both fail and we have retries left, retry
        if (retries > 0) {
          console.log(`Retrying email send (${retries} retries left)...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          return sendEmail(to, subject, text, retries - 1);
        }
        throw sslError;
      }
    }

    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      throw new Error(`Connection timeout: Unable to connect to email server. This may be due to network restrictions in your hosting environment. Please check firewall settings or contact your hosting provider.`);
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error(`Connection refused: Email server is not accessible. Please verify your SMTP settings and network configuration.`);
    } else if (error.message.includes('authentication')) {
      throw new Error(`Authentication failed: Please verify your SMTP credentials (SMTP_USER and SMTP_PWD) are correct.`);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
