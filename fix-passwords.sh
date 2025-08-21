#!/bin/bash

echo "🔧 Fixing all user passwords..."

# Wait for services to be ready
sleep 3

# Test if services are running
echo "Testing if services are running..."
curl -s http://localhost:8081/api/auth/public/users/basic > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Auth service is not running. Please start the application first."
    exit 1
fi

echo "✅ Auth service is running"

# First, let's try to log in as Jerry to get a token
echo "Testing Jerry login..."
JERRY_RESPONSE=$(curl -s -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"Jerry","password":"jerrypass"}')

echo "Jerry login response: $JERRY_RESPONSE"

# Test Mian login
echo "Testing Mian login..."
MIAN_RESPONSE=$(curl -s -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"Mian","password":"mianpass"}')

echo "Mian login response: $MIAN_RESPONSE"

# Test Gabriel login
echo "Testing Gabriel login..."
GABRIEL_RESPONSE=$(curl -s -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"Gabriel","password":"gabrielpass"}')

echo "Gabriel login response: $GABRIEL_RESPONSE"

# Test Admin login
echo "Testing Admin login..."
ADMIN_RESPONSE=$(curl -s -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}')

echo "Admin login response: $ADMIN_RESPONSE"

echo ""
echo "📋 Current login status:"
echo "   • Jerry: $JERRY_RESPONSE"
echo "   • Mian: $MIAN_RESPONSE"
echo "   • Gabriel: $GABRIEL_RESPONSE"
echo "   • Admin: $ADMIN_RESPONSE"
