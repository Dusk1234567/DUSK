# Gmail Email Setup for Local Development

## Quick Setup Guide

### Step 1: Generate Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the setup process

3. **Create App Password**
   - Go back to Security settings
   - Click "2-Step Verification"
   - Scroll down to "App passwords"
   - Click "Generate" or "App passwords"
   - Select "Mail" as the app
   - Select "Other" as the device and name it "LifeSteal Shop"
   - Google will generate a 16-character password like: `abcd efgh ijkl mnop`

### Step 2: Configure Environment Variables

Create a `.env` file in your project root (or add to existing one):

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop

# Database (optional for persistent data)
MONGODB_URL=mongodb://localhost:27017/lifesteal-shop

# Development
NODE_ENV=development
```

**Important Notes:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character app password (no spaces)
- Don't include quotes around the values
- Keep this file secure and never commit it to version control

### Step 3: Update Email Service (for your own email)

The current code is hardcoded to use `dusk49255@gmail.com`. To use your own email:

1. **Option A: Use your own Gmail** (Recommended for local development)
   - Set your email in the `.env` file as shown above
   - The app will use your Gmail to send notifications

2. **Option B: Keep existing setup** (if you have access to dusk49255@gmail.com)
   - Only set `EMAIL_APP_PASSWORD` in `.env`
   - Use the app password for dusk49255@gmail.com

### Step 4: Test Email Configuration

After setting up the environment variables:

1. **Restart the app:**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

2. **Check the console logs:**
   - Look for "Email server is ready to send messages"
   - If you see errors, double-check your app password

3. **Test by placing an order:**
   - Add items to cart
   - Complete checkout with your email
   - Check if confirmation email arrives

## Troubleshooting

### Common Issues:

1. **"EMAIL_APP_PASSWORD not set" error**
   - Make sure `.env` file is in the project root
   - Restart the app after creating `.env`
   - Check that there are no quotes around the password

2. **"Invalid login" or authentication errors**
   - Verify 2-Step Verification is enabled on your Google account
   - Double-check the 16-character app password (no spaces)
   - Make sure you're using the app password, not your regular Gmail password

3. **Emails not arriving**
   - Check spam/junk folder
   - Verify the recipient email address is correct
   - Look at server console for detailed error messages

4. **"Less secure app access" error**
   - This shouldn't happen with app passwords
   - If it does, you might be using your regular password instead of the app password

### Debug Steps:

1. **Check environment variables are loaded:**
   ```bash
   # In the app console, you should see:
   # "Email credentials available: true"
   # "Password length: 16" (or similar)
   ```

2. **Check transporter verification:**
   ```bash
   # Look for: "Email server is ready to send messages"
   # If you see verification errors, the credentials are wrong
   ```

3. **Test with curl:**
   ```bash
   # Place a test order and watch the console logs
   curl -X POST http://localhost:5000/api/orders \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","playerName":"TestPlayer","totalAmount":10,"items":"[]"}'
   ```

## Security Notes

- **Never share your app password**
- **Add `.env` to `.gitignore`**
- **Use different passwords for different apps**
- **Revoke app passwords you no longer use**

## Alternative Email Services

If Gmail doesn't work, you can also use:

- **Outlook/Hotmail:** smtp-mail.outlook.com:587
- **Yahoo:** smtp.mail.yahoo.com:587
- **Custom SMTP:** Any SMTP service your hosting provider offers

Just update the SMTP settings in `server/emailService.ts` accordingly.

## Success Indicators

When properly configured, you'll see:
1. ✅ "Email server is ready to send messages" in console
2. ✅ "Email credentials available: true" in logs
3. ✅ Confirmation emails arrive in your inbox
4. ✅ No "EMAIL_APP_PASSWORD not set" warnings