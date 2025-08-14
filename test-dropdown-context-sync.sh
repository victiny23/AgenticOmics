#!/bin/bash

echo "Testing Context Synchronization Debug"
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
echo "2. Context Synchronization Issue:"
echo "   ✓ selectedContext is being set to 'LAB_1'"
echo "   ✓ currentContext prop is not updating"
echo "   ✓ Current Context component shows wrong information"
echo "   ✓ Added debugging logs to track the issue"

echo ""
echo "3. Debugging Added:"
echo "   - Log currentContext in NUCLEAR CHECK"
echo "   - Log onContextChange calls"
echo "   - Track context synchronization flow"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser developer console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Look for these console messages:"
echo "      - 'NUCLEAR CHECK:' with currentContext value"
echo "      - 'Context change triggered with value: LAB_1'"
echo "      - 'Setting LAB context:' with context object"
echo "      - 'Calling onContextChange with:' with context object"
echo "      - 'onContextChange called successfully'"
echo "   d. Click on LAB001"
echo "   e. Check if currentContext updates in NUCLEAR CHECK"

echo ""
echo "5. Expected Console Output:"
echo "   ✓ 'NUCLEAR CHECK:' with currentContext: { type: 'LAB', id: 1, ... }"
echo "   ✓ 'Context change triggered with value: LAB_1'"
echo "   ✓ 'Setting LAB context:' with correct lab data"
echo "   ✓ 'Calling onContextChange with:' with context object"
echo "   ✓ 'onContextChange called successfully'"

echo ""
echo "6. Issue Analysis:"
echo "   - selectedContext updates correctly"
echo "   - onContextChange is called"
echo "   - currentContext prop should update"
echo "   - Current Context component should reflect changes"

echo ""
echo "Please test this now and check the console logs to see if onContextChange is being called and if currentContext is updating properly."
echo "This will help identify where the synchronization is breaking down." 