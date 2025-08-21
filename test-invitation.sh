#!/bin/bash

echo "🧪 Testing invitation functionality..."

# Get Jerry's token
echo "Getting Jerry's token..."
JERRY_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"Jerry","password":"jerrypass"}')

JERRY_TOKEN=$(echo $JERRY_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JERRY_TOKEN" ]; then
    echo "❌ Failed to get Jerry's token"
    exit 1
fi

echo "✅ Got Jerry's token"

# Test sending a lab invitation
echo "Testing lab invitation..."
INVITATION_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/lab-invitations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -H "X-Username: Jerry" \
  -d '{
    "invitedUsername": "Gabriel",
    "labId": 1,
    "invitedRole": "Master Student",
    "invitationMessage": "Welcome to our lab!"
  }')

echo "Invitation response: $INVITATION_RESPONSE"

# Check if invitation was created successfully
if echo "$INVITATION_RESPONSE" | grep -q "invitation"; then
    echo "✅ Lab invitation created successfully!"
else
    echo "❌ Failed to create lab invitation"
    echo "Response: $INVITATION_RESPONSE"
fi

echo ""
echo "🎉 Test completed!"
