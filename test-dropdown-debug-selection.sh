#!/bin/bash

echo "Testing Dropdown Selection Debug - Why selectedContext is Empty"
echo "=============================================================="

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
echo "2. Selection Debug Applied:"
echo "   ✓ Enhanced handleContextChange logging"
echo "   ✓ Added MenuItem onClick debugging"
echo "   ✓ Enhanced sync effect debugging"
echo "   ✓ Added event object inspection"

echo ""
echo "3. Key Debugging Added:"
echo "   - Event object inspection in handleContextChange"
echo "   - MenuItem onClick event logging"
echo "   - Sync effect selectedContext tracking"
echo "   - setSelectedContext call confirmation"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Check initial state:"
echo "      - 'NUCLEAR CHECK:' should show selectedContext: ''"
echo "   d. Click on LAB001"
echo "   e. Look for these console messages:"
echo "      - 'MenuItem onClick triggered for LAB_1'"
echo "      - '=== CONTEXT CHANGE START ==='"
echo "      - 'Context change triggered with value: LAB_1'"
echo "      - 'About to set selectedContext to: LAB_1'"
echo "      - 'setSelectedContext called with: LAB_1'"
echo "   f. Check if selectedContext updates in NUCLEAR CHECK"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ 'MenuItem onClick triggered for LAB_1'"
echo "   ✓ '=== CONTEXT CHANGE START ==='"
echo "   ✓ 'Context change triggered with value: LAB_1'"
echo "   ✓ 'About to set selectedContext to: LAB_1'"
echo "   ✓ 'setSelectedContext called with: LAB_1'"
echo "   ✓ NUCLEAR CHECK should show selectedContext: 'LAB_1'"

echo ""
echo "6. Issue Analysis:"
echo "   - selectedContext is empty in NUCLEAR CHECK"
echo "   - handleContextChange might not be called"
echo "   - setSelectedContext might not be working"
echo "   - Sync effect might be clearing the value"
echo "   - MenuItem onClick might be interfering"

echo ""
echo "Please test this now and check the console logs to see which part of the selection flow is failing."
echo "This will help identify exactly where the selectedContext is being lost." 