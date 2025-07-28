#!/bin/bash
# Script to create admin user for LifeSteal Shop
# Make sure the server is running first: npm run dev

echo "🔧 Creating Admin User for LifeSteal Shop"
echo "========================================"

# Check if server is running
if ! curl -s http://localhost:5000/api/products > /dev/null; then
    echo "❌ Server is not running. Please start it first:"
    echo "   npm run dev"
    exit 1
fi

echo "📝 Creating admin user account..."

# Create admin user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lifesteal.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }')

echo "Registration response: $REGISTER_RESPONSE"

# Wait a moment for the registration to complete
sleep 2

echo "👑 Granting admin privileges..."

# Make user admin
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/debug/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lifesteal.com"}')

echo "Admin grant response: $ADMIN_RESPONSE"

echo ""
echo "✅ Admin user created successfully!"
echo ""
echo "Login Details:"
echo "Email: admin@lifesteal.com"
echo "Password: admin123"
echo ""
echo "Next Steps:"
echo "1. Go to http://localhost:5000/login"
echo "2. Login with the above credentials"
echo "3. Look for the 'Admin' button in the navigation"
echo "4. Access the admin dashboard at http://localhost:5000/admin"
echo ""
echo "⚠️  Security Note:"
echo "Change the admin password after first login for production use!"