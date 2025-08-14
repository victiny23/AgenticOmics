#!/bin/bash

echo "Testing Lab/Team Upload Functionality"
echo "====================================="

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

# Test the new lab/team statistics endpoint
echo ""
echo "2. Testing lab/team file statistics endpoint..."
echo "   Note: This requires authentication. Please test manually in the UI."

echo ""
echo "3. Manual Testing Steps:"
echo "   a. Open the application in your browser"
echo "   b. Navigate to the Data page"
echo "   c. Select a lab/team context from the dropdown"
echo "   d. Verify the dropdown closes automatically"
echo "   e. Verify the selected context is displayed prominently"
echo "   f. Upload a file and verify it's associated with the selected context"
echo "   g. Check the 'Lab/Team Files' tab to see files organized by context"

echo ""
echo "4. Expected Behavior:"
echo "   ✓ Lab/Team dropdown should close automatically after selection"
echo "   ✓ Selected lab/team should be displayed in 'Current Context' section"
echo "   ✓ Files should be uploaded with lab/team context information"
echo "   ✓ Files should be viewable in the 'Lab/Team Files' tab"
echo "   ✓ Database should store lab/team relationships with files"

echo ""
echo "Test completed! Please verify the functionality manually in the UI." 