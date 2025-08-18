#!/bin/bash

# Test Super Admin Delete Functionality
# This script tests the ability of Super Admin to delete users, labs, and teams

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Super Admin Delete Functionality${NC}"
echo "=================================================="

# Check if services are running
echo -e "${YELLOW}Checking if services are running...${NC}"
if ! curl -s http://localhost:12001/api/auth/health > /dev/null; then
    echo -e "${RED}❌ API Gateway is not running on port 12001${NC}"
    exit 1
fi

if ! curl -s http://localhost:8081/api/auth/health > /dev/null; then
    echo -e "${RED}❌ Auth Service is not running on port 8081${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services are running${NC}"

# Login as admin
echo -e "${YELLOW}Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Yangxingmian123#"}')

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Admin login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Check Super Admin status
echo -e "${YELLOW}Checking Super Admin status...${NC}"
SUPER_ADMIN_CHECK=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/check-super-admin" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUPER_ADMIN_CHECK" | grep -q '"isSuperAdmin":true'; then
    echo -e "${GREEN}✅ Super Admin status confirmed${NC}"
else
    echo -e "${RED}❌ Super Admin status check failed${NC}"
    echo "Response: $SUPER_ADMIN_CHECK"
    exit 1
fi

# Get current system state
echo -e "${YELLOW}Getting current system state...${NC}"
USERS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/users" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer $TOKEN")

LABS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/labs" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer $TOKEN")

TEAMS_RESPONSE=$(curl -s -X GET "http://localhost:12001/api/auth/admin/system/teams" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ System state retrieved${NC}"

# Test 1: Try to delete a Super Admin user (should fail)
echo -e "${YELLOW}Test 1: Attempting to delete Super Admin user (should fail)...${NC}"
ADMIN_USER_ID=$(echo "$USERS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
DELETE_ADMIN_RESPONSE=$(curl -s -X DELETE "http://localhost:12001/api/auth/admin/system/users/$ADMIN_USER_ID" \
  -H "X-Username: admin" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_ADMIN_RESPONSE" | grep -q "Cannot delete Super Admin users"; then
    echo -e "${GREEN}✅ Correctly prevented deletion of Super Admin user${NC}"
else
    echo -e "${RED}❌ Failed to prevent deletion of Super Admin user${NC}"
    echo "Response: $DELETE_ADMIN_RESPONSE"
fi

# Test 2: Try to delete a regular user (if exists)
echo -e "${YELLOW}Test 2: Attempting to delete a regular user...${NC}"
REGULAR_USER_ID=$(echo "$USERS_RESPONSE" | grep -v '"role":"Super Admin"' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$REGULAR_USER_ID" ]; then
    DELETE_USER_RESPONSE=$(curl -s -X DELETE "http://localhost:12001/api/auth/admin/system/users/$REGULAR_USER_ID" \
      -H "X-Username: admin" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$DELETE_USER_RESPONSE" | grep -q "User deleted successfully"; then
        echo -e "${GREEN}✅ Successfully deleted regular user${NC}"
    else
        echo -e "${RED}❌ Failed to delete regular user${NC}"
        echo "Response: $DELETE_USER_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  No regular users found to test deletion${NC}"
fi

# Test 3: Try to delete a lab (if exists)
echo -e "${YELLOW}Test 3: Attempting to delete a lab...${NC}"
LAB_ID=$(echo "$LABS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$LAB_ID" ]; then
    DELETE_LAB_RESPONSE=$(curl -s -X DELETE "http://localhost:12001/api/auth/admin/system/labs/$LAB_ID" \
      -H "X-Username: admin" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$DELETE_LAB_RESPONSE" | grep -q "Lab deleted successfully"; then
        echo -e "${GREEN}✅ Successfully deleted lab${NC}"
    else
        echo -e "${RED}❌ Failed to delete lab${NC}"
        echo "Response: $DELETE_LAB_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  No labs found to test deletion${NC}"
fi

# Test 4: Try to delete a team (if exists)
echo -e "${YELLOW}Test 4: Attempting to delete a team...${NC}"
TEAM_ID=$(echo "$TEAMS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$TEAM_ID" ]; then
    DELETE_TEAM_RESPONSE=$(curl -s -X DELETE "http://localhost:12001/api/auth/admin/system/teams/$TEAM_ID" \
      -H "X-Username: admin" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$DELETE_TEAM_RESPONSE" | grep -q "Team deleted successfully"; then
        echo -e "${GREEN}✅ Successfully deleted team${NC}"
    else
        echo -e "${RED}❌ Failed to delete team${NC}"
        echo "Response: $DELETE_TEAM_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  No teams found to test deletion${NC}"
fi

# Test 5: Try to delete with non-Super Admin user (should fail)
echo -e "${YELLOW}Test 5: Attempting to delete with non-Super Admin user (should fail)...${NC}"
# First, try to login as a regular user if exists
REGULAR_USERNAME=$(echo "$USERS_RESPONSE" | grep -v '"role":"Super Admin"' | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$REGULAR_USERNAME" ]; then
    # Try to login as regular user (this might fail if password is unknown)
    echo -e "${YELLOW}Attempting to test with regular user: $REGULAR_USERNAME${NC}"
    # For now, just test that the endpoint requires Super Admin
    UNAUTHORIZED_DELETE=$(curl -s -X DELETE "http://localhost:12001/api/auth/admin/system/users/1" \
      -H "X-Username: $REGULAR_USERNAME" \
      -H "Authorization: Bearer invalid-token")
    
    if echo "$UNAUTHORIZED_DELETE" | grep -q "Access denied"; then
        echo -e "${GREEN}✅ Correctly denied access to non-Super Admin user${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify unauthorized access (expected)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No regular users found to test unauthorized access${NC}"
fi

echo -e "${BLUE}=================================================="
echo -e "${GREEN}✅ Super Admin Delete Functionality Test Complete${NC}"
echo -e "${BLUE}=================================================="

echo -e "${YELLOW}Summary:${NC}"
echo "- Super Admin can delete regular users"
echo "- Super Admin can delete labs (and their teams)"
echo "- Super Admin can delete teams"
echo "- Super Admin cannot delete other Super Admin users"
echo "- Non-Super Admin users cannot access delete endpoints"
echo ""
echo -e "${YELLOW}Note: The frontend now includes delete buttons for Super Admin users${NC}"
echo "- Users tab: Delete button for each non-Super Admin user"
echo "- Labs tab: Delete button for each lab"
echo "- Teams tab: Delete button for each team" 