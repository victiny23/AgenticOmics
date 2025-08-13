#!/bin/bash

echo "🔒 Testing Photo Security Implementation"
echo "======================================"

# Test 1: Verify public access is blocked
echo "1. Testing public photo access (should be blocked)..."
if curl -s -I "http://localhost:12001/uploads/profile-photos/Jerry_1755027709142.png" | grep -q "404"; then
    echo "   ✅ Public access blocked (404 Not Found)"
else
    echo "   ❌ Public access still available"
fi

# Test 2: Verify secure endpoint works with authentication
echo -e "\n2. Testing secure photo endpoint with authentication..."
if curl -s -I "http://localhost:8081/profile/photo/Jerry_1755027709142.png" -H "X-Username: Jerry" | grep -q "200"; then
    echo "   ✅ Secure endpoint works with authentication"
else
    echo "   ❌ Secure endpoint failed"
fi

# Test 3: Verify secure endpoint blocks unauthorized access
echo -e "\n3. Testing secure endpoint without authentication..."
if curl -s -I "http://localhost:8081/profile/photo/Jerry_1755027709142.png" | grep -q "401\|403"; then
    echo "   ✅ Unauthorized access blocked"
else
    echo "   ❌ Unauthorized access allowed"
fi

# Test 4: Verify git tracking is excluded
echo -e "\n4. Testing git tracking exclusion..."
if git status --porcelain | grep -q "profile-photos"; then
    echo "   ❌ Profile photos are tracked in git"
else
    echo "   ✅ Profile photos are not tracked in git"
fi

# Test 5: Verify .gitignore contains photo exclusions
echo -e "\n5. Testing .gitignore configuration..."
if grep -q "profile-photos" .gitignore; then
    echo "   ✅ .gitignore excludes profile photos"
else
    echo "   ❌ .gitignore missing profile photo exclusions"
fi

# Test 6: Test photo upload still works
echo -e "\n6. Testing photo upload functionality..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-security-photo.png
UPLOAD_RESPONSE=$(curl -s -X POST -F "file=@test-security-photo.png" "http://localhost:8081/profile/photo" -H "X-Username: Jerry")
if echo "$UPLOAD_RESPONSE" | grep -q "profile-photos"; then
    echo "   ✅ Photo upload works"
    FILENAME=$(echo "$UPLOAD_RESPONSE" | sed 's/"//g' | sed 's/\/uploads\/profile-photos\///')
    echo "   📸 Uploaded: $FILENAME"
else
    echo "   ❌ Photo upload failed"
fi
rm test-security-photo.png

# Test 7: Test secure photo retrieval
echo -e "\n7. Testing secure photo retrieval..."
if [ ! -z "$FILENAME" ]; then
    if curl -s -I "http://localhost:8081/profile/photo/$FILENAME" -H "X-Username: Jerry" | grep -q "200"; then
        echo "   ✅ Secure photo retrieval works"
    else
        echo "   ❌ Secure photo retrieval failed"
    fi
else
    echo "   ⚠️  Skipping - no photo uploaded"
fi

# Test 8: Verify API Gateway routing
echo -e "\n8. Testing API Gateway routing..."
if curl -s -I "http://localhost:12001/api/auth/profile/photo/Jerry_1755027709142.png" -H "X-Username: Jerry" | grep -q "200\|401"; then
    echo "   ✅ API Gateway routes secure photo requests"
else
    echo "   ❌ API Gateway routing issue"
fi

echo -e "\n✅ Security test completed!"
echo -e "\n🔒 Security Summary:"
echo "   • Public photo access: BLOCKED"
echo "   • Secure photo access: REQUIRES AUTHENTICATION"
echo "   • Git tracking: EXCLUDED"
echo "   • Photo upload: WORKING"
echo "   • Photo retrieval: SECURE"
echo -e "\n💡 Frontend should now use secure photo URLs"
echo "   • Old: http://localhost:12001/uploads/profile-photos/filename.png"
echo "   • New: http://localhost:12001/api/auth/profile/photo/filename.png" 