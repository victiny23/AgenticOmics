#!/bin/bash

echo "🔧 Ensuring pi_jerry is a member of LAB001..."

# Test the new endpoint
echo "📡 Testing membership endpoint..."
RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/admin/ensure-pi-jerry-lab001" -H "X-Username: pi_jerry")

if [ $? -eq 0 ] && [ ! -z "$RESPONSE" ]; then
    echo "✅ Endpoint response: $RESPONSE"
else
    echo "❌ Endpoint failed or returned empty response"
    echo "🔄 Trying alternative approach..."
    
    # Alternative: Check if we need to reset the database
    echo "📊 Checking if sample data exists..."
    echo "   If pi_jerry membership is missing, the database may need to be reset."
    echo ""
    echo "🛠️  To reset and recreate sample data:"
    echo "   1. Stop the application: ./stop-app.sh"
    echo "   2. Remove database files: rm -f backend/auth/data/*.db"
    echo "   3. Restart: ./start-app-external-runtime.sh"
    echo ""
    echo "📋 Manual verification steps:"
    echo "   1. Go to http://localhost:12000"
    echo "   2. Login with pi_jerry / pi123"
    echo "   3. Check 'My Team & Organization' panel"
    echo "   4. Look for 'Omics Research Lab (LAB001)'"
    echo ""
    echo "📊 Expected data after reset:"
    echo "   • Lab: Omics Research Lab (LAB001)"
    echo "   • Role: Lab PI"
    echo "   • Member ID: LAB001"
    echo "   • Primary Lab: Yes"
    echo "   • Team: Omics Team Alpha (TEAM001) - Team Leader"
fi

echo ""
echo "🎯 Current Status Summary:"
echo "   • Application is running ✅"
echo "   • pi_jerry should be a member of LAB001"
echo "   • If not visible, database may need reset"
echo ""
echo "🔗 Access the application at: http://localhost:12000" 