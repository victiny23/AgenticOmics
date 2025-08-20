#!/bin/bash

echo "🔧 Fixing Lab Membership for Jerry..."
echo "====================================="

# Check if Jerry exists and get his details
echo "📋 Checking Jerry's current status..."
JERRY_STATUS=$(curl -s "http://localhost:12001/api/auth/admin/system/check-super-admin" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" \
  -H "X-Username: Jerry")

echo "Jerry's status: $JERRY_STATUS"

# Check what labs exist
echo ""
echo "🏢 Checking available labs..."
LABS=$(curl -s "http://localhost:12001/api/auth/labs" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')")

echo "Available labs: $LABS"

# Check what files exist
echo ""
echo "📁 Checking existing files..."
FILES=$(curl -s "http://localhost:12001/api/data/files" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')")

echo "Files in system: $FILES"

echo ""
echo "✅ Lab membership check complete!"
echo ""
echo "💡 To fix the issue:"
echo "   1. Ensure Jerry is a member of the lab where the file was uploaded"
echo "   2. Ensure Jerry has the 'Lab PI' role in that lab"
echo "   3. Check that the lab ID matches between the file and Jerry's membership"
echo ""
echo "🔍 Next steps:"
echo "   - Check the backend logs for detailed permission debugging"
echo "   - Verify lab membership data in the database"
echo "   - Ensure proper lab setup for Jerry and Mian"
