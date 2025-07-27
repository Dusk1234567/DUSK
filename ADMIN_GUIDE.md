# Admin Access Management Guide

## How to Give Admin Access to Users

There are several ways to give admin access to users for managing whitelist requests and orders:

### Method 1: Direct Database Update (Fastest)

```sql
-- Make a user admin by email
UPDATE users SET is_admin = true WHERE email = 'user@example.com';

-- Remove admin access
UPDATE users SET is_admin = false WHERE email = 'user@example.com';

-- Check current admin users
SELECT email, is_admin, first_name, last_name FROM users WHERE is_admin = true;
```

### Method 2: Through Admin Panel UI

1. Log in as an existing admin user
2. Go to `/admin` in your browser
3. Navigate to the "User Management" section
4. Find the user you want to promote
5. Click "Make Admin" button

### Method 3: Using Admin Whitelist (Alternative)

```sql
-- Add user to admin whitelist
INSERT INTO admin_whitelist (email, role, added_by) 
VALUES ('newadmin@example.com', 'admin', 'current_admin@example.com');

-- View admin whitelist
SELECT * FROM admin_whitelist;
```

## Admin Capabilities

Once a user has admin access, they can:

### Whitelist Management
- View all whitelist requests
- Approve/reject whitelist requests
- Add reasons for rejections
- Track processing history

### Order Management
- View all orders from all users
- Update order status (pending, processing, completed, cancelled)
- View order details and items
- Track revenue and statistics

### User Management
- View all registered users
- Promote/demote admin status
- View user statistics (total spent, order count)

## Current Admin Users

To see who currently has admin access:

```sql
SELECT 
  email,
  first_name,
  last_name,
  is_admin,
  created_at
FROM users 
WHERE is_admin = true 
ORDER BY created_at;
```

## Security Notes

- Admin access allows full control over orders and whitelist requests
- Only give admin access to trusted users
- Regularly review admin user list
- Admin actions are logged with timestamps and user IDs

## Quick Commands for Common Tasks

```sql
-- Make multiple users admin at once
UPDATE users SET is_admin = true WHERE email IN (
  'admin1@example.com', 
  'admin2@example.com', 
  'admin3@example.com'
);

-- Count total admin users
SELECT COUNT(*) as admin_count FROM users WHERE is_admin = true;

-- View recent admin activity (whitelist processing)
SELECT 
  wr.minecraft_username,
  wr.status,
  wr.processed_by,
  wr.processed_at,
  u.email as admin_email
FROM whitelist_requests wr
LEFT JOIN users u ON wr.processed_by = u.id
WHERE wr.processed_at IS NOT NULL
ORDER BY wr.processed_at DESC
LIMIT 10;
```

## Access the Admin Panel

Once a user has admin access:
1. Login to the website
2. Navigate to `/admin` 
3. The admin panel will show options for:
   - Whitelist Requests Management
   - Order Management  
   - User Management
   - Statistics Dashboard