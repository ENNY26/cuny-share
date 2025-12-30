# Environment Variables Setup Guide

This guide explains how to configure environment variables for both **local development** and **production deployment**.

## 📁 Backend Environment Variables

Create a `.env` file in the `Backend/` directory with the following variables:

### For Local Development:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/your-database-name
# OR your MongoDB Atlas connection string

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration
# Option 1: Resend API (RECOMMENDED - works on all hosting platforms)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to SENDER_EMAIL

# Option 2: SMTP (Brevo/Sendinblue) - Works for local development
SMTP_USER=your_brevo_smtp_username
SMTP_PWD=your_brevo_smtp_password
SENDER_EMAIL=your_sender_email@example.com

# Backend URL (for file URLs)
BACKEND_URL=http://localhost:5000
```

### For Production Deployment (e.g., Render.com):
```env
# MongoDB Connection
MONGO_URI=your_mongodb_atlas_connection_string

# JWT Secret (use a strong random string)
JWT_SECRET=your_production_jwt_secret

# Server Port (usually set by hosting provider)
PORT=5000

# Frontend URL (your deployed frontend URL)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Email Configuration
# Option 1: Resend API (RECOMMENDED for production/hosting platforms like Render, Heroku)
# Get your API key at: https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to SENDER_EMAIL

# Option 2: SMTP (Brevo/Sendinblue) - May fail on hosting platforms due to port restrictions
# Only use if Resend API is not available
SMTP_USER=your_brevo_smtp_username
SMTP_PWD=your_brevo_smtp_password
SENDER_EMAIL=your_sender_email@example.com

# Backend URL (your deployed backend URL)
BACKEND_URL=https://your-backend-url.onrender.com
```

---

## 📁 Frontend Environment Variables

Create a `.env` file in the `Frontend/Frontend/` directory with the following variable:

### For Local Development:
```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000
```

### For Production Deployment (e.g., Vercel):
```env
# Backend API URL (your deployed backend URL)
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

---

## 🚀 Setup Instructions

### Local Development:

1. **Backend Setup:**
   - Navigate to `Backend/` directory
   - Create a `.env` file
   - Copy the local development variables above
   - Fill in your actual values
   - Start the backend: `npm start` or `node server.js`

2. **Frontend Setup:**
   - Navigate to `Frontend/Frontend/` directory
   - Create a `.env` file
   - Set `VITE_BACKEND_URL=http://localhost:5000`
   - Start the frontend: `npm run dev`

### Production Deployment:

#### Backend (e.g., Render.com):
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add all the environment variables from the production section above
5. Make sure to use your actual deployed URLs

#### Frontend (e.g., Vercel):
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add: `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com`
5. Redeploy your frontend

---

## 🔍 How It Works

- **Backend**: Uses `process.env.VARIABLE_NAME` to access environment variables
- **Frontend**: Uses `import.meta.env.VITE_BACKEND_URL` (Vite requires `VITE_` prefix)
- The `.env` files are already in `.gitignore`, so they won't be committed to git

---

## ✅ Verification

After setting up:

1. **Backend**: Check console logs - should show "MongoDB connected" and "Server running on port X"
2. **Frontend**: Check browser console - API calls should go to the correct backend URL
3. **Test**: Try signing up or logging in to verify the connection works

---

## 📧 Email Configuration Guide

### Why Resend API is Recommended for Production

Many hosting platforms (Render, Heroku, Railway, etc.) **block outbound SMTP connections** on ports 587 and 465. This causes connection timeouts when trying to send emails via SMTP.

**Solution**: Use **Resend API** instead, which works reliably on all hosting platforms.

### Setting Up Resend API (Recommended)

1. **Sign up for Resend**: Go to https://resend.com and create a free account
2. **Get your API key**: 
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)
3. **Add to environment variables**:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional - see below
   ```

#### Important: Domain Verification

**Resend requires domain verification** before you can send from custom email addresses. Common email domains (Gmail, Yahoo, etc.) **cannot be verified** and will be rejected.

**Options:**

1. **Use Resend's default sender** (easiest, works immediately):
   - Don't set `RESEND_FROM_EMAIL`, or set it to `onboarding@resend.dev`
   - Emails will be sent from `onboarding@resend.dev`
   - ✅ Works immediately, no setup required
   - ⚠️ Emails may go to spam more often

2. **Verify your own domain** (recommended for production):
   - Add your domain in Resend dashboard: https://resend.com/domains
   - Add the required DNS records (SPF, DKIM, DMARC)
   - Use your verified domain: `RESEND_FROM_EMAIL=noreply@yourdomain.com`
   - ✅ Professional sender address
   - ✅ Better email deliverability
   - ⚠️ Requires domain ownership and DNS access

**Automatic Fallback**: If you try to use an unverified domain (like Gmail), the system will automatically retry with `onboarding@resend.dev` so emails still get sent.

### Using SMTP (Local Development Only)

SMTP works fine for local development but may fail in production:

```env
SMTP_USER=your_brevo_smtp_username
SMTP_PWD=your_brevo_smtp_password
SENDER_EMAIL=your_sender_email@example.com
```

### Email Service Priority

The system will use email services in this order:
1. **Resend API** (if `RESEND_API_KEY` is set) - Recommended
2. **SMTP** (if `SMTP_USER`, `SMTP_PWD`, `SENDER_EMAIL` are set) - Fallback

### Checking Email Configuration

After starting your server, check the startup logs for email configuration status. You can also visit:
- `GET /api/email-config` - Returns current email configuration status

## 🛠️ Troubleshooting

- **CORS errors**: Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- **Connection timeout**: Verify `VITE_BACKEND_URL` in frontend matches your backend URL
- **Email not sending**: 
  - For production: Use Resend API (`RESEND_API_KEY`) instead of SMTP (SMTP ports are often blocked on hosting platforms)
  - For local: Check that SMTP credentials are set correctly
  - Check server startup logs for email configuration warnings
- **SMTP connection timeout in production**: This is common on hosting platforms. Switch to Resend API by setting `RESEND_API_KEY` environment variable
- **Resend domain verification error**: If you see "domain is not verified" error:
  - The system will automatically retry with `onboarding@resend.dev` (check logs)
  - To use a custom sender: Verify your domain at https://resend.com/domains
  - Note: Gmail, Yahoo, and other common email domains cannot be verified - use your own domain or the default sender
- **Environment variables not loading**: Restart your dev server after creating/updating `.env` files

