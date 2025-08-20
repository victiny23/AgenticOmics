#!/bin/bash

echo "🏢 Setting up Lab System..."
echo "==========================="

# First, let's check if there are any existing labs in the database
echo "📋 Checking existing labs..."

# Try to access the labs endpoint with different approaches
echo "Attempting to check labs via different endpoints..."

# Check if there's a labs endpoint
LABS_CHECK=$(curl -s "http://localhost:12001/api/auth/labs" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" 2>/dev/null)

echo "Labs endpoint response: $LABS_CHECK"

# Check if there are any users in the system
echo ""
echo "👥 Checking users in the system..."
USERS_CHECK=$(curl -s "http://localhost:12001/api/auth/users/count" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" 2>/dev/null)

echo "Users count: $USERS_CHECK"

echo ""
echo "🔍 Analysis:"
echo "============"
echo "1. The lab system appears to be not properly initialized"
echo "2. There are no labs in the system"
echo "3. Jerry cannot be a Lab PI without labs"
echo "4. Files cannot be uploaded to labs without labs"
echo ""
echo "💡 Solution:"
echo "============"
echo "1. We need to create labs in the system"
echo "2. Add Jerry as a Lab PI to a lab"
echo "3. Add Mian as a lab member to the same lab"
echo "4. Then files can be uploaded and managed properly"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Check the database for existing lab data"
echo "2. Create labs if they don't exist"
echo "3. Set up proper lab memberships"
echo "4. Test file upload and deletion"
echo ""
echo "⚠️  Note: This requires database access or API endpoints to create labs"
echo "   The lab creation functionality may need to be implemented first"
