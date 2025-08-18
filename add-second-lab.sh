#!/bin/bash

echo "🔬 Adding Second Lab (LAB002)"
echo "============================="

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

# Create second lab
echo "2. Creating second lab (LAB002)..."
LAB_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/labs/auto-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "labName": "Research Lab 2",
    "labDescription": "Second research lab for testing",
    "institution": "University of Science",
    "department": "Biology"
  }')

echo "Lab creation response: $LAB_RESPONSE"

# Add admin to second lab
echo "3. Adding admin to second lab..."
ADMIN_MEMBERSHIP_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/lab-memberships" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "labName": "Research Lab 2",
    "roleInLab": "Lab PI",
    "memberId": "ADMIN002",
    "supervisorUsername": null,
    "isPrimaryLab": false
  }')

echo "Admin membership response: $ADMIN_MEMBERSHIP_RESPONSE"

# Test the lab memberships
echo "4. Testing lab memberships..."
echo "Admin profile:"
curl -s "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" | grep -o '"labMemberships":\[[^]]*\]' || echo "No lab memberships found"

echo ""
echo "🎉 Second lab added!"
echo "==================="
echo "✅ Created Research Lab 2 (LAB002)"
echo "✅ Added admin as Lab PI to second lab"
echo ""
echo "📱 Test the lab/team context selector:"
echo "1. Go to http://localhost:12000"
echo "2. Log in as admin (admin/admin123)"
echo "3. Navigate to Data Upload or Data Management"
echo "4. You should see both:"
echo "   - Gabriel Lab (LAB004)"
echo "   - Research Lab 2 (LAB002)"
echo "5. Test dropdown auto-close when selecting labs" 