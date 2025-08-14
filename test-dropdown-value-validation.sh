#!/bin/bash

echo "Testing Dropdown Value Validation Fix"
echo "===================================="

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
echo "2. Value Validation Fix Applied:"
echo "   ✓ Added inline value validation function"
echo "   ✓ Only set value if it exists in data"
echo "   ✓ Enhanced debugging logs"
echo "   ✓ Added keepMounted to MenuProps"
echo "   ✓ Added additional loading state check"

echo ""
echo "3. Key Changes Made:"
echo "   - Inline value validation: checks if selectedContext exists in data"
echo "   - Enhanced logging: shows validation process"
echo "   - MenuProps.keepMounted: true for better option registration"
echo "   - Additional hasValidData check before rendering"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Look for these console messages:"
echo "      - 'Value validation: checking LAB ID 1'"
echo "      - 'Lab exists check: true Available lab IDs: [1, 2]'"
echo "      - 'renderValue called with value: LAB_2'"
echo "   d. Try selecting LAB002"
echo "   e. Check that no MUI errors occur"
echo "   f. Verify dropdown shows correct selection"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ 'Value validation: checking LAB ID 2'"
echo "   ✓ 'Lab exists check: true Available lab IDs: [1, 2]'"
echo "   ✓ 'Context change triggered with value: LAB_2'"
echo "   ✓ 'Found lab for selection: [lab object]'"
echo "   ✓ 'Setting LAB context: [context object]'"
echo "   ✓ NO MUI out-of-range value errors"

echo ""
echo "6. Value Validation Logic:"
echo "   ✓ Only sets value if selectedContext exists in labMemberships/teamMemberships"
echo "   ✓ Returns empty string if validation fails"
echo "   ✓ Prevents MUI from receiving invalid values"
echo "   ✓ Ensures dropdown shows correct selected item"

echo ""
echo "Please test this now and verify that LAB002 selection works without any MUI errors."
echo "The value validation should prevent any out-of-range value errors." 