#!/bin/bash

echo "🔧 Adding sample lab and team data..."

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

# First, let's check what users we have
echo "Current users:"
curl -s -X GET "http://localhost:12001/api/auth/public/users/basic" | jq '.[].username' 2>/dev/null || curl -s -X GET "http://localhost:12001/api/auth/public/users/basic"

echo ""
echo "Creating labs using admin user..."

# Try to create labs using the admin user
echo "Creating LAB001..."
RESPONSE1=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs" \
  -H "Content-Type: application/json" \
  -H "X-Username: admin" \
  -d '{
    "labId": "LAB001",
    "labName": "Genomics Research Lab",
    "labDescription": "Advanced genomics and bioinformatics research",
    "institution": "University of Science",
    "department": "Biology Department"
  }')
echo "Response: $RESPONSE1"

echo ""
echo "Creating LAB002..."
RESPONSE2=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs" \
  -H "Content-Type: application/json" \
  -H "X-Username: admin" \
  -d '{
    "labId": "LAB002",
    "labName": "Data Science Lab",
    "labDescription": "Machine learning and data analysis research",
    "institution": "University of Technology",
    "department": "Computer Science Department"
  }')
echo "Response: $RESPONSE2"

echo ""
echo "Testing if labs were created..."
curl -s -X GET "http://localhost:12001/api/auth/labs" -H "X-Username: admin"

echo ""
echo "✅ Sample lab data added!"
echo ""
echo "You can now test the invitation feature in the frontend." 