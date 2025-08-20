#!/bin/bash

echo "🔍 Testing Inter-Service Communication..."
echo "========================================"

echo ""
echo "📋 Test 1: Direct Auth Service Call (from Data Management Service)"
echo "=================================================================="

# Test what the data management service would send
echo "Testing the exact request that DataFileService sends:"
echo "URL: http://localhost:12001/api/auth/check-file-deletion-permission"
echo "Headers: Content-Type: application/json, X-Username: Jerry"
echo "Body: {\"fileUploadedBy\": \"Mian\", \"uploadContext\": \"LAB\", \"labId\": 2, \"teamId\": null}"

RESPONSE1=$(curl -s -X POST "http://localhost:12001/api/auth/check-file-deletion-permission" \
  -H "Content-Type: application/json" \
  -H "X-Username: Jerry" \
  -d '{"fileUploadedBy": "Mian", "uploadContext": "LAB", "labId": 2, "teamId": null}')

echo "Response: $RESPONSE1"

echo ""
echo "📋 Test 2: Direct Auth Service Call (without API Gateway)"
echo "========================================================="

# Test calling the auth service directly
RESPONSE2=$(curl -s -X POST "http://localhost:8081/api/auth/check-file-deletion-permission" \
  -H "Content-Type: application/json" \
  -H "X-Username: Jerry" \
  -d '{"fileUploadedBy": "Mian", "uploadContext": "LAB", "labId": 2, "teamId": null}')

echo "Response: $RESPONSE2"

echo ""
echo "📋 Test 3: Data Management Service Delete Call"
echo "=============================================="

# Test the actual delete endpoint
RESPONSE3=$(curl -s -X DELETE "http://localhost:12001/api/data/files/5" \
  -H "Authorization: Bearer $(echo 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKZXJyeSIsImlhdCI6MTc1NTY0NDk4NSwiZXhwIjoxNzU1NzMxMzg1fQ.y71Q8eaROI3nlCb2VYiMbSzkxkMQVcddoBXHYLTxcSM')" \
  -H "X-Username: Jerry")

echo "Response: $RESPONSE3"

echo ""
echo "🔍 Analysis:"
echo "============"
echo "1. If Test 1 works but Test 3 fails: Inter-service communication issue"
echo "2. If Test 2 works but Test 1 fails: API Gateway routing issue"
echo "3. If all tests work: Frontend state issue"
echo "4. If Test 3 fails: Backend logic issue"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Check backend logs for detailed error messages"
echo "2. Verify the data management service configuration"
echo "3. Check if the auth service URL is correct in DataFileService"
echo "4. Ensure proper inter-service communication setup"
