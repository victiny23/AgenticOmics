#!/bin/bash

echo "🧪 Testing Invitation Display for Each User"
echo "==========================================="

# Test 1: Check Jerry's invitations
echo "1. Checking Jerry's invitations..."
JERRY_TOKEN=$(curl -s -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Jerry","password":"jerrypass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Jerry's Lab Invitations:"
curl -s -X GET http://localhost:12001/api/auth/lab-invitations/my-invitations \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -H "X-Username: Jerry" | jq '.[] | {id, labName, invitedByUsername, invitedRole, status}'

echo ""
echo "Jerry's Team Invitations:"
curl -s -X GET http://localhost:12001/api/auth/team-invitations/my-invitations \
  -H "Authorization: Bearer $JERRY_TOKEN" \
  -H "X-Username: Jerry" | jq '.[] | {id, teamName, invitedByUsername, invitedRole, status}'

echo ""
echo ""

# Test 2: Check Gabriel's invitations
echo "2. Checking Gabriel's invitations..."
GABRIEL_TOKEN=$(curl -s -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Gabriel","password":"gabrielpass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Gabriel's Lab Invitations:"
curl -s -X GET http://localhost:12001/api/auth/lab-invitations/my-invitations \
  -H "Authorization: Bearer $GABRIEL_TOKEN" \
  -H "X-Username: Gabriel" | jq '.[] | {id, labName, invitedByUsername, invitedRole, status}'

echo ""
echo "Gabriel's Team Invitations:"
curl -s -X GET http://localhost:12001/api/auth/team-invitations/my-invitations \
  -H "Authorization: Bearer $GABRIEL_TOKEN" \
  -H "X-Username: Gabriel" | jq '.[] | {id, teamName, invitedByUsername, invitedRole, status}'

echo ""
echo ""

# Test 3: Check Mian's pending approvals
echo "3. Checking Mian's pending approvals..."
MIAN_TOKEN=$(curl -s -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Mian","password":"mianpass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Mian's Pending Lab Approvals:"
curl -s -X GET http://localhost:12001/api/auth/lab-invitations/pending-approvals \
  -H "Authorization: Bearer $MIAN_TOKEN" \
  -H "X-Username: Mian" | jq '.[] | {id, labName, invitedUsername, invitedRole, status}'

echo ""
echo "Mian's Pending Team Approvals:"
curl -s -X GET http://localhost:12001/api/auth/team-invitations/pending-approvals \
  -H "Authorization: Bearer $MIAN_TOKEN" \
  -H "X-Username: Mian" | jq '.[] | {id, teamName, invitedUsername, invitedRole, status}'

echo ""
echo "🎉 Invitation Display Test Complete!"
echo "==================================="
echo "Expected Results:"
echo "- Jerry should see 1 team invitation from Mian for Team888"
echo "- Gabriel should see 1 team invitation from Mian for Team888"
echo "- Mian should see 2 pending team approvals for Team888"
echo ""
echo "If you see 'Test Lab for Invitations' anywhere, that's old test data"
echo "that should be cleared or ignored."
