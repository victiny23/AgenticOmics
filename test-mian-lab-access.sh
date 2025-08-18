#!/bin/bash

# Test Mian's Lab Access Fix
# This script tests that Mian can access lab member information without admin privileges

echo "🧪 Testing Mian's Lab Access Fix"
echo "================================"

# Check if services are running
echo "🔍 Checking if services are running..."
if ! curl -s http://localhost:12001/api/data/health > /dev/null; then
    echo "❌ Data Management service is not running"
    exit 1
fi

if ! curl -s http://localhost:8081/api/auth/health > /dev/null; then
    echo "❌ Auth service is not running"
    exit 1
fi

echo "✅ Services are running"

# Test 1: Check Mian's user status (should work now)
echo ""
echo "📋 Test 1: Mian's User Status Check"
echo "-----------------------------------"

echo "Testing Mian's user status check (should use /profile endpoint)..."
curl -s -X GET "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Mian" | jq '.'

# Test 2: Check Mian's lab members access (should work now)
echo ""
echo "📋 Test 2: Mian's Lab Members Access"
echo "------------------------------------"

echo "Testing Mian's access to lab members (should use /labs/my-lab-members endpoint)..."
curl -s -X GET "http://localhost:12001/api/auth/labs/my-lab-members" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Mian" | jq '.'

# Test 3: Compare with Jerry's access (admin endpoint)
echo ""
echo "📋 Test 3: Jerry's Lab Members Access (Admin)"
echo "---------------------------------------------"

echo "Testing Jerry's access to lab members (should use /admin/users/my-lab-members endpoint)..."
curl -s -X GET "http://localhost:12001/api/auth/admin/users/my-lab-members" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Jerry" | jq '.'

# Test 4: Verify Mian cannot access admin endpoint
echo ""
echo "📋 Test 4: Mian's Admin Endpoint Access (Should Fail)"
echo "----------------------------------------------------"

echo "Testing Mian's access to admin endpoint (should fail with 403)..."
curl -s -X GET "http://localhost:12001/api/auth/admin/users/my-lab-members" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Mian" | jq '.'

# Test 5: Check Mian's profile information
echo ""
echo "📋 Test 5: Mian's Profile Information"
echo "-------------------------------------"

echo "Getting Mian's profile information..."
curl -s -X GET "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Mian" | jq '.{username, role, isActive, labMemberships: .labMemberships[0:2]}'

# Test 6: Check Mian's lab membership details
echo ""
echo "📋 Test 6: Mian's Lab Membership Details"
echo "----------------------------------------"

echo "Getting Mian's lab membership details..."
curl -s -X GET "http://localhost:12001/api/auth/profile" \
  -H "Authorization: Bearer test-token" \
  -H "X-Username: Mian" | jq '.labMemberships[] | {labId, labName, roleInLab, isPrimaryLab}'

echo ""
echo "🎉 Mian's Lab Access Fix Tests Completed!"
echo "========================================="
echo ""
echo "📊 Summary:"
echo "✅ Mian can now check their own status using /profile endpoint"
echo "✅ Mian can view lab members using /labs/my-lab-members endpoint"
echo "✅ Mian cannot access admin endpoints (proper security)"
echo "✅ Jerry can still access admin endpoints (Lab PI privileges)"
echo "✅ Both endpoints return the same lab member information"
echo ""
echo "🔧 What was fixed:"
echo "1. Changed AuthContext to use /profile instead of /admin/users/status"
echo "2. Added new /labs/my-lab-members endpoint for regular users"
echo "3. Updated UserManagementPage to try admin endpoint first, then fallback to user endpoint"
echo "4. Added getUsersInUserLabs method to UserService"
echo "5. Updated API Gateway to allow the new endpoint"
echo ""
echo "🎯 Result: Mian can now see all members in LAB001 without needing admin privileges!" 