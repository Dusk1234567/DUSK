# Admin Guide - LifeSteal Shop Management

This comprehensive guide explains how to use the admin dashboard to manage orders, users, coupons, and all shop functionality for the LifeSteal Minecraft server.

## Quick Admin Setup

### Option 1: Development/Testing (Quick Setup)
For local development and testing, you can quickly create an admin account:

1. **Start the application**: `npm run dev`
2. **Register a test admin account**:
   ```bash
   # Create admin user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@lifesteal.com",
       "password": "admin123",
       "firstName": "Admin",
       "lastName": "User"
     }'
   
   # Make the user an admin
   curl -X POST http://localhost:5000/api/debug/make-admin \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@lifesteal.com"}'
   ```

3. **Login** at http://localhost:5000/login with:
   - Email: `admin@lifesteal.com`
   - Password: `admin123`

### Option 2: Production Setup
For production environments:

1. Register normally through the website
2. Contact the server administrator to grant admin privileges
3. Or use the make-admin endpoint with your actual email

## Accessing the Admin Dashboard

1. **Login** with your admin account
2. Look for the **"Admin"** button in the top navigation
3. Click to access the admin dashboard at `/admin`
4. **Admin-only features** are automatically available to admin accounts

## Admin Dashboard Features

### 1. Order Management
**Location**: Admin Dashboard → Orders Tab

**Capabilities**:
- View all customer orders with detailed information
- Filter orders by status (pending, processing, completed, cancelled)
- Update order status with automatic email notifications
- View complete order details including:
  - Customer information and email
  - Minecraft player name
  - Items purchased with quantities and prices
  - Payment screenshots and transaction details
  - Order creation and update timestamps

**Common Tasks**:
1. **Update Order Status**:
   - Click on any order to view details
   - Use the status dropdown to change order status
   - Customer receives automatic email notification
   
2. **Review Payment Screenshots**:
   - View uploaded payment confirmations
   - Verify payment details before marking as paid

3. **Process Orders**:
   - Move orders from "pending" → "processing" → "completed"
   - Add notes for complicated orders

### 2. Coupon Management
**Location**: Admin Dashboard → Coupons Tab

**Capabilities**:
- Create new discount coupons and promotions
- Set coupon parameters:
  - Discount type (percentage or fixed amount)
  - Discount value
  - Minimum/maximum order amounts
  - Valid date ranges
  - Usage limits
  - Applicable/excluded products
- View all active and expired coupons
- Monitor coupon usage statistics

**Creating Coupons**:
1. Click "Create New Coupon"
2. Set coupon code (e.g., "SUMMER20")
3. Choose discount type and value
4. Set validity period
5. Configure usage restrictions
6. Save and activate

### 3. User Management
**Location**: Admin Dashboard → Users Tab

**Capabilities**:
- View all registered users
- See user statistics (orders, total spent)
- Grant or revoke admin privileges
- Monitor user activity and registration dates

**Making Users Admin**:
1. Find user in the list
2. Click "Make Admin" button
3. User immediately gains admin access

### 4. Whitelist Management  
**Location**: Admin Dashboard → Whitelist Tab

**Capabilities**:
- Review Minecraft server whitelist requests
- Approve or reject requests with reasons
- View requester information:
  - Minecraft username
  - Email address (optional)
  - Discord username (optional)
  - Request timestamp
- Track processing history

**Processing Whitelist Requests**:
1. Review new requests in "Pending" status
2. Click "Approve" or "Reject"
3. Add reason for rejection if needed
4. Requesters can check status on the whitelist page

## Admin Security & Best Practices

### Security Guidelines
- Only grant admin access to trusted team members
- Regularly review admin user list
- Use strong passwords for admin accounts
- Monitor admin activity through order status changes
- Keep admin credentials secure and private

### Order Processing Workflow
1. **New Orders**: Automatically created as "pending"
2. **Payment Review**: Check payment screenshots and verify details
3. **Processing**: Mark as "processing" while fulfilling order
4. **Completion**: Mark as "completed" when items are delivered
5. **Issues**: Mark as "cancelled" or "failed" if problems occur

### Email Notifications
- Order status changes automatically send emails to customers
- Ensure EMAIL_APP_PASSWORD is configured for notifications
- Check server logs if emails aren't being delivered
- Email templates include order tracking links for customers

## API Endpoints for Advanced Users

### Admin-Only Endpoints
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/coupons` - Get all coupons
- `POST /api/admin/coupons` - Create new coupon
- `GET /api/admin/users` - Get all users
- `GET /api/admin/whitelist` - Get whitelist requests
- `PUT /api/admin/whitelist/:id` - Update whitelist status

### Debug Endpoints (Development Only)
- `POST /api/debug/make-admin` - Grant admin privileges
- `GET /api/debug/orders` - Debug order information

## Common Admin Tasks

### Daily Operations
1. **Check New Orders**: Review overnight orders and payment confirmations
2. **Process Payments**: Verify payment screenshots and update order status
3. **Handle Support**: Respond to customer inquiries about orders
4. **Whitelist Requests**: Approve legitimate Minecraft whitelist requests

### Weekly Operations
1. **Create Promotions**: Set up new coupon codes for sales
2. **Review Analytics**: Check sales totals and popular products
3. **User Management**: Review new user registrations
4. **Clean Up**: Archive old completed orders if needed

### Monthly Operations
1. **Coupon Audit**: Remove expired coupons and analyze usage
2. **Admin Review**: Verify admin user list is current
3. **System Health**: Check email delivery and order processing
4. **Feature Planning**: Review customer feedback and feature requests

## Troubleshooting Admin Issues

### Can't Access Admin Dashboard
- Verify you're logged in with an admin account
- Check if your account has admin privileges
- Clear browser cache and cookies
- Try incognito/private browsing mode

### Email Notifications Not Sending
- Check EMAIL_APP_PASSWORD is set correctly
- Verify Gmail account has 2FA enabled
- Check server logs for email errors
- Test with a personal email address

### Orders Not Updating
- Check database connection status
- Verify admin permissions
- Check browser console for JavaScript errors
- Try refreshing the admin dashboard

### Coupon System Issues
- Verify coupon dates are correct
- Check minimum/maximum order amounts
- Ensure applicable products are set correctly
- Test with a small test order

## Getting Help

- Check server console logs for detailed error messages
- Review the EMAIL_SETUP.md for email configuration issues
- Verify database connectivity in LOCALHOST_SETUP.md
- For development issues, check package.json scripts

The admin system is designed to be intuitive while providing comprehensive control over all shop operations. Regular use of the dashboard helps maintain smooth customer experience and efficient order processing.