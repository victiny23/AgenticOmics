#!/bin/bash

echo "Testing Lab/Team Dropdown Fix"
echo "============================="

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
echo "2. Dropdown Fix Implementation:"
echo "   ✓ Added controlled open state (isOpen)"
echo "   ✓ Added onClick handlers to MenuItems"
echo "   ✓ Added MenuProps with autoFocus: false"
echo "   ✓ Added setTimeout to ensure selection is processed"
echo "   ✓ Added backup blur() method"

echo ""
echo "3. Manual Testing Steps:"
echo "   a. Open the application in your browser"
echo "   b. Navigate to the Data page"
echo "   c. Click on the 'Select Lab/Team Context' dropdown"
echo "   d. Click on any lab or team option"
echo "   e. Verify the dropdown closes immediately"
echo "   f. Verify the selected context is displayed in the 'Current Context' section"

echo ""
echo "4. Expected Behavior:"
echo "   ✓ Dropdown should open when clicked"
echo "   ✓ Dropdown should close immediately when an option is selected"
echo "   ✓ Selected context should be displayed prominently"
echo "   ✓ No manual interaction should be needed to close the dropdown"

echo ""
echo "5. Technical Changes Made:"
echo "   - Added isOpen state to control dropdown visibility"
echo "   - Added onClick handlers to all MenuItems"
echo "   - Used setTimeout to ensure selection is processed before closing"
echo "   - Added MenuProps to disable auto-focus behavior"
echo "   - Added backup blur() method for additional reliability"

echo ""
echo "Test completed! Please verify the dropdown behavior manually in the UI." 