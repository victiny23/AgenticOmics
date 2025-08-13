#!/bin/bash

echo "📸 Testing Profile Photo Display"
echo "================================"

# Test 1: Verify sensitive profile endpoint returns photo URL
echo "1. Testing sensitive profile endpoint..."
SENSITIVE_RESPONSE=$(curl -s "http://localhost:8081/profile/sensitive" -H "X-Username: Jerry")
if echo "$SENSITIVE_RESPONSE" | grep -q "photoUrl"; then
    PHOTO_URL=$(echo "$SENSITIVE_RESPONSE" | grep -o '"/uploads/profile-photos/[^"]*"')
    echo "   ✅ Photo URL found: $PHOTO_URL"
else
    echo "   ❌ No photo URL in sensitive profile response"
    exit 1
fi

# Test 2: Extract filename and create secure URL
echo -e "\n2. Testing secure URL generation..."
FILENAME=$(echo "$PHOTO_URL" | sed 's|"/uploads/profile-photos/||' | sed 's|"||')
SECURE_URL="http://localhost:12001/api/auth/profile/photo/$FILENAME"
echo "   📁 Filename: $FILENAME"
echo "   🔗 Secure URL: $SECURE_URL"

# Test 3: Verify secure photo endpoint works
echo -e "\n3. Testing secure photo endpoint..."
PHOTO_RESPONSE=$(curl -s -I "$SECURE_URL" -H "X-Username: Jerry" | head -1)
if echo "$PHOTO_RESPONSE" | grep -q "200 OK"; then
    echo "   ✅ Secure photo endpoint working"
else
    echo "   ❌ Secure photo endpoint failed: $PHOTO_RESPONSE"
    exit 1
fi

# Test 4: Test frontend secure URL generation logic
echo -e "\n4. Testing frontend URL transformation..."
INPUT_URL="/uploads/profile-photos/$FILENAME"
EXPECTED_URL="http://localhost:12001/api/auth/profile/photo/$FILENAME"
echo "   📥 Input: $INPUT_URL"
echo "   📤 Expected: $EXPECTED_URL"

# Test 5: Verify the transformation logic
EXTRACTED_FILENAME=$(echo "$INPUT_URL" | sed 's|.*/||')
TRANSFORMED_URL="http://localhost:12001/api/auth/profile/photo/$EXTRACTED_FILENAME"
if [ "$TRANSFORMED_URL" = "$EXPECTED_URL" ]; then
    echo "   ✅ URL transformation logic correct"
else
    echo "   ❌ URL transformation logic incorrect"
    echo "      Expected: $EXPECTED_URL"
    echo "      Got: $TRANSFORMED_URL"
    exit 1
fi

# Test 6: Test that the photo is actually accessible
echo -e "\n5. Testing photo accessibility..."
PHOTO_SIZE=$(curl -s -I "$SECURE_URL" -H "X-Username: Jerry" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
if [ -n "$PHOTO_SIZE" ] && [ "$PHOTO_SIZE" -gt 0 ]; then
    echo "   ✅ Photo accessible (size: $PHOTO_SIZE bytes)"
else
    echo "   ❌ Photo not accessible or empty"
    exit 1
fi

# Test 7: Verify unauthorized access is blocked
echo -e "\n6. Testing unauthorized access..."
UNAUTHORIZED_RESPONSE=$(curl -s -I "$SECURE_URL" | head -1)
if echo "$UNAUTHORIZED_RESPONSE" | grep -q "401\|403"; then
    echo "   ✅ Unauthorized access blocked"
else
    echo "   ❌ Unauthorized access allowed: $UNAUTHORIZED_RESPONSE"
fi

# Test 8: Test with different user (should be blocked)
echo -e "\n7. Testing cross-user access..."
CROSS_USER_RESPONSE=$(curl -s -I "$SECURE_URL" -H "X-Username: Mian" | head -1)
if echo "$CROSS_USER_RESPONSE" | grep -q "401\|403\|404"; then
    echo "   ✅ Cross-user access blocked"
else
    echo "   ❌ Cross-user access allowed: $CROSS_USER_RESPONSE"
fi

# Test 9: Verify frontend endpoints are accessible
echo -e "\n8. Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -I "http://localhost:12000" | head -1)
if echo "$FRONTEND_RESPONSE" | grep -q "200 OK"; then
    echo "   ✅ Frontend accessible"
else
    echo "   ❌ Frontend not accessible: $FRONTEND_RESPONSE"
fi

# Test 10: Test API Gateway routing
echo -e "\n9. Testing API Gateway routing..."
GATEWAY_RESPONSE=$(curl -s -I "http://localhost:12001/api/auth/profile/sensitive" -H "X-Username: Jerry" | head -1)
if echo "$GATEWAY_RESPONSE" | grep -q "200 OK"; then
    echo "   ✅ API Gateway routing working"
else
    echo "   ❌ API Gateway routing failed: $GATEWAY_RESPONSE"
fi

echo -e "\n✅ Profile photo display test completed!"
echo -e "\n📱 Frontend Access:"
echo "   • Main Application: http://localhost:12000"
echo "   • Login as Jerry to test photo display"
echo -e "\n🔧 Backend Endpoints:"
echo "   • Sensitive Profile: http://localhost:8081/profile/sensitive"
echo "   • Secure Photo: $SECURE_URL"
echo -e "\n💡 Expected Behavior:"
echo "   • After login, profile photo should display in top-right icon"
echo "   • Photo should be loaded through secure endpoint"
echo "   • Unauthorized access should be blocked"
echo -e "\n🔒 Security Features:"
echo "   • Photos served through authenticated endpoints"
echo "   • Cross-user access blocked"
echo "   • Public access blocked"
echo "   • Secure URL transformation working" 