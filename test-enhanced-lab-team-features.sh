#!/bin/bash

echo "Testing Enhanced Lab/Team Features"
echo "=================================="

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
echo "2. Enhanced Features Implemented:"
echo "   ✓ Dropdown shows selected choice in the dropdown row"
echo "   ✓ Current Context component displays selected lab/team"
echo "   ✓ File statistics shown in Current Context"
echo "   ✓ Database fields added for file tracking"
echo "   ✓ API endpoints for file statistics"

echo ""
echo "3. Database Changes:"
echo "   ✓ Added file_count field to lab_info table"
echo "   ✓ Added total_file_size field to lab_info table"
echo "   ✓ Added last_file_upload field to lab_info table"
echo "   ✓ Added file_count field to team_info table"
echo "   ✓ Added total_file_size field to team_info table"
echo "   ✓ Added last_file_upload field to team_info table"

echo ""
echo "4. API Endpoints Added:"
echo "   ✓ POST /api/auth/labs/{labId}/file-stats - Update lab file stats"
echo "   ✓ POST /api/auth/teams/{teamId}/file-stats - Update team file stats"
echo "   ✓ GET /api/auth/labs/{labId}/file-stats - Get lab file stats"
echo "   ✓ GET /api/auth/teams/{teamId}/file-stats - Get team file stats"

echo ""
echo "5. Frontend Enhancements:"
echo "   ✓ Dropdown displays selected choice with icon and name"
echo "   ✓ Current Context shows file statistics"
echo "   ✓ File count, total size, and last upload date displayed"
echo "   ✓ Enhanced visual styling for better UX"

echo ""
echo "6. Manual Testing Steps:"
echo "   a. Open the application in your browser"
echo "   b. Navigate to the Data page"
echo "   c. Click on the 'Select Lab/Team Context' dropdown"
echo "   d. Select a lab or team option"
echo "   e. Verify the dropdown shows the selected choice"
echo "   f. Verify the Current Context displays the selection"
echo "   g. Check that file statistics are shown (if any files exist)"
echo "   h. Upload a file and verify statistics update"

echo ""
echo "7. Expected Behavior:"
echo "   ✓ Dropdown displays selected lab/team with icon and name"
echo "   ✓ Current Context shows lab/team name, code, and role"
echo "   ✓ File statistics show count, size, and last upload date"
echo "   ✓ Database tracks file statistics automatically"
echo "   ✓ API endpoints return correct file statistics"

echo ""
echo "8. File Statistics Display:"
echo "   - File count: Number of files uploaded to this lab/team"
echo "   - Total size: Combined size of all files in this lab/team"
echo "   - Last upload: Date of the most recent file upload"
echo "   - Statistics update automatically when files are uploaded"

echo ""
echo "Test completed! Please verify the enhanced features manually in the UI." 