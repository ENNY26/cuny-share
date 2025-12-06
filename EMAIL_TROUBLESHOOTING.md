# Email Sending Troubleshooting Guide

## Common Issues in Production

### 1. Connection Timeout Errors

**Symptoms:**
- Error: "Connection timeout" or "ETIMEDOUT"
- Works in development but fails in production

**Possible Causes:**
- Hosting provider blocking outbound SMTP connections
- Firewall restrictions
- Network latency in production environment

**Solutions:**

#### Option A: Check Hosting Provider Settings
Some hosting providers (like Render.com, Heroku) may block SMTP ports by default. Check:
- Firewall settings
- Outbound connection rules
- Port restrictions (587, 465)

#### Option B: Use API-Based Email Service
Instead of SMTP, consider using an API-based service:
- **SendGrid API** (recommended for production)
- **Mailgun API**
- **AWS SES API**
- **Resend API**

#### Option C: Verify Environment Variables
Make sure these are set correctly in production:
```env
SMTP_USER=your_brevo_username
SMTP_PWD=your_brevo_password
SENDER_EMAIL=your_verified_email@example.com
NODE_ENV=production
```

### 2. Port 587 Blocked

**Solution:** The code now automatically tries port 465 (SSL) if 587 fails.

### 3. Brevo/Sendinblue Specific Issues

**Check:**
1. Your Brevo account is active
2. SMTP credentials are correct (not API keys)
3. Sender email is verified in Brevo dashboard
4. You haven't exceeded sending limits

**Brevo SMTP Settings:**
- Host: `smtp-relay.brevo.com`
- Port: `587` (TLS) or `465` (SSL)
- Username: Your Brevo SMTP username (not email)
- Password: Your Brevo SMTP password

### 4. Network Restrictions

If your hosting provider blocks SMTP, you have these options:

#### Switch to SendGrid (Recommended)
1. Sign up at https://sendgrid.com
2. Get API key
3. Update `sendEmail.js` to use SendGrid API instead of SMTP

#### Use Brevo API Instead of SMTP
Brevo also provides an API that might work better:
1. Get Brevo API key from dashboard
2. Use `@getbrevo/brevo` package instead of nodemailer

### 5. Testing Email Configuration

You can test your email setup using the test script:

```bash
cd Backend
node testEmail.js
```

This will verify your SMTP connection and send a test email.

## Current Implementation Features

The updated `sendEmail.js` now includes:
- ✅ Longer timeouts for production (30s connection, 45s send)
- ✅ Automatic fallback to port 465 if 587 fails
- ✅ Retry logic (2 retries)
- ✅ Connection verification before sending
- ✅ Better error messages

## Next Steps if Still Failing

1. **Check Backend Logs:**
   - Look for detailed error messages
   - Check if connection is being established
   - Verify environment variables are loaded

2. **Test SMTP Connection:**
   ```bash
   cd Backend
   node testEmail.js
   ```

3. **Contact Hosting Provider:**
   - Ask if SMTP ports (587, 465) are blocked
   - Request to whitelist `smtp-relay.brevo.com`
   - Ask about outbound connection restrictions

4. **Consider Alternative:**
   - Switch to API-based email service (SendGrid, Mailgun)
   - Use a dedicated email service provider
   - Consider using a queue system (Bull, RabbitMQ) for async email sending

## Environment Variables Checklist

Make sure these are set in your production environment:

```env
# Required for email
SMTP_USER=your_brevo_smtp_username
SMTP_PWD=your_brevo_smtp_password
SENDER_EMAIL=your_verified_email@example.com

# Helps with timeout handling
NODE_ENV=production
```

## Quick Fix: Increase Timeout Further

If you need even longer timeouts, you can modify `Backend/utils/sendEmail.js`:

```javascript
const connectionTimeout = isProduction ? 60000 : 10000; // 60s for prod
const sendTimeout = isProduction ? 90000 : 15000; // 90s for prod
```

However, if timeouts are consistently happening, it's likely a network/firewall issue rather than just needing more time.

