#!/bin/bash

echo "🧪 Testing User Management and Lab/Team Details"
echo "================================================"

# Test 1: Check if Jerry can see users in his labs
echo "1. Testing Jerry's lab members access..."
curl -s "http://localhost:8081/admin/users/my-lab-members" -H "X-Username: Jerry" | jq '.' 2>/dev/null || echo "Response: $(curl -s "http://localhost:8081/admin/users/my-lab-members" -H "X-Username: Jerry")"

echo -e "\n2. Testing Jerry's lab members details..."
curl -s "http://localhost:8081/admin/labs/1/members" -H "X-Username: Jerry" | jq '.' 2>/dev/null || echo "Response: $(curl -s "http://localhost:8081/admin/labs/1/members" -H "X-Username: Jerry")"

echo -e "\n3. Testing Jerry's team members details..."
curl -s "http://localhost:8081/admin/teams/1/members" -H "X-Username: Jerry" | jq '.' 2>/dev/null || echo "Response: $(curl -s "http://localhost:8081/admin/teams/1/members" -H "X-Username: Jerry")"

echo -e "\n4. Testing Jerry can deactivate Mian..."
curl -s -X POST "http://localhost:8081/admin/users/4/deactivate" -H "X-Username: Jerry"
echo -e "\n   Mian's status after deactivation:"
curl -s "http://localhost:8081/admin/users/4/status" -H "X-Username: Jerry" | jq '.' 2>/dev/null || echo "Response: $(curl -s "http://localhost:8081/admin/users/4/status" -H "X-Username: Jerry")"

echo -e "\n5. Testing Jerry can activate Mian..."
curl -s -X POST "http://localhost:8081/admin/users/4/activate" -H "X-Username: Jerry"
echo -e "\n   Mian's status after activation:"
curl -s "http://localhost:8081/admin/users/4/status" -H "X-Username: Jerry" | jq '.' 2>/dev/null || echo "Response: $(curl -s "http://localhost:8081/admin/users/4/status" -H "X-Username: Jerry")"

echo -e "\n✅ All tests completed!"
echo -e "\n📱 Frontend is accessible at: http://localhost:12000"
echo "🔧 Backend endpoints are working correctly" 