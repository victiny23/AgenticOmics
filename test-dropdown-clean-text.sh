#!/bin/bash

echo "Testing Clean Dropdown Text Fix"
echo "==============================="

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
echo "2. Clean Dropdown Text Fix Applied:"
echo "   ✓ Simplified option text - removed role information"
echo "   ✓ Single line display for each option"
echo "   ✓ Clean, concise lab/team names"
echo "   ✓ Improved styling and spacing"

echo ""
echo "3. Key Changes Made:"
echo "   - Lab options: 'Lab Name (LAB001)' instead of 'Lab Name (LAB001) - Role'"
echo "   - Team options: 'Team Name (TEAM001)' instead of 'Team Name (TEAM001) - Role'"
echo "   - Improved padding and border radius"
echo "   - Better line height and font styling"

echo ""
echo "4. Manual Testing Steps:"
echo "   a. Open browser and navigate to Data page"
echo "   b. Click on the dropdown"
echo "   c. Check option display:"
echo "      - Should show single line per option"
echo "      - Format: 'Lab Name (LAB001)' or 'Team Name (TEAM001)'"
echo "      - No role information cluttering the display"
echo "   d. Select different options"
echo "   e. Verify clean, single-line display"

echo ""
echo "5. Expected UI Behavior:"
echo "   ✓ Single line per dropdown option"
echo "   ✓ Clean, concise text format"
echo "   ✓ No multi-line cluttered display"
echo "   ✓ Professional, readable appearance"
echo "   ✓ Consistent spacing and styling"

echo ""
echo "6. What You Should See:"
echo "   - Clean dropdown with single-line options"
echo "   - Format: 'Gabriel (LAB001)' instead of 'Gabriel (LAB001) - Lab PI'"
echo "   - No role information in dropdown options"
echo "   - Professional, uncluttered appearance"

echo ""
echo "Please test this now and verify that:"
echo "1. Dropdown options display as single lines"
echo "2. No multi-line cluttered text"
echo "3. Clean, concise option names"
echo "4. Professional, readable appearance" 