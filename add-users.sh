#!/bin/bash

echo "🔧 Adding users with known passwords..."

# Wait for services to be ready
sleep 5

# Test if services are running
echo "Testing if services are running..."
curl -s http://localhost:12001/api/auth/public/users/basic > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Services are not running. Please start the application first."
    exit 1
fi

echo "✅ Services are running"

# Add Jerry user
echo "Adding Jerry user..."
curl -s -X POST "http://localhost:12001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Jerry",
    "password": "jerrypass",
    "email": "jerry@test.com",
    "role": "Lab PI"
  }'

echo ""
echo "Adding Mian user..."
curl -s -X POST "http://localhost:12001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Mian",
    "password": "mianpass",
    "email": "aureliaaa615@gmail.com",
    "role": "Master Student"
  }'

echo ""
echo "Adding Gabriel user..."
curl -s -X POST "http://localhost:12001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Gabriel",
    "password": "gabrielpass",
    "email": "123456@qq.com",
    "role": "Master Student"
  }'

echo ""
echo "✅ Users added!"
echo ""
echo "📋 Available users and passwords:"
echo "   • Jerry: jerrypass"
echo "   • Mian: mianpass"
echo "   • Gabriel: gabrielpass"
echo ""
echo "You can now log in with these credentials!"
