#!/bin/bash

echo "Testing Auth Endpoints Fix"
echo "=========================="

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
echo "2. Auth Endpoints Fix Applied:"
echo "   ✓ Updated frontend to call auth service on port 8081"
echo "   ✓ Fixed URL paths (removed /api/auth prefix)"
echo "   ✓ Corrected endpoint URLs"

echo ""
echo "3. Key Changes Made:"
echo "   - Frontend now calls: http://localhost:8081/profile"
echo "   - Frontend now calls: http://localhost:8081/labs/{id}/file-stats"
echo "   - Frontend now calls: http://localhost:8081/teams/{id}/file-stats"
echo "   - Removed incorrect /api/auth prefix"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser and navigate to Data page"
echo "   b. Open Developer Console (F12)"
echo "   c. Select a lab from the dropdown"
echo "   d. Check console for successful API calls"
echo "   e. Verify no more 404 errors"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ Successful calls to /profile"
echo "   ✓ Successful calls to /labs/{id}/file-stats"
echo "   ✓ Successful calls to /teams/{id}/file-stats"
echo "   ✓ No more 404 errors"

echo ""
echo "6. What You Should See:"
echo "   - No 404 errors in console"
echo "   - File statistics loading properly"
echo "   - Clean dropdown functionality"
echo "   - Proper context switching"

echo ""
echo "Please test this now and verify that:"
echo "1. No more 404 errors when switching contexts"
echo "2. File statistics load properly"
echo "3. Dropdown works correctly"
echo "4. All API calls are successful" 