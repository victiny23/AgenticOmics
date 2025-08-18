#!/bin/bash

# Test script for role-based access control in User Management
# This script tests that:
# 1. Regular members (like Mian) can only see members in their own lab/team
# 2. PIs and Team Leaders can see all users organized by their organizations

echo "🧪 Testing Role-Based Access Control in User Management"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to make API calls
make_api_call() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4
    local username=$5
    
    if [ -n "$data" ]; then
        if [ -n "$token" ]; then
            curl -s -X "$method" "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -H "X-Username: $username" \
                -d "$data"
        else
            curl -s -X "$method" "$url" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
    else
        if [ -n "$token" ]; then
            curl -s -X "$method" "$url" \
                -H "Authorization: Bearer $token" \
                -H "X-Username: $username"
        else
            curl -s -X "$method" "$url"
        fi
    fi
}

# Function to extract JWT token from response
extract_token() {
    echo "$1" | jq -r '.token // .access_token // empty'
}

# Function to check if services are running
check_services() {
    print_status "Checking if services are running..."
    
    # Check API Gateway
    if curl -s http://localhost:12001/api/auth/health > /dev/null 2>&1; then
        print_success "API Gateway is running on port 12001"
    else
        print_error "API Gateway is not running on port 12001"
        return 1
    fi
    
    # Check Auth Service
    if curl -s http://localhost:8081/api/auth/health > /dev/null 2>&1; then
        print_success "Auth Service is running on port 8081"
    else
        print_error "Auth Service is not running on port 8081"
        return 1
    fi
    
    return 0
}

# Function to login user
login_user() {
    local username=$1
    local password=$2
    
    print_status "Logging in user: $username"
    
    local response=$(make_api_call "POST" "http://localhost:12001/api/auth/login" "{\"username\":\"$username\",\"password\":\"$password\"}")
    local token=$(extract_token "$response")
    
    if [ -n "$token" ] && [ "$token" != "null" ]; then
        print_success "Login successful for $username"
        echo "$token"
    else
        print_error "Login failed for $username"
        echo "$response"
        return 1
    fi
}

# Function to test regular member access (Mian)
test_regular_member_access() {
    print_status "Testing regular member access (Mian)..."
    
    local mian_token=$(login_user "Mian" "password123")
    if [ $? -ne 0 ]; then
        print_error "Failed to login Mian"
        return 1
    fi
    
    # Test that Mian can only see members in her lab
    print_status "Testing Mian's access to lab members..."
    local response=$(make_api_call "GET" "http://localhost:12001/api/auth/labs/my-lab-members" "" "$mian_token" "Mian")
    
    if echo "$response" | jq -e '.users' > /dev/null 2>&1; then
        local user_count=$(echo "$response" | jq '.users | length')
        print_success "Mian can see $user_count users in her lab"
        echo "$response" | jq '.users[] | {username: .username, role: .role}'
    else
        print_error "Mian cannot access lab members"
        echo "$response"
        return 1
    fi
    
    # Test that Mian cannot access admin endpoints
    print_status "Testing that Mian cannot access admin endpoints..."
    local admin_response=$(make_api_call "GET" "http://localhost:12001/api/auth/admin/users/all-with-organizations" "" "$mian_token" "Mian")
    
    if echo "$admin_response" | jq -e '.error' > /dev/null 2>&1; then
        print_success "Mian correctly denied access to admin endpoint"
    else
        print_error "Mian should not have access to admin endpoint"
        echo "$admin_response"
        return 1
    fi
}

# Function to test PI access (Jerry)
test_pi_access() {
    print_status "Testing PI access (Jerry)..."
    
    local jerry_token=$(login_user "Jerry" "password123")
    if [ $? -ne 0 ]; then
        print_error "Failed to login Jerry"
        return 1
    fi
    
    # Test that Jerry can see all users with organization info
    print_status "Testing Jerry's access to all users with organizations..."
    local response=$(make_api_call "GET" "http://localhost:12001/api/auth/admin/users/all-with-organizations" "" "$jerry_token" "Jerry")
    
    if echo "$response" | jq -e '.users' > /dev/null 2>&1; then
        local user_count=$(echo "$response" | jq '.users | length')
        print_success "Jerry can see $user_count users with organization info"
        
        # Show organization structure
        echo "$response" | jq '.users[] | {username: .username, role: .role, labMemberships: [.labMemberships[] | {labName: .labName, roleInLab: .roleInLab}], teamMemberships: [.teamMemberships[] | {teamName: .teamName, roleInTeam: .roleInTeam}]}'
    else
        print_error "Jerry cannot access users with organization info"
        echo "$response"
        return 1
    fi
}

# Function to test organization grouping
test_organization_grouping() {
    print_status "Testing organization grouping..."
    
    local jerry_token=$(login_user "Jerry" "password123")
    if [ $? -ne 0 ]; then
        print_error "Failed to login Jerry"
        return 1
    fi
    
    # Get users with organizations and check if Jerry's multiple lab memberships are shown
    local response=$(make_api_call "GET" "http://localhost:12001/api/auth/admin/users/all-with-organizations" "" "$jerry_token" "Jerry")
    
    if echo "$response" | jq -e '.users' > /dev/null 2>&1; then
        # Check if Jerry has multiple lab memberships
        local jerry_labs=$(echo "$response" | jq '.users[] | select(.username == "Jerry") | .labMemberships | length')
        if [ "$jerry_labs" -gt 1 ]; then
            print_success "Jerry's multiple lab memberships are properly shown ($jerry_labs labs)"
            echo "$response" | jq '.users[] | select(.username == "Jerry") | .labMemberships[] | {labName: .labName, roleInLab: .roleInLab, isPrimaryLab: .isPrimaryLab}'
        else
            print_warning "Jerry has only $jerry_labs lab membership(s)"
        fi
    else
        print_error "Failed to get users with organization info"
        return 1
    fi
}

# Main test execution
main() {
    echo "Starting role-based access control tests..."
    
    # Check if services are running
    if ! check_services; then
        print_error "Services are not running. Please start the services first."
        exit 1
    fi
    
    echo ""
    
    # Test regular member access
    if test_regular_member_access; then
        print_success "Regular member access test passed"
    else
        print_error "Regular member access test failed"
    fi
    
    echo ""
    
    # Test PI access
    if test_pi_access; then
        print_success "PI access test passed"
    else
        print_error "PI access test failed"
    fi
    
    echo ""
    
    # Test organization grouping
    if test_organization_grouping; then
        print_success "Organization grouping test passed"
    else
        print_error "Organization grouping test failed"
    fi
    
    echo ""
    print_status "Role-based access control tests completed!"
}

# Run the main function
main 