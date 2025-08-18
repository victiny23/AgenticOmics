#!/bin/bash

echo "👥 Adding Sample Team Data"
echo "========================="

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

# Create sample team
echo "2. Creating sample team..."
TEAM_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/teams/auto-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Su Team",
    "teamDescription": "Research team focused on data analysis",
    "labId": 5
  }')

echo "Team creation response: $TEAM_RESPONSE"

# Get demo token
echo "3. Getting demo user token..."
DEMO_RESPONSE=$(curl -s -X POST "http://localhost:8081/login" -H "Content-Type: application/json" -d '{"username":"demo","password":"demo123"}')
DEMO_TOKEN=$(echo "$DEMO_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DEMO_TOKEN" ]; then
    echo "❌ Failed to get demo token"
    exit 1
fi

echo "✅ Demo token obtained"

# Add demo user to team
echo "4. Adding demo user to team..."
MEMBERSHIP_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/team-memberships" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "teamName": "Su Team",
    "roleInTeam": "Team Member",
    "memberId": "DEMO001",
    "supervisorUsername": "admin",
    "isPrimaryTeam": true
  }')

echo "Membership response: $MEMBERSHIP_RESPONSE"

# Add admin to team
echo "5. Adding admin to team..."
ADMIN_MEMBERSHIP_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/team-memberships" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "teamName": "Su Team",
    "roleInTeam": "Team Leader",
    "memberId": "ADMIN001",
    "supervisorUsername": null,
    "isPrimaryTeam": true
  }')

echo "Admin membership response: $ADMIN_MEMBERSHIP_RESPONSE"

# Test the team memberships
echo "6. Testing team memberships..."
echo "Admin profile:"
curl -s "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Username: admin" | grep -o '"teamMemberships":\[[^]]*\]' || echo "No team memberships found"

echo "Demo profile:"
curl -s "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "X-Username: demo" | grep -o '"teamMemberships":\[[^]]*\]' || echo "No team memberships found"

echo ""
echo "🎉 Sample team data added!"
echo "========================="
echo "✅ Created Su Team"
echo "✅ Added admin as Team Leader"
echo "✅ Added demo as Team Member"
echo ""
echo "📱 Test the lab/team context selector:"
echo "1. Go to http://localhost:12000"
echo "2. Log in as admin (admin/admin123) or demo (demo/demo123)"
echo "3. Navigate to Data Upload or Data Management"
echo "4. You should see 'Su Team (TEAM001)' in the context selector" 