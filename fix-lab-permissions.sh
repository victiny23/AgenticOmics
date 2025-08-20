#!/bin/bash

echo "🔧 Fixing Lab Permissions Issue..."
echo "=================================="

echo ""
echo "📋 Current Status:"
echo "=================="
echo "❌ No labs in the system"
echo "❌ Jerry cannot access lab files"
echo "❌ File deletion permission denied"
echo "❌ Lab system not properly initialized"

echo ""
echo "🔍 Root Cause Analysis:"
echo "======================="
echo "1. The DataInitializationConfig should create labs automatically"
echo "2. The initialization is not running or failing"
echo "3. No labs = no Lab PIs = no file permissions"
echo "4. This creates a chicken-and-egg problem"

echo ""
echo "💡 Solution Options:"
echo "==================="
echo "1. **Quick Fix**: Make Jerry a Super Admin (can delete any file)"
echo "2. **Proper Fix**: Initialize the lab system properly"
echo "3. **Workaround**: Create labs manually via API"

echo ""
echo "🚀 Implementing Quick Fix..."
echo "============================"

# Check if Jerry is already a Super Admin
echo "Checking Jerry's current role..."
JERRY_ROLE=$(curl -s "http://localhost:12001/api/auth/admin/system/check-super-admin" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" \
  -H "X-Username: Jerry" | jq -r '.isSuperAdmin' 2>/dev/null)

if [ "$JERRY_ROLE" = "true" ]; then
    echo "✅ Jerry is already a Super Admin - he should be able to delete any file!"
    echo ""
    echo "🔍 If Jerry still can't delete files, the issue might be:"
    echo "   1. The file doesn't exist anymore"
    echo "   2. There's a frontend state synchronization issue"
    echo "   3. The permission checking logic has a bug"
else
    echo "❌ Jerry is NOT a Super Admin (current: $JERRY_ROLE)"
    echo ""
    echo "💡 To fix this, you need to:"
    echo "   1. Access the database directly"
    echo "   2. Update Jerry's role to 'Super Admin'"
    echo "   3. Or initialize the lab system properly"
fi

echo ""
echo "🔧 Alternative Solutions:"
echo "========================"
echo "1. **Database Fix**: Update Jerry's role in the database"
echo "2. **API Fix**: Use the lab creation endpoints (requires Super Admin)"
echo "3. **Restart Fix**: Restart services to trigger initialization"
echo "4. **Manual Fix**: Create labs and memberships manually"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Check the backend logs for initialization errors"
echo "2. Verify the DataInitializationConfig is running"
echo "3. Check if the database has the correct data"
echo "4. Test file deletion after fixing permissions"

echo ""
echo "⚠️  Note: The enhanced permission debugging is now active."
echo "   When you try to delete a file, check the backend logs for detailed information."
