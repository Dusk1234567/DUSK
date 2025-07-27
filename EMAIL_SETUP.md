# Email Setup Guide for Order Notifications

## Gmail App Password Setup (Free)

To enable order confirmation and status update emails, you need to set up a Gmail App Password:

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Make sure 2-Step Verification is enabled for `dusk49255@gmail.com`

### Step 2: Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in to your Google account
3. Select "Mail" from the dropdown
4. Select "Other (Custom name)" and enter "DUSK LifeSteal Shop"
5. Click "Generate"
6. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

### Step 3: Set Environment Variable
1. In Replit, add a secret called `EMAIL_APP_PASSWORD`
2. Paste the 16-character app password as the value
3. The system will automatically use this to send emails

### What Emails Will Be Sent
- **Order Confirmation**: Sent immediately when a customer places an order
- **Status Updates**: Sent when admins change order status (pending → processing → completed)

### Email Features
- Professional HTML templates with DUSK branding
- Order details including items and total amount
- Order tracking links
- Responsive design for mobile and desktop

### Testing
Once the app password is set, test by:
1. Placing a test order
2. Check that confirmation email is sent
3. Update order status in admin panel
4. Verify status update email is received

### Troubleshooting
- If emails aren't sending, check the server logs for error messages
- Ensure the Gmail account has sufficient storage
- Verify the app password is correct (no spaces)
- Make sure 2FA is enabled on the Gmail account