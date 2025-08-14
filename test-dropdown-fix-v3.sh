#!/bin/bash

echo "Testing Dropdown Fix - MUI Out-of-Range Value Issue"
echo "=================================================="

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
echo "2. Issue Analysis:"
echo "   ✓ Data is loading correctly (2 labs, 1 team)"
echo "   ✓ Lab is found in renderValue function"
echo "   ✓ But MUI still reports empty available values"
echo "   ✓ Select component rendering before options are ready"

echo ""
echo "3. Final Fixes Applied:"
echo "   ✓ Added hasValidData check before rendering Select"
echo "   ✓ Set value to empty string when no valid data"
echo "   ✓ Added context validation before setting selectedContext"
echo "   ✓ Enhanced useEffect dependencies"
echo "   ✓ Added comprehensive logging"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open the application in your browser"
echo "   b. Open browser developer console (F12)"
echo "   c. Navigate to the Data page"
echo "   d. Look for console messages:"
echo "      - 'Has valid data: true/false'"
echo "      - 'Setting initial primary lab context:'"
echo "      - 'Syncing selectedContext with currentContext:'"
echo "   e. Verify no MUI out-of-range value errors"
echo "   f. Try selecting LAB002 and verify it works"
echo "   g. Check that dropdown shows correct selected value"

echo ""
echo "5. Expected Behavior:"
echo "   ✓ No MUI out-of-range value errors"
echo "   ✓ Dropdown shows correct selected lab/team"
echo "   ✓ LAB002 selection works and displays correctly"
echo "   ✓ Current Context updates properly"
echo "   ✓ Dropdown closes automatically after selection"

echo ""
echo "6. Key Changes:"
echo "   - Select value is empty string when no valid data"
echo "   - Context validation before setting selectedContext"
echo "   - hasValidData check prevents premature rendering"
echo "   - Enhanced error handling and logging"

echo ""
echo "Please test this now and verify that LAB002 selection works without MUI errors." 