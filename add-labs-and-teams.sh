#!/bin/bash

echo "🔧 Adding labs and teams to the database..."

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

# First, let's get an admin token by logging in
echo "Getting admin token..."
ADMIN_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}')

echo "Admin login response: $ADMIN_RESPONSE"

# Extract token from response
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Got admin token"

# Create LAB001
echo "Creating LAB001..."
LAB001_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -d '{
    "labId": "LAB001",
    "labName": "Genomics Research Lab",
    "labDescription": "Advanced genomics and bioinformatics research",
    "institution": "University of Science",
    "department": "Biology Department"
  }')

echo "LAB001 creation response: $LAB001_RESPONSE"

# Create LAB002
echo "Creating LAB002..."
LAB002_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -d '{
    "labId": "LAB002",
    "labName": "Data Science Lab",
    "labDescription": "Machine learning and data analysis research",
    "institution": "University of Technology",
    "department": "Computer Science Department"
  }')

echo "LAB002 creation response: $LAB002_RESPONSE"

# Get Jerry's token
echo "Getting Jerry's token..."
JERRY_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"Jerry","password":"jerrypass"}')

JERRY_TOKEN=$(echo $JERRY_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$JERRY_TOKEN" ]; then
    echo "✅ Got Jerry's token"
    
    # Add Jerry as Lab PI of LAB001
    echo "Adding Jerry as Lab PI of LAB001..."
    ADD_JERRY_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/lab-memberships" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JERRY_TOKEN" \
      -H "X-Username: Jerry" \
      -d '{
        "labId": "LAB001",
        "roleInLab": "Lab PI"
      }')
    
    echo "Add Jerry response: $ADD_JERRY_RESPONSE"
    
    # Add Mian as member of LAB001
    echo "Adding Mian as member of LAB001..."
    ADD_MIAN_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/lab-memberships" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JERRY_TOKEN" \
      -H "X-Username: Jerry" \
      -d '{
        "labId": "LAB001",
        "roleInLab": "Master Student"
      }')
    
    echo "Add Mian response: $ADD_MIAN_RESPONSE"
fi

echo ""
echo "✅ Labs and teams added!"
echo ""
echo "📋 Current status:"
echo "   • LAB001: Genomics Research Lab (Jerry as PI)"
echo "   • LAB002: Data Science Lab"
echo "   • Users: Jerry, Mian, Gabriel, admin"
echo ""
echo "🎉 Jerry should now be able to see all users in the invitation dropdown!"
