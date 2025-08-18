#!/bin/bash

echo "Debugging Lab/Team Dropdown Display Issue"
echo "========================================="

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
echo "2. Debug Information Added:"
echo "   ✓ Added console.log to renderValue function"
echo "   ✓ Added console.log to handleContextChange function"
echo "   ✓ Added useEffect to sync selectedContext with currentContext"
echo "   ✓ Added better error messages for unknown labs/teams"

echo ""
echo "3. Manual Debugging Steps:"
echo "   a. Open the application in your browser"
echo "   b. Open browser developer console (F12)"
echo "   c. Navigate to the Data page"
echo "   d. Look for console.log messages when:"
echo "      - Component loads (labMemberships, teamMemberships)"
echo "      - Dropdown is clicked (renderValue calls)"
echo "      - Option is selected (handleContextChange calls)"
echo "   e. Check what values are being logged"

echo ""
echo "4. Expected Console Output:"
echo "   - renderValue called with value: LAB_1 (or similar)"
echo "   - labMemberships: [array of lab objects]"
echo "   - teamMemberships: [array of team objects]"
echo "   - Parsed type: LAB, id: 1"
echo "   - Found lab: {lab object with name, code, etc.}"

echo ""
echo "5. Common Issues to Check:"
echo "   - Are labMemberships/teamMemberships loaded correctly?"
echo "   - Is selectedContext being set to the correct value?"
echo "   - Are the lab/team IDs matching between data and selection?"
echo "   - Is the currentContext prop being passed correctly?"

echo ""
echo "6. Troubleshooting:"
echo "   - If 'Unknown Lab (ID: X)' appears, the lab data isn't loaded"
echo "   - If 'Unknown Context: X' appears, the value format is wrong"
echo "   - If no console logs appear, there's a JavaScript error"

echo ""
echo "Please run this test and check the browser console for debug information." 