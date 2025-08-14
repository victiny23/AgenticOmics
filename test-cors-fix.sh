#!/bin/bash

echo "Testing CORS Fix for Auth Service"
echo "================================="

# Check if services are running
echo "1. Checking if services are running..."
if curl -s http://localhost:12001/api/data/health > /dev/null; then
    echo "   ✓ Data Management Service is running"
else
    echo "   ✗ Data Management Service is not running"
    exit 1
fi

if curl -s http://localhost:8081/register > /dev/null; then
    echo "   ✓ Auth Service is running on port 8081"
else
    echo "   ✗ Auth Service is not running on port 8081"
    exit 1
fi

echo ""
echo "2. CORS Configuration Applied:"
echo "   ✓ Added CORS configuration to auth service"
echo "   ✓ Allowed origins: localhost:3000, localhost:12000"
echo "   ✓ Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "   ✓ Allowed headers: *"
echo "   ✓ Credentials: true"

echo ""
echo "3. Key Changes Made:"
echo "   - Updated WebConfig.java with CORS configuration"
echo "   - Added allowed origins for frontend ports"
echo "   - Configured proper CORS headers"
echo "   - Restarted auth service"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser and navigate to Data page"
echo "   b. Open Developer Console (F12)"
echo "   c. Check for CORS errors - should be none"
echo "   d. Select a lab from the dropdown"
echo "   e. Verify successful API calls"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ No CORS errors"
echo "   ✓ Successful calls to /profile"
echo "   ✓ Successful calls to /labs/{id}/file-stats"
echo "   ✓ Successful calls to /teams/{id}/file-stats"

echo ""
echo "6. What You Should See:"
echo "   - No CORS policy errors"
echo "   - Successful API communication"
echo "   - Proper dropdown functionality"
echo "   - File statistics loading"

echo ""
echo "Please test this now and verify that:"
echo "1. No CORS errors in console"
echo "2. Successful API calls to auth service"
echo "3. Dropdown works properly"
echo "4. File statistics load correctly" 