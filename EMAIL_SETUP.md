# Email Setup Guide for Order Notifications

This guide explains how to set up automated email notifications for order confirmations and status updates using Gmail's free SMTP service.

## Why Email Setup is Important

- **Order Confirmations**: Customers receive instant confirmation when they place orders
- **Status Updates**: Automatic notifications when order status changes (pending → processing → completed)
- **Professional Experience**: Branded emails with order details and tracking links
- **Customer Service**: Reduces support requests by keeping customers informed

## Gmail App Password Setup (Free & Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Make sure 2-Step Verification is enabled for your Gmail account
3. **Important**: 2FA is required to create App Passwords

### Step 2: Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in to your Google account
3. Select "Mail" from the dropdown
4. Select "Other (Custom name)" and enter "LifeSteal Shop Local Dev"
5. Click "Generate"
6. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)
7. **Important**: Save this password - you can't view it again

### Step 3: Configure Environment Variables

#### For Local Development:
1. Open your `.env` file
2. Add the email configuration:
   ```bash
   EMAIL_APP_PASSWORD=your-16-character-app-password-here
   ```
3. **Optional**: Change the sender email by updating `server/emailService.ts`

#### For Replit Development:
1. In Replit, go to Secrets (lock icon in sidebar)
2. Add a secret called `EMAIL_APP_PASSWORD`
3. Paste the 16-character app password as the value

## Email Templates & Features

### Automated Emails Sent:
1. **Order Confirmation**: Sent immediately when a customer places an order
   - Professional branded design with LifeSteal theme
   - Complete order details with itemized breakdown
   - Order tracking link for customer self-service
   - Payment instructions and next steps

2. **Status Updates**: Sent when admins change order status
   - Visual status indicators with color coding
   - Updated order information
   - Direct link to order tracking page

### Email Features:
- 🎨 **Professional Design**: Gaming-themed HTML templates with responsive layout
- 📱 **Mobile Optimized**: Perfect display on all devices
- 🔗 **Tracking Links**: Direct links to order status page
- 🎮 **Branded Content**: Custom LifeSteal Shop branding and colors
- 📧 **Reliable Delivery**: Uses Gmail's trusted SMTP infrastructure

## Alternative Email Providers

### Using Other Email Services:
If you prefer not to use Gmail, you can modify `server/emailService.ts` to use:

1. **Outlook/Hotmail**:
   ```javascript
   host: 'smtp-mail.outlook.com',
   port: 587,
   ```

2. **Yahoo Mail**:
   ```javascript
   host: 'smtp.mail.yahoo.com',
   port: 587,
   ```

3. **Custom SMTP**:
   ```javascript
   host: 'your-smtp-server.com',
   port: 587,
   ```

## Testing Email Functionality

### Step 1: Start the Application
```bash
npm run dev
```

### Step 2: Create Test Order
1. Browse products at http://localhost:5000
2. Add items to cart
3. Go through checkout process
4. Enter a valid email address
5. Complete the order

### Step 3: Verify Email Delivery
1. Check your email inbox for order confirmation
2. Check server logs for email sending status:
   ```
   Order confirmation email sent successfully: <message-id>
   ```

### Step 4: Test Status Updates
1. Login as admin (see ADMIN_GUIDE.md)
2. Go to Admin Dashboard → Orders
3. Change an order status
4. Verify status update email is received

## Troubleshooting Guide

### Common Issues:

1. **"EMAIL_APP_PASSWORD not set" Warning**
   - **Solution**: Add EMAIL_APP_PASSWORD to your .env file
   - **Note**: App will work without emails, but notifications are disabled

2. **"Email transporter verification failed"**
   - **Check**: Gmail account has 2FA enabled
   - **Check**: App password is exactly 16 characters (no spaces)
   - **Check**: Using correct Gmail address

3. **"Authentication failed" SMTP Error**
   - **Solution**: Generate a new App Password
   - **Check**: Using the app password, not your regular Gmail password
   - **Check**: Account hasn't been locked or restricted

4. **Emails Not Arriving**
   - **Check**: Spam/junk folders
   - **Check**: Gmail account storage isn't full
   - **Test**: Send a test email from Gmail web interface
   - **Verify**: Recipient email address is correct

### Debug Mode:
Enable detailed email logging by checking server console output:
```
Creating email transporter with Gmail SMTP
Email user: your-email@gmail.com
Password length: 16
Email server is ready to send messages
```

### Without Email Configuration:
The application works perfectly without email setup:
- All order functionality remains operational
- Orders are created and tracked normally
- Admin can manage orders through dashboard
- Customers can track orders via Order Status page
- Email notifications are simply skipped with warning logs

## Production Considerations

For production deployment:
1. Use a dedicated business email account
2. Consider email service providers like SendGrid, Mailgun, or AWS SES for higher volume
3. Set up proper SPF, DKIM, and DMARC records for better deliverability
4. Monitor email delivery rates and bounce handling
5. Implement email templates with your actual business branding