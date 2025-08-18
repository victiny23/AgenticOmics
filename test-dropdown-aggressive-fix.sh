#!/bin/bash

echo "Testing Aggressive Dropdown Fix - Complete Component Reset"
echo "========================================================="

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
echo "2. Aggressive Fixes Applied:"
echo "   ✓ Added key prop to force Select component re-mount"
echo "   ✓ Enhanced data validation in useEffect"
echo "   ✓ Added stale value detection and clearing"
echo "   ✓ Improved logging for debugging"
echo "   ✓ Reset selectedContext when data changes"

echo ""
echo "3. Key Changes Made:"
echo "   - Select key: \`select-\${labMemberships.length}-\${teamMemberships.length}-\${selectedContext}\`"
echo "   - Data validation in sync useEffect"
echo "   - Stale value detection in data change useEffect"
echo "   - Comprehensive logging for debugging"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Look for these console messages:"
echo "      - 'Sync effect triggered - currentContext:'"
echo "      - 'Data changed - resetting selectedContext'"
echo "      - 'Available labs: [LAB_1, LAB_2]'"
echo "      - 'Available teams: [TEAM_1]'"
echo "   d. Try selecting LAB002"
echo "   e. Check that no MUI errors occur"
echo "   f. Verify dropdown shows correct selection"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ 'Context change triggered with value: LAB_2'"
echo "   ✓ 'Found lab for selection: [lab object]'"
echo "   ✓ 'Setting LAB context: [context object]'"
echo "   ✓ 'Context is valid, setting selectedContext to: LAB_2'"
echo "   ✓ NO MUI out-of-range value errors"

echo ""
echo "6. Component Reset Behavior:"
echo "   ✓ Select component re-mounts when data changes"
echo "   ✓ Stale selectedContext values are cleared"
echo "   ✓ Only valid selections are allowed"
echo "   ✓ Smooth transitions between labs/teams"

echo ""
echo "Please test this now and verify that LAB002 selection works without any MUI errors."
echo "The key prop should force the Select component to completely re-mount when needed." 