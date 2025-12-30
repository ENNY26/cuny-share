/**
 * Policy Controller
 * Serves privacy policy, terms of service, and other legal documents
 */

export const getPrivacyPolicy = (req, res) => {
  const privacyPolicy = {
    title: "Privacy Policy",
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `
# Privacy Policy for CUNY Share

**Last Updated: ${new Date().toISOString().split('T')[0]}**

## 1. Introduction

Welcome to CUNY Share ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

## 2. Information We Collect

### 2.1 Information You Provide
- **Account Information**: Name, username, email address, school, academic level
- **Profile Information**: Profile picture, bio, and other optional information
- **Content**: Messages, listings, notes, and other content you post
- **Transaction Information**: Information related to buying, selling, or exchanging items

### 2.2 Automatically Collected Information
- **Usage Data**: How you interact with our platform
- **Device Information**: Device type, browser, IP address
- **Log Data**: Access times, pages viewed, and actions taken

## 3. How We Use Your Information

We use your information **solely** to:
- Provide and maintain our service
- Enable communication between users (buyers and sellers)
- Send you important notifications about your account and messages
- Improve and personalize your experience
- Ensure platform security and prevent fraud

## 4. What We Do NOT Do

**We do NOT:**
- Sell your personal information to third parties
- Share your information with advertisers without your consent
- Use your data for marketing purposes outside of our platform
- Track you across other websites or services
- Access your messages for any purpose other than delivering them

## 5. Information Sharing

We only share your information in the following limited circumstances:
- **With Other Users**: When you message someone, they see your username and profile information necessary for communication
- **Service Providers**: We may use third-party services (like email providers) that process data on our behalf under strict confidentiality agreements
- **Legal Requirements**: If required by law or to protect our rights and safety

## 6. Data Security

We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.

## 7. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt-out of certain communications
- Request a copy of your data

## 8. Data Retention

We retain your information only as long as necessary to provide our services or as required by law. When you delete your account, we will delete or anonymize your personal information.

## 9. Children's Privacy

Our service is intended for users who are at least 13 years old. We do not knowingly collect information from children under 13.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.

## 11. Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: support@cunyshare.xyz
- Website: https://cunyshare.xyz

---

**Your privacy is important to us. We are committed to protecting your information and being transparent about how we use it.**
    `.trim()
  };
  
  res.json(privacyPolicy);
};

export const getTermsOfService = (req, res) => {
  const terms = {
    title: "Terms of Service",
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `
# Terms of Service for CUNY Share

**Last Updated: ${new Date().toISOString().split('T')[0]}**

## 1. Acceptance of Terms

By accessing or using CUNY Share, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.

## 2. Description of Service

CUNY Share is a platform that connects CUNY students to buy, sell, and exchange textbooks, notes, and other academic materials. We facilitate communication between users but are not a party to any transactions.

## 3. User Accounts

### 3.1 Account Creation
- You must provide accurate and complete information
- You are responsible for maintaining the security of your account
- You must be at least 13 years old to use our service
- You must be a current or former CUNY student

### 3.2 Account Responsibilities
- You are responsible for all activities under your account
- You must not share your account credentials
- You must notify us immediately of any unauthorized use

## 4. User Conduct

You agree NOT to:
- Post false, misleading, or fraudulent listings
- Harass, abuse, or harm other users
- Violate any laws or regulations
- Infringe on intellectual property rights
- Spam or send unsolicited messages
- Use the platform for illegal purposes

## 5. Transactions

### 5.1 Our Role
- We facilitate connections between buyers and sellers
- We are NOT involved in the actual transaction
- We do not guarantee the quality, safety, or legality of items
- We do not handle payments or provide escrow services

### 5.2 Your Responsibility
- All transactions are between you and other users
- You are responsible for verifying items before purchase
- You are responsible for payment and delivery arrangements
- We are not liable for any disputes between users

## 6. Content and Intellectual Property

### 6.1 Your Content
- You retain ownership of content you post
- By posting, you grant us a license to display and distribute your content on our platform
- You are responsible for ensuring you have rights to post your content

### 6.2 Our Content
- All platform design, logos, and features are our property
- You may not copy, modify, or distribute our content without permission

## 7. Prohibited Items

You may NOT list or sell:
- Illegal items or services
- Stolen goods
- Items that violate copyright or trademark
- Dangerous or hazardous materials
- Items that violate CUNY policies

## 8. Disclaimers

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
- The accuracy of listings
- The availability of items
- The quality or condition of items
- That the service will be uninterrupted or error-free

## 9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, or consequential damages
- Loss of profits, data, or business opportunities
- Disputes between users
- Issues with transactions or items

## 10. Termination

We may suspend or terminate your account if you:
- Violate these Terms of Service
- Engage in fraudulent or illegal activity
- Harm other users or the platform

You may delete your account at any time through your account settings.

## 11. Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.

## 12. Contact Information

For questions about these Terms of Service, contact us at:
- Email: support@cunyshare.xyz
- Website: https://cunyshare.xyz

---

**By using CUNY Share, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.**
    `.trim()
  };
  
  res.json(terms);
};

