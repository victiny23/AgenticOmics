#!/bin/bash

echo "🧪 Testing Super Admin Functionality Fix"
echo "========================================"

# Test 1: Check if admin user exists and is Super Admin
echo "1. Testing admin user Super Admin status..."
ADMIN_CHECK=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/check-super-admin" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer test-token")

if echo "$ADMIN_CHECK" | grep -q '"isSuperAdmin":true'; then
    echo "✅ Admin user is correctly identified as Super Admin"
else
    echo "❌ Admin user is NOT identified as Super Admin"
    echo "Response: $ADMIN_CHECK"
fi

# Test 2: Test system overview endpoint
echo ""
echo "2. Testing system overview endpoint..."
OVERVIEW_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/overview" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer test-token")

if echo "$OVERVIEW_RESPONSE" | grep -q '"totalUsers"'; then
    echo "✅ System overview endpoint is working"
    echo "   Response preview: $(echo "$OVERVIEW_RESPONSE" | head -c 100)..."
else
    echo "❌ System overview endpoint failed"
    echo "   Response: $OVERVIEW_RESPONSE"
fi

# Test 3: Test users endpoint
echo ""
echo "3. Testing users endpoint..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/users" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer test-token")

if echo "$USERS_RESPONSE" | grep -q '"id"'; then
    echo "✅ Users endpoint is working"
    echo "   Response preview: $(echo "$USERS_RESPONSE" | head -c 100)..."
else
    echo "❌ Users endpoint failed"
    echo "   Response: $USERS_RESPONSE"
fi

# Test 4: Test labs endpoint
echo ""
echo "4. Testing labs endpoint..."
LABS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/labs" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer test-token")

if echo "$LABS_RESPONSE" | grep -q '"labId"'; then
    echo "✅ Labs endpoint is working"
    echo "   Response preview: $(echo "$LABS_RESPONSE" | head -c 100)..."
else
    echo "❌ Labs endpoint failed"
    echo "   Response: $LABS_RESPONSE"
fi

# Test 5: Test teams endpoint
echo ""
echo "5. Testing teams endpoint..."
TEAMS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/teams" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer test-token")

if echo "$TEAMS_RESPONSE" | grep -q '"teamId"'; then
    echo "✅ Teams endpoint is working"
    echo "   Response preview: $(echo "$TEAMS_RESPONSE" | head -c 100)..."
else
    echo "❌ Teams endpoint failed"
    echo "   Response: $TEAMS_RESPONSE"
fi

echo ""
echo "🎯 Super Admin API Testing Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Open your browser and go to http://localhost:12000"
echo "2. Log in with admin credentials"
echo "3. Navigate to 'System Administration' in the sidebar"
echo "4. Verify that all tabs (Overview, Users, Labs, Teams) load correctly"
echo ""
echo "🔧 If you still see 'Error checking Super Admin status':"
echo "   - Check browser console for detailed error messages"
echo "   - Ensure you're logged in as admin user"
echo "   - Verify the JWT token is valid in localStorage" 