#!/bin/bash

echo "Testing Lab Data Structure"
echo "=========================="

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
echo "2. Testing Profile Data Structure:"
echo "   Note: This requires authentication. Please check the browser console for:"
echo "   - Profile data received: [object]"
echo "   - Active labs loaded: [array]"
echo "   - Active teams loaded: [array]"

echo ""
echo "3. Expected Lab Data Structure:"
echo "   Each lab should have:"
echo "   - labId: numeric ID (1, 2, etc.)"
echo "   - labName: string (e.g., 'Bioinformatics Lab')"
echo "   - labCode: string (e.g., 'LAB002')"
echo "   - roleInLab: string (e.g., 'PhD Student')"

echo ""
echo "4. Debugging Steps:"
echo "   a. Open browser console (F12)"
echo "   b. Navigate to Data page"
echo "   c. Look for 'Profile data received:' log"
echo "   d. Check 'Active labs loaded:' array"
echo "   e. Verify lab IDs and names match expectations"

echo ""
echo "5. Common Issues:"
echo "   - labId vs labCode confusion (numeric vs string)"
echo "   - Data not loading properly"
echo "   - Wrong field being used for comparison"

echo ""
echo "Please check the browser console and share the output." 