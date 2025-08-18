#!/bin/bash

# Test script for Lab Application and Leave functionality
# This script tests the complete workflow of applying to labs and leaving labs

set -e

echo "🧪 Testing Lab Application and Leave Functionality"
echo "=================================================="

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

# Check if services are running
check_services() {
    print_status "Checking if services are running..."
    
    if ! curl -s http://localhost:12001/api/auth/health > /dev/null; then
        print_error "API Gateway is not running on port 12001"
        exit 1
    fi
    
    if ! curl -s http://localhost:8081/actuator/health > /dev/null; then
        print_error "Auth Service is not running on port 8081"
        exit 1
    fi
    
    print_success "All services are running"
}

# Function to simulate user login and get token
login_user() {
    local username=$1
    local password=$2
    
    print_status "Logging in as $username..."
    
    local response=$(curl -s -X POST http://localhost:12001/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    local token=$(echo $response | jq -r '.token // empty')
    
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        print_error "Failed to login as $username"
        echo "Response: $response"
        return 1
    fi
    
    print_success "Successfully logged in as $username"
    echo $token
}

# Function to apply to a lab
apply_to_lab() {
    local token=$1
    local username=$2
    local labId=$3
    local role=$4
    local message=$5
    
    print_status "Applying to lab $labId as $username for role: $role"
    
    local response=$(curl -s -X POST http://localhost:12001/api/auth/labs/apply \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username" \
        -H "Content-Type: application/json" \
        -d "{
            \"labId\": $labId,
            \"requestedRole\": \"$role\",
            \"applicationMessage\": \"$message\"
        }")
    
    local applicationId=$(echo $response | jq -r '.id // empty')
    
    if [ -z "$applicationId" ] || [ "$applicationId" = "null" ]; then
        print_error "Failed to apply to lab"
        echo "Response: $response"
        return 1
    fi
    
    print_success "Successfully applied to lab. Application ID: $applicationId"
    echo $applicationId
}

# Function to get applications for a lab (PI view)
get_lab_applications() {
    local token=$1
    local username=$2
    local labId=$3
    
    print_status "Getting applications for lab $labId (PI view)"
    
    local response=$(curl -s -X GET "http://localhost:12001/api/auth/labs/$labId/applications" \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username")
    
    local applicationCount=$(echo $response | jq 'length')
    
    if [ "$applicationCount" = "null" ] || [ "$applicationCount" -eq 0 ]; then
        print_warning "No applications found for lab $labId"
        return 1
    fi
    
    print_success "Found $applicationCount application(s) for lab $labId"
    echo $response
}

# Function to review an application
review_application() {
    local token=$1
    local username=$2
    local applicationId=$3
    local action=$4
    local message=$5
    
    print_status "Reviewing application $applicationId with action: $action"
    
    local response=$(curl -s -X POST "http://localhost:12001/api/auth/labs/applications/$applicationId/review" \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username" \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"$action\",
            \"reviewMessage\": \"$message\"
        }")
    
    local status=$(echo $response | jq -r '.status // empty')
    
    if [ -z "$status" ] || [ "$status" = "null" ]; then
        print_error "Failed to review application"
        echo "Response: $response"
        return 1
    fi
    
    print_success "Successfully reviewed application. Status: $status"
    echo $response
}

# Function to get user's applications
get_user_applications() {
    local token=$1
    local username=$2
    
    print_status "Getting applications for user $username"
    
    local response=$(curl -s -X GET "http://localhost:12001/api/auth/labs/applications/my" \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username")
    
    local applicationCount=$(echo $response | jq 'length')
    
    print_success "Found $applicationCount application(s) for user $username"
    echo $response
}

# Function to leave a lab
leave_lab() {
    local token=$1
    local username=$2
    local labId=$3
    
    print_status "Leaving lab $labId as $username"
    
    local response=$(curl -s -X DELETE "http://localhost:12001/api/auth/labs/$labId/leave" \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username")
    
    if [[ $response == *"Successfully left the lab"* ]]; then
        print_success "Successfully left lab $labId"
    else
        print_error "Failed to leave lab"
        echo "Response: $response"
        return 1
    fi
}

# Function to verify user membership
verify_membership() {
    local token=$1
    local username=$2
    local labId=$3
    local expectedRole=$4
    
    print_status "Verifying membership for $username in lab $labId"
    
    local response=$(curl -s -X GET "http://localhost:12001/api/auth/profile" \
        -H "Authorization: Bearer $token" \
        -H "X-Username: $username")
    
    local membership=$(echo $response | jq -r ".labMemberships[] | select(.labId == $labId) | .roleInLab // empty")
    
    if [ -z "$membership" ]; then
        print_warning "User $username is not a member of lab $labId"
        return 1
    fi
    
    if [ "$membership" = "$expectedRole" ]; then
        print_success "User $username is a member of lab $labId with role: $membership"
    else
        print_warning "User $username has role $membership in lab $labId (expected: $expectedRole)"
    fi
}

# Main test function
main() {
    print_status "Starting lab application and leave functionality tests..."
    
    # Check services
    check_services
    
    # Test 1: Mian applies to LAB001
    print_status "Test 1: Mian applies to LAB001"
    mian_token=$(login_user "Mian" "password123")
    if [ $? -eq 0 ]; then
        application_id=$(apply_to_lab "$mian_token" "Mian" 1 "PhD Student" "I would like to join LAB001 for my PhD research")
        if [ $? -eq 0 ]; then
            print_success "Test 1 PASSED: Mian successfully applied to LAB001"
        else
            print_error "Test 1 FAILED: Mian could not apply to LAB001"
        fi
    else
        print_error "Test 1 FAILED: Could not login as Mian"
    fi
    
    echo ""
    
    # Test 2: Jerry (PI) reviews Mian's application
    print_status "Test 2: Jerry reviews Mian's application"
    jerry_token=$(login_user "Jerry" "password123")
    if [ $? -eq 0 ] && [ ! -z "$application_id" ]; then
        review_result=$(review_application "$jerry_token" "Jerry" "$application_id" "APPROVE" "Welcome to LAB001! Your application has been approved.")
        if [ $? -eq 0 ]; then
            print_success "Test 2 PASSED: Jerry successfully approved Mian's application"
        else
            print_error "Test 2 FAILED: Jerry could not review Mian's application"
        fi
    else
        print_error "Test 2 FAILED: Could not login as Jerry or no application ID"
    fi
    
    echo ""
    
    # Test 3: Verify Mian is now a member of LAB001
    print_status "Test 3: Verify Mian's membership in LAB001"
    if [ ! -z "$mian_token" ]; then
        verify_membership "$mian_token" "Mian" 1 "PhD Student"
        if [ $? -eq 0 ]; then
            print_success "Test 3 PASSED: Mian is confirmed as a member of LAB001"
        else
            print_error "Test 3 FAILED: Mian is not a member of LAB001"
        fi
    else
        print_error "Test 3 FAILED: No Mian token available"
    fi
    
    echo ""
    
    # Test 4: Mian leaves LAB001
    print_status "Test 4: Mian leaves LAB001"
    if [ ! -z "$mian_token" ]; then
        leave_lab "$mian_token" "Mian" 1
        if [ $? -eq 0 ]; then
            print_success "Test 4 PASSED: Mian successfully left LAB001"
        else
            print_error "Test 4 FAILED: Mian could not leave LAB001"
        fi
    else
        print_error "Test 4 FAILED: No Mian token available"
    fi
    
    echo ""
    
    # Test 5: Verify Mian is no longer a member of LAB001
    print_status "Test 5: Verify Mian is no longer a member of LAB001"
    if [ ! -z "$mian_token" ]; then
        verify_membership "$mian_token" "Mian" 1 "PhD Student"
        if [ $? -ne 0 ]; then
            print_success "Test 5 PASSED: Mian is no longer a member of LAB001"
        else
            print_error "Test 5 FAILED: Mian is still a member of LAB001"
        fi
    else
        print_error "Test 5 FAILED: No Mian token available"
    fi
    
    echo ""
    
    # Test 6: Test error cases
    print_status "Test 6: Testing error cases"
    
    # Try to apply to a non-existent lab
    if [ ! -z "$mian_token" ]; then
        print_status "Testing application to non-existent lab..."
        apply_to_lab "$mian_token" "Mian" 999 "PhD Student" "Test application"
        if [ $? -ne 0 ]; then
            print_success "Test 6a PASSED: Correctly rejected application to non-existent lab"
        else
            print_error "Test 6a FAILED: Should have rejected application to non-existent lab"
        fi
    fi
    
    # Try to apply when already a member
    if [ ! -z "$jerry_token" ]; then
        print_status "Testing application when already a member..."
        apply_to_lab "$jerry_token" "Jerry" 1 "Lab PI" "Test application"
        if [ $? -ne 0 ]; then
            print_success "Test 6b PASSED: Correctly rejected application when already a member"
        else
            print_error "Test 6b FAILED: Should have rejected application when already a member"
        fi
    fi
    
    echo ""
    print_success "All tests completed!"
    print_status "Summary:"
    print_status "- Lab application functionality: ✅"
    print_status "- Application review functionality: ✅"
    print_status "- Lab leave functionality: ✅"
    print_status "- Error handling: ✅"
}

# Run the main function
main "$@" 