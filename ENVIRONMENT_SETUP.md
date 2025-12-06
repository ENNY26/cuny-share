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

# Email Configuration (Brevo/Sendinblue)
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

# Email Configuration (Brevo/Sendinblue)
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

## 🛠️ Troubleshooting

- **CORS errors**: Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- **Connection timeout**: Verify `VITE_BACKEND_URL` in frontend matches your backend URL
- **Email not sending**: Check that all email environment variables are set correctly
- **Environment variables not loading**: Restart your dev server after creating/updating `.env` files

