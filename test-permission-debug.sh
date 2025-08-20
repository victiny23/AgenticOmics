#!/bin/bash

echo "🔍 Testing File Deletion Permission..."
echo "====================================="

echo ""
echo "📋 File Details:"
echo "================"
echo "File ID: 5"
echo "File: PAJIA_ALERT.xls"
echo "Uploaded by: Mian"
echo "Lab ID: 2 (LAB001)"
echo "Upload Context: LAB"

echo ""
echo "👤 Jerry's Details:"
echo "=================="
echo "Username: Jerry"
echo "Lab PI of: LAB001 (ID: 2)"
echo "Should be able to delete: YES"

echo ""
echo "🔧 Testing Permission Check..."
echo "============================="

# Test the permission check endpoint directly
PERMISSION_CHECK=$(curl -s -X POST "http://localhost:12001/api/auth/check-file-deletion-permission" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" \
  -H "X-Username: Jerry" \
  -d '{
    "fileUploadedBy": "Mian",
    "uploadContext": "LAB",
    "labId": 2,
    "teamId": null
  }')

echo "Permission check response:"
echo "$PERMISSION_CHECK" | jq .

echo ""
echo "🔍 Analysis:"
echo "============"
echo "1. File is in LAB001 (ID: 2)"
echo "2. Jerry is Lab PI of LAB001 (ID: 2)"
echo "3. Permission should be granted"
echo "4. If permission is denied, check backend logs for debugging output"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Check backend logs for detailed permission debugging"
echo "2. Verify the permission checking logic"
echo "3. Test with different lab/team combinations"
echo "4. Ensure frontend is using correct lab context"
