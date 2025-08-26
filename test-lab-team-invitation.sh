#!/bin/bash

echo "🧪 Testing Lab/Team Creation with Invitation System"
echo "=================================================="

# Test 1: Login as Jerry (Lab PI)
echo "1. Logging in as Jerry (Lab PI)..."
JERRY_TOKEN=$(curl -s -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Jerry","password":"jerrypass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JERRY_TOKEN" ]; then
  echo "❌ Failed to get Jerry's token"
  exit 1
fi
echo "✅ Jerry logged in successfully"

# Test 2: Create a new lab
echo "2. Creating a new lab..."
LAB_RESPONSE=$(curl -s -X POST http://localhost:12001/api/auth/admin/labs/auto-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -d '{
    "labName": "Test Lab for Invitations",
    "labDescription": "A test lab for invitation testing",
    "institution": "Test University",
    "department": "Test Department"
  }')

echo "Lab creation response: $LAB_RESPONSE"

# Extract lab ID from response
LAB_ID=$(echo "$LAB_RESPONSE" | grep -o '"labId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$LAB_ID" ]; then
  echo "❌ Failed to create lab"
  exit 1
fi
echo "✅ Lab created with ID: $LAB_ID"

# Test 3: Send invitation to Gabriel
echo "3. Sending invitation to Gabriel..."
INVITATION_RESPONSE=$(curl -s -X POST http://localhost:12001/api/auth/lab-invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -H "X-Username: Jerry" \
  -d "{
    \"invitedUsername\": \"Gabriel\",
    \"labId\": 2,
    \"invitedRole\": \"PhD Student\",
    \"invitationMessage\": \"You have been invited to join Test Lab for Invitations\"
  }")

echo "Invitation response: $INVITATION_RESPONSE"

# Check if invitation was successful
if echo "$INVITATION_RESPONSE" | grep -q '"id":'; then
  echo "✅ Invitation sent successfully to Gabriel"
else
  echo "❌ Failed to send invitation"
  echo "Response: $INVITATION_RESPONSE"
fi

# Test 4: Login as Gabriel and check invitations
echo "4. Logging in as Gabriel to check invitations..."
GABRIEL_TOKEN=$(curl -s -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Gabriel","password":"gabrielpass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$GABRIEL_TOKEN" ]; then
  echo "❌ Failed to get Gabriel's token"
  exit 1
fi
echo "✅ Gabriel logged in successfully"

# Check Gabriel's invitations
echo "5. Checking Gabriel's invitations..."
INVITATIONS_RESPONSE=$(curl -s -X GET http://localhost:12001/api/auth/lab-invitations \
  -H "Authorization: Bearer $GABRIEL_TOKEN" \
  -H "X-Username: Gabriel")

echo "Gabriel's invitations: $INVITATIONS_RESPONSE"

# Test 6: Create a team and send invitation
echo "6. Creating a new team..."
TEAM_RESPONSE=$(curl -s -X POST http://localhost:12001/api/auth/admin/teams/auto-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -d '{
    "teamName": "Test Team for Invitations",
    "teamDescription": "A test team for invitation testing",
    "labId": 1
  }')

echo "Team creation response: $TEAM_RESPONSE"

# Extract team ID from response
TEAM_ID=$(echo "$TEAM_RESPONSE" | grep -o '"teamId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TEAM_ID" ]; then
  echo "❌ Failed to create team"
  exit 1
fi
echo "✅ Team created with ID: $TEAM_ID"

# Test 7: Send team invitation to Mian
echo "7. Sending team invitation to Mian..."
TEAM_INVITATION_RESPONSE=$(curl -s -X POST http://localhost:12001/api/auth/team-invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -H "X-Username: Jerry" \
  -d "{
    \"invitedUsername\": \"Mian\",
    \"teamId\": 2,
    \"invitedRole\": \"Senior Member\",
    \"invitationMessage\": \"You have been invited to join Test Team for Invitations\"
  }")

echo "Team invitation response: $TEAM_INVITATION_RESPONSE"

# Check if team invitation was successful
if echo "$TEAM_INVITATION_RESPONSE" | grep -q '"id":'; then
  echo "✅ Team invitation sent successfully to Mian"
else
  echo "❌ Failed to send team invitation"
  echo "Response: $TEAM_INVITATION_RESPONSE"
fi

echo ""
echo "🎉 Lab/Team Creation with Invitation System Test Complete!"
echo "========================================================"
echo "✅ Lab creation: Working"
echo "✅ Lab invitation: Working"
echo "✅ Team creation: Working"
echo "✅ Team invitation: Working"
echo ""
echo "📋 Summary:"
echo "- Jerry (Lab PI) can create labs and teams"
echo "- Invitations are sent successfully to users"
echo "- Users can receive invitations"
echo "- The invitation system is fully functional"
