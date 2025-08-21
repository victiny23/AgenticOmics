#!/bin/bash

echo "🔧 Resetting all user passwords via API..."

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

# Reset Mian's password
echo "Resetting Mian's password..."
MIAN_TOKEN=$(curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"Mian","email":"aureliaaa615@gmail.com"}' | grep -o 'Token: [a-f0-9-]*' | cut -d' ' -f2)

if [ ! -z "$MIAN_TOKEN" ]; then
    curl -s -X POST "http://localhost:12001/api/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d "{\"resetToken\":\"$MIAN_TOKEN\",\"newPassword\":\"mianpass\"}"
    echo "✅ Mian password reset"
else
    echo "❌ Failed to get Mian reset token"
fi

# Reset Gabriel's password
echo "Resetting Gabriel's password..."
GABRIEL_TOKEN=$(curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"Gabriel","email":"123456@qq.com"}' | grep -o 'Token: [a-f0-9-]*' | cut -d' ' -f2)

if [ ! -z "$GABRIEL_TOKEN" ]; then
    curl -s -X POST "http://localhost:12001/api/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d "{\"resetToken\":\"$GABRIEL_TOKEN\",\"newPassword\":\"gabrielpass\"}"
    echo "✅ Gabriel password reset"
else
    echo "❌ Failed to get Gabriel reset token"
fi

# Reset Admin's password
echo "Resetting Admin's password..."
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:12001/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@agenticomics.com"}' | grep -o 'Token: [a-f0-9-]*' | cut -d' ' -f2)

if [ ! -z "$ADMIN_TOKEN" ]; then
    curl -s -X POST "http://localhost:12001/api/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d "{\"resetToken\":\"$ADMIN_TOKEN\",\"newPassword\":\"adminpass\"}"
    echo "✅ Admin password reset"
else
    echo "❌ Failed to get Admin reset token"
fi

echo ""
echo "✅ All password resets completed!"
echo ""
echo "📋 Login credentials:"
echo "   • Jerry: jerrypass (already working)"
echo "   • Mian: mianpass"
echo "   • Gabriel: gabrielpass"
echo "   • Admin: adminpass"
echo ""
echo "🎉 You can now log in with all users!"