export const getCommunityGuidelines = (req, res) => {
  const guidelines = {
    title: "Community Guidelines",
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `
# Community Guidelines for CUNY Share

**Last Updated: ${new Date().toISOString().split('T')[0]}**

## Our Community Values

CUNY Share is built on trust, respect, and mutual support. We're all here to help each other succeed academically. Please follow these guidelines to keep our community safe and welcoming.

## 1. Be Respectful

- Treat all users with kindness and respect
- Use appropriate language in all communications
- Respect different opinions and backgrounds
- No harassment, bullying, or hate speech

## 2. Be Honest

- Provide accurate descriptions of items you're selling
- Use real photos of actual items
- Set fair prices
- Be transparent about item condition

## 3. Be Safe

- Meet in public places for transactions
- Bring a friend if meeting in person
- Trust your instincts - if something feels off, don't proceed
- Report suspicious behavior to us immediately

## 4. Communication Guidelines

- Respond to messages in a timely manner
- Be clear and professional in your communications
- Don't spam or send unsolicited messages
- Respect when someone says "no" or doesn't respond

## 5. Listing Guidelines

- Only list items you actually own and can sell
- Include clear, accurate photos
- Provide detailed descriptions
- Set reasonable prices
- Remove listings once items are sold

## 6. Academic Integrity

- Notes and study materials should be your own work
- Don't share copyrighted materials without permission
- Respect your professors' and institutions' academic policies

## 7. Prohibited Behavior

The following will result in immediate account suspension or termination:
- Scamming or fraudulent activity
- Harassment or threats
- Posting illegal items
- Spam or repeated unwanted contact
- Creating fake accounts
- Violating CUNY policies

## 8. Reporting Issues

If you encounter:
- Suspicious listings or users
- Harassment or inappropriate behavior
- Scams or fraud
- Technical issues

Please report it to us immediately at support@cunyshare.xyz

## 9. Consequences

Violations of these guidelines may result in:
- Warning messages
- Temporary account suspension
- Permanent account termination
- Legal action if applicable

## 10. Remember

We're all CUNY students trying to help each other. Let's keep this community positive, supportive, and safe for everyone.

---

**Thank you for being part of the CUNY Share community!**
    `.trim()
  };
  
  res.json(guidelines);
};

export const getDataPolicy = (req, res) => {
  const dataPolicy = {
    title: "Data Usage Policy",
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `
# Data Usage Policy for CUNY Share

**Last Updated: ${new Date().toISOString().split('T')[0]}**

## Our Commitment

At CUNY Share, we are committed to protecting your privacy and being transparent about how we use your data. We believe you should have control over your personal information.

## What Data We Collect

We collect only the information necessary to provide our service:
- **Account Information**: Name, email, username, school, academic level
- **Profile Information**: Profile picture and optional bio
- **Content**: Your listings, messages, and posts
- **Usage Data**: How you interact with the platform (for improving our service)

## How We Use Your Data

We use your data **ONLY** to:
1. **Provide the Service**: Enable you to buy, sell, and exchange items
2. **Facilitate Communication**: Connect buyers and sellers, deliver messages
3. **Send Notifications**: Alert you about messages, listings, and important updates
4. **Improve the Platform**: Analyze usage patterns to make the service better
5. **Ensure Security**: Detect and prevent fraud, abuse, and security threats

## What We Do NOT Do

**We DO NOT:**
- ❌ Sell your personal information to third parties
- ❌ Share your data with advertisers
- ❌ Use your information for marketing outside our platform
- ❌ Read your private messages (except for security purposes)
- ❌ Track you across other websites
- ❌ Use your data for purposes unrelated to our service

## Data Sharing

We only share your information:
- **With Other Users**: When necessary for transactions (e.g., showing your username in messages)
- **With Service Providers**: Trusted partners who help us operate (like email services), all under strict confidentiality
- **When Required by Law**: Only if legally required or to protect safety

## Your Control

You have full control over your data:
- **View Your Data**: Access all information we have about you
- **Update Your Data**: Correct any inaccurate information
- **Delete Your Account**: Remove all your data from our system
- **Opt-Out**: Unsubscribe from non-essential communications

## Data Security

We implement industry-standard security measures:
- Encrypted data transmission
- Secure data storage
- Regular security audits
- Limited access to personal data

## Data Retention

- We keep your data only as long as necessary
- When you delete your account, we delete your personal information
- Some data may be retained for legal or security purposes

## Third-Party Services

We use trusted third-party services:
- **Email Services**: To send you notifications (Resend)
- **Cloud Storage**: To store images and files (AWS S3)
- **Database**: To store your data securely (MongoDB Atlas)

All third-party services are bound by strict confidentiality agreements.

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Export your data
- Object to certain data processing
- File a complaint with relevant authorities

## Contact Us

Questions about your data? Contact us:
- Email: support@cunyshare.xyz
- Website: https://cunyshare.xyz

## Updates

We may update this policy from time to time. We'll notify you of significant changes.

---

**Your privacy matters. We're committed to protecting it.**
    `.trim()
  };
  
  res.json(dataPolicy);
};

