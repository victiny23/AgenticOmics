#!/bin/bash

echo "Testing No Default Selection Fix - Remove LAB001 Default"
echo "======================================================="

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
echo "2. No Default Selection Fix Applied:"
echo "   ✓ Removed automatic LAB001 default selection"
echo "   ✓ Enhanced context change debugging"
echo "   ✓ Added renderValue debugging"
echo "   ✓ User must manually select a lab/team"

echo ""
echo "3. Key Changes Made:"
echo "   - Removed useEffect that set default primary lab"
echo "   - Enhanced handleContextChange logging"
echo "   - Added renderValue debugging"
echo "   - No automatic selection on component load"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Check initial state:"
echo "      - Dropdown should show 'No context selected'"
echo "      - No Current Context panel should be visible"
echo "   d. Click on LAB002"
echo "   e. Check console for:"
echo "      - '=== CONTEXT CHANGE START ==='"
echo "      - 'Context change triggered with value: LAB_2'"
echo "      - 'Setting selectedContext to: LAB_2'"
echo "      - '=== CONTEXT CHANGE END ==='"
echo "   f. Check renderValue logs:"
echo "      - '=== RENDER VALUE CALLED ==='"
echo "      - 'renderValue called with selectedContext: LAB_2'"
echo "      - 'renderValue parsing: LAB 2'"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ '=== CONTEXT CHANGE START ==='"
echo "   ✓ 'Context change triggered with value: LAB_2'"
echo "   ✓ 'Setting selectedContext to: LAB_2'"
echo "   ✓ '=== CONTEXT CHANGE END ==='"
echo "   ✓ '=== RENDER VALUE CALLED ==='"
echo "   ✓ 'renderValue called with selectedContext: LAB_2'"
echo "   ✓ 'renderValue parsing: LAB 2'"

echo ""
echo "6. Expected UI Behavior:"
echo "   ✓ Initial state: 'No context selected' in dropdown"
echo "   ✓ No Current Context panel visible initially"
echo "   ✓ After LAB002 selection: dropdown shows LAB002"
echo "   ✓ Current Context panel appears with LAB002 info"
echo "   ✓ No default LAB001 selection"

echo ""
echo "Please test this now and verify that there's no default LAB001 and LAB002 selection works properly."
echo "The enhanced debugging will help track the selection flow." 