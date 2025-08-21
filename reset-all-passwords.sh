#!/bin/bash

echo "🔧 Resetting all user passwords..."

# Wait for services to be ready
sleep 3

# Test if services are running
echo "Testing if services are running..."
curl -s http://localhost:12001/api/auth/public/users/basic > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Services are not running. Please start the application first."
    exit 1
fi

echo "✅ Services are running"

# Reset Jerry's password
echo "Resetting Jerry's password..."
curl -s -X POST "http://localhost:12001/api/auth/admin/reset-jerry-password" -H "X-Username: admin"
echo ""

# Reset Mian's password using the forgot password flow
echo "Resetting Mian's password..."
curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"Mian","email":"aureliaaa615@gmail.com"}'
echo ""

# Reset Gabriel's password using the forgot password flow
echo "Resetting Gabriel's password..."
curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"Gabriel","email":"123456@qq.com"}'
echo ""

# Reset Admin's password using the forgot password flow
echo "Resetting Admin's password..."
curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@agenticomics.com"}'
echo ""

echo "✅ Password reset requests sent!"
echo ""
echo "📋 Login credentials:"
echo "   • Jerry: jerrypass (already reset)"
echo "   • Mian: Check email for reset link"
echo "   • Gabriel: Check email for reset link"
echo "   • Admin: Check email for reset link"
echo ""
echo "You can now log in with Jerry using 'jerrypass'"
