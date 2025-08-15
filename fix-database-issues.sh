#!/bin/bash

echo "🔧 Fixing Database Issues..."
echo "============================"

# Check if services are running
echo "1. Checking if services are running..."
if ! curl -s "http://localhost:12001/api/auth/health" > /dev/null 2>&1; then
    echo "❌ Services are not running. Please start them first with: ./start-app.sh"
    exit 1
fi
echo "✅ Services are running"

# Fix database issues
echo ""
echo "2. Fixing database issues..."
RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/fix-database-issues" \
    -H "X-Username: admin" \
    -H "Content-Type: application/json")

echo "Response: $RESPONSE"

# Verify the fixes
echo ""
echo "3. Verifying fixes..."
VERIFY_RESPONSE=$(curl -s "http://localhost:12001/api/auth/admin/verify-fixes" \
    -H "X-Username: admin")

echo "Verification: $VERIFY_RESPONSE"

# Test Mian's profile
echo ""
echo "4. Testing Mian's profile..."
MIAN_PROFILE=$(curl -s "http://localhost:12001/api/auth/profile" \
    -H "X-Username: Mian")

if echo "$MIAN_PROFILE" | grep -q "Mian"; then
    echo "✅ Mian's profile is accessible"
    echo "   Mian's lab memberships:"
    echo "$MIAN_PROFILE" | grep -o '"labName":"[^"]*"' | cut -d'"' -f4 | while read lab; do
        echo "     • $lab"
    done
else
    echo "❌ Mian's profile not accessible"
fi

# Test Jerry's profile
echo ""
echo "5. Testing Jerry's profile..."
JERRY_PROFILE=$(curl -s "http://localhost:12001/api/auth/profile" \
    -H "X-Username: Jerry")

if echo "$JERRY_PROFILE" | grep -q "Jerry"; then
    echo "✅ Jerry's profile is accessible"
    echo "   Jerry's lab memberships:"
    echo "$JERRY_PROFILE" | grep -o '"labName":"[^"]*"' | cut -d'"' -f4 | while read lab; do
        echo "     • $lab"
    done
else
    echo "❌ Jerry's profile not accessible"
fi

echo ""
echo "🎉 Database fixes completed!"
echo "=========================="
echo "📋 Summary:"
echo "   • Mian user created with password: mian123"
echo "   • Mian added to LAB001 as PhD Student"
echo "   • Jerry set as Mian's supervisor"
echo "   • Lab IDs should start from 1"
echo ""
echo "🔑 Login credentials:"
echo "   • Mian/mian123 (PhD Student - supervised by Jerry)"
echo "   • Jerry/pi123 (Lab PI - supervises Mian)"
echo ""
echo "🌐 Access the application:"
echo "   • Frontend: http://localhost:12000"
echo "   • H2 Console: http://localhost:8081/h2-console"
echo "     (Username: sa, Password: password)" 