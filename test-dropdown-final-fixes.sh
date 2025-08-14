#!/bin/bash

echo "Testing Final Dropdown Fixes"
echo "============================"

# Check if services are running
echo "1. Checking if services are running..."
if curl -s http://localhost:12001/api/data/health > /dev/null; then
    echo "   ✓ Data Management Service is running"
else
    echo "   ✗ Data Management Service is not running"
    exit 1
fi

if curl -s http://localhost:8081/api/auth/health > /dev/null; then
    echo "   ✓ Auth Service is running on correct port (8081)"
else
    echo "   ✗ Auth Service is not running on port 8081"
    exit 1
fi

echo ""
echo "2. Fixes Applied:"
echo "   ✓ Fixed auth service URL: localhost:8081 (was 12001)"
echo "   ✓ Removed automatic initial selection"
echo "   ✓ No more dropdown overwriting"

echo ""
echo "3. Key Changes Made:"
echo "   - DataFileService now calls auth service on port 8081"
echo "   - Removed useEffect that set initial selection"
echo "   - Dropdown starts with 'No context selected'"
echo "   - User must manually choose lab/team"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Check initial state:"
echo "      - Should show 'No context selected' initially"
echo "      - No automatic selection"
echo "   d. Click on the dropdown"
echo "   e. Select a lab (e.g., LAB001)"
echo "   f. Verify selection works and displays correctly"
echo "   g. Select a team"
echo "   h. Check console for file stats API calls"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ No 'Setting initial selection' message"
echo "   ✓ '=== STATE CHANGE ===' with selectedContext: '' initially"
echo "   ✓ '=== CONTEXT CHANGE START ===' (when selecting)"
echo "   ✓ Successful API calls to /api/auth/labs/{id}/file-stats"
echo "   ✓ Successful API calls to /api/auth/teams/{id}/file-stats"
echo "   ✓ No 404 errors"

echo ""
echo "6. Expected UI Behavior:"
echo "   ✓ Dropdown shows 'No context selected' initially"
echo "   ✓ User must manually select lab/team"
echo "   ✓ Selection displays correctly after choice"
echo "   ✓ No automatic overwriting"
echo "   ✓ File stats load properly for selected context"

echo ""
echo "Please test this now and verify that:"
echo "1. No 404 errors when switching between labs/teams"
echo "2. Dropdown starts empty and requires manual selection"
echo "3. Selections work properly and display correctly" 