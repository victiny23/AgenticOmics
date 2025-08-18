#!/bin/bash

echo "🔬 Adding Sample Lab Data"
echo "========================"

# Get admin token
echo "1. Getting admin token..."
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin}
ADMIN_RESPONSE=$(curl -s -X POST "http://localhost:8081/login" -H "Content-Type: application/json" -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Admin token obtained"

# Create sample lab with auto-increment
echo "2. Creating sample lab with auto-increment..."
LAB_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs/auto-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "labName": "Gabriel Lab",
    "labDescription": "Research lab focused on genomics and bioinformatics",
    "institution": "University of Science",
    "department": "Biology"
  }')

echo "Lab creation response: $LAB_RESPONSE"

# Get demo token
echo "3. Getting demo user token..."
DEMO_USERNAME=${DEMO_USERNAME:-demo}
DEMO_PASSWORD=${DEMO_PASSWORD:-demo}
DEMO_RESPONSE=$(curl -s -X POST "http://localhost:8081/login" -H "Content-Type: application/json" -d "{\"username\":\"$DEMO_USERNAME\",\"password\":\"$DEMO_PASSWORD\"}")
DEMO_TOKEN=$(echo "$DEMO_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DEMO_TOKEN" ]; then
    echo "❌ Failed to get demo token"
    exit 1
fi

echo "✅ Demo token obtained"

# Add demo user to lab
echo "4. Adding demo user to lab..."
MEMBERSHIP_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/lab-memberships" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "labName": "Gabriel Lab",
    "roleInLab": "PhD Student",
    "memberId": "DEMO001",
    "supervisorUsername": "admin",
    "isPrimaryLab": true
  }')

echo "Membership response: $MEMBERSHIP_RESPONSE"

# Add admin to lab
echo "5. Adding admin to lab..."
ADMIN_MEMBERSHIP_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/lab-memberships" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "labName": "Gabriel Lab",
    "roleInLab": "Lab PI",
    "memberId": "ADMIN001",
    "supervisorUsername": null,
    "isPrimaryLab": true
  }')

echo "Admin membership response: $ADMIN_MEMBERSHIP_RESPONSE"

# Test the lab memberships
echo "6. Testing lab memberships..."
echo "Admin profile:"
curl -s "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" | grep -o '"labMemberships":\[[^]]*\]' || echo "No lab memberships found"

echo "Demo profile:"
curl -s "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "X-Username: demo" | grep -o '"labMemberships":\[[^]]*\]' || echo "No lab memberships found"

echo ""
echo "🎉 Sample lab data added!"
echo "========================="
echo "✅ Created Gabriel Lab"
echo "✅ Added admin as Lab PI"
echo "✅ Added demo as PhD Student"
echo ""
echo "📱 Test the lab/team context selector:"
echo "1. Go to http://localhost:12000"
echo "2. Log in with your credentials (use environment variables ADMIN_USERNAME/ADMIN_PASSWORD)"
echo "3. Navigate to Data Upload or Data Management"
echo "4. You should see 'Gabriel Lab (LAB001)' in the context selector" 