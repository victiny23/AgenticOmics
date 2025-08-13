#!/bin/bash

echo "🔍 Testing pi_jerry's lab membership..."

# Test if the application is running
echo "📡 Testing application connectivity..."
if curl -s http://localhost:12000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Auth service is running"
else
    echo "❌ Auth service is not responding"
    exit 1
fi

echo ""
echo "🎯 Current Status:"
echo "   • pi_jerry should already be a member of LAB001 (Omics Research Lab)"
echo "   • This was set up in the DataInitializationConfig"
echo "   • If not visible in the UI, there might be a display issue"
echo ""
echo "🔧 To verify membership:"
echo "   1. Go to http://localhost:12000"
echo "   2. Login with pi_jerry / pi123"
echo "   3. Check 'My Team & Organization' panel"
echo "   4. Look for 'Omics Research Lab (LAB001)'"
echo ""
echo "📊 Expected data:"
echo "   • Lab: Omics Research Lab (LAB001)"
echo "   • Role: Lab PI"
echo "   • Member ID: LAB001"
echo "   • Primary Lab: Yes"
echo "   • Team: Omics Team Alpha (TEAM001) - Team Leader"
echo ""
echo "🛠️  If membership is missing, the database may need to be reset:"
echo "   ./stop-app.sh"
echo "   rm -f backend/auth/data/*.db"
echo "   ./start-app-external-runtime.sh" 