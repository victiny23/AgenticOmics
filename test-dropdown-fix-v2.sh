#!/bin/bash

echo "Testing Dropdown Fix - Empty Options Issue"
echo "=========================================="

# Check if services are running
echo "1. Checking if services are running..."
if curl -s http://localhost:12001/api/data/health > /dev/null; then
    echo "   ✓ Data Management Service is running"
else
    echo "   ✗ Data Management Service is not running"
    exit 1
fi

if curl -s http://localhost:12001/api/auth/health > /dev/null; then
    echo "   ✓ Auth Service is running"
else
    echo "   ✗ Auth Service is not running"
    exit 1
fi

echo ""
echo "2. Issue Identified:"
echo "   ✓ MUI Select component receiving out-of-range value"
echo "   ✓ Available options are empty"
echo "   ✓ Lab/team data not loading properly"

echo ""
echo "3. Fixes Applied:"
echo "   ✓ Added loading check before rendering Select"
echo "   ✓ Added disabled state when no memberships available"
echo "   ✓ Enhanced error handling in loadUserMemberships"
echo "   ✓ Added useEffect to clear selectedContext when no options"
echo "   ✓ Added better debugging for data loading"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open the application in your browser"
echo "   b. Open browser developer console (F12)"
echo "   c. Navigate to the Data page"
echo "   d. Look for console messages:"
echo "      - 'Loading memberships for user: [username]'"
echo "      - 'Profile data received: [object]'"
echo "      - 'Active labs loaded: [array]'"
echo "      - 'Lab memberships count: X'"
echo "   e. Verify dropdown shows loading state initially"
echo "   f. Verify dropdown becomes enabled with options"
echo "   g. Try selecting LAB002 and verify it works"

echo ""
echo "5. Expected Behavior:"
echo "   ✓ Dropdown shows loading state until data is loaded"
echo "   ✓ No MUI out-of-range value errors"
echo "   ✓ Dropdown options appear once data is loaded"
echo "   ✓ LAB002 selection works correctly"
echo "   ✓ Current Context updates properly"

echo ""
echo "6. Debug Information to Check:"
echo "   - Profile data loading successfully"
echo "   - Lab memberships count > 0"
echo "   - Team memberships count > 0"
echo "   - No JavaScript errors in console"

echo ""
echo "Please test this now and check the browser console for the debug information." 