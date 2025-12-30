# Policies and Message Notifications

## ✅ What's Been Implemented

### 1. Legal Policies

Four comprehensive policy pages have been created:

- **Privacy Policy** (`/api/policies/privacy`)
- **Terms of Service** (`/api/policies/terms`)
- **Community Guidelines** (`/api/policies/guidelines`)
- **Data Usage Policy** (`/api/policies/data`)

All policies emphasize that:
- ❌ We do NOT sell user information
- ❌ We do NOT share data with third parties
- ❌ We do NOT use data for marketing
- ✅ We only use data to provide the service
- ✅ Users have full control over their data

### 2. Message Notification System

A smart email notification system that:
- ⏰ Waits 10 minutes after a message is sent
- 📧 Sends an email only if the message is still unread
- 🔗 Includes a direct link to the messages page
- 🚫 Prevents duplicate notifications
- ✅ Tracks notification status to avoid spam

## 📍 API Endpoints

### Policy Endpoints (Public - No Auth Required)

```
GET /api/policies/privacy      - Privacy Policy
GET /api/policies/terms         - Terms of Service
GET /api/policies/guidelines    - Community Guidelines
GET /api/policies/data          - Data Usage Policy
```

All endpoints return JSON with:
```json
{
  "title": "Policy Name",
  "lastUpdated": "2024-01-01",
  "content": "# Markdown formatted policy content..."
}
```

## 🔔 How Message Notifications Work

### Flow:
1. **User A sends a message to User B**
   - Message is created in database
   - In-app notification is created
   - Socket.io notification is sent (if user is online)
   - **NO immediate email is sent**

2. **After 10 minutes:**
   - Scheduler checks for unread messages
   - If message is still unread → Email is sent
   - Email includes:
     - Sender's username
     - Message preview
     - Direct link to messages page
     - Context (what listing/product it's about)

3. **If user reads the message:**
   - Message is marked as `read: true`
   - Scheduler skips it (won't send email)

### Email Content Example:

```
Subject: New Message Awaits You - CUNY Share

Hello [Username],

You have an unread message from [Sender] about your listing "[Product Name]" on CUNY Share.

Message Preview:
"[First 100 characters of message]"

This message was sent 10 minutes ago and is waiting for you in the app.

View and respond to this message:
https://cunyshare.xyz/messages

Thank you for using CUNY Share!
```

## ⚙️ Technical Details

### Message Model Updates

Added fields to track email notifications:
- `emailNotificationSent` (Boolean) - Whether email was sent
- `emailNotificationSentAt` (Date) - When email was sent

### Scheduler

- **Location**: `Backend/utils/messageNotificationScheduler.js`
- **Frequency**: Checks every 1 minute
- **Delay**: Sends email if message is 10+ minutes old and unread
- **Auto-starts**: When server starts (after MongoDB connects)

### Configuration

The scheduler uses:
- `NOTIFICATION_DELAY_MINUTES = 10` (configurable in the file)
- `FRONTEND_URL` environment variable for email links

## 📊 Resend Free Tier Limits

✅ **Your setup is compatible with Resend Free Tier:**

- **3,000 emails/month** - Plenty for a growing platform
- **100 emails/day** - Should cover most use cases
- **Verified domain** - ✅ You have `cunyshare.xyz` verified
- **Custom sender** - ✅ Using `noreply@cunyshare.xyz`

### Email Usage Estimate:

- Average user receives ~5-10 messages per month
- With 100 active users = ~500-1000 notification emails/month
- **Well within the 3,000/month limit!** ✅

### If You Need More:

- Resend Pro: $20/month for 50,000 emails
- Or upgrade when you approach the limit

## 🚀 Frontend Integration

### Displaying Policies

You can create frontend pages that fetch and display policies:

```javascript
// Example: Privacy Policy page
const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(null);
  
  useEffect(() => {
    fetch('/api/policies/privacy')
      .then(res => res.json())
      .then(data => setPolicy(data));
  }, []);
  
  return (
    <div>
      <h1>{policy?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(policy?.content) }} />
    </div>
  );
};
```

### Policy Links

Add links in your footer or settings:
- Privacy Policy: `/policies/privacy`
- Terms of Service: `/policies/terms`
- Community Guidelines: `/policies/guidelines`
- Data Usage Policy: `/policies/data`

## 🔧 Customization

### Change Notification Delay

Edit `Backend/utils/messageNotificationScheduler.js`:
```javascript
const NOTIFICATION_DELAY_MINUTES = 10; // Change to desired minutes
```

### Customize Email Template

Edit the email template in `checkAndSendMessageNotifications()` function in:
`Backend/utils/messageNotificationScheduler.js`

### Disable Scheduler

Comment out in `Backend/server.js`:
```javascript
// startMessageNotificationScheduler();
```

## ✅ Testing

### Test Message Notifications:

1. Send a message from User A to User B
2. Don't read it in the app
3. Wait 10+ minutes
4. Check User B's email - should receive notification

### Test Policies:

```bash
# Test endpoints
curl http://localhost:5000/api/policies/privacy
curl http://localhost:5000/api/policies/terms
curl http://localhost:5000/api/policies/guidelines
curl http://localhost:5000/api/policies/data
```

## 📝 Notes

- The scheduler runs continuously in the background
- It's lightweight and won't impact performance
- Failed email sends are logged but don't break the system
- Messages are only checked once per minute (efficient)

## 🎉 Summary

✅ **Policies**: Complete, privacy-focused, user-friendly
✅ **Notifications**: Smart 10-minute delay system
✅ **Resend**: Compatible with free tier
✅ **Scalable**: Ready for growth

Everything is set up and ready to use!

