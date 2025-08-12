#!/bin/bash

echo "🔄 Resetting database and restarting application..."

# Stop the application
echo "🛑 Stopping application..."
./stop-app.sh

# Remove database files
echo "🗑️  Removing database files..."
rm -f backend/auth/data/*.db

# Start the application
echo "🚀 Starting application..."
./start-app-external-runtime.sh

echo "⏳ Waiting for application to start..."
sleep 45

# Check if all services are running
echo "📊 Checking service status..."
SERVICE_COUNT=$(ps aux | grep -E "(java|node)" | grep -v grep | grep -E "(12001|8081|8082|12000)" | wc -l)

if [ "$SERVICE_COUNT" -eq 6 ]; then
    echo "✅ All services are running"
    
    # Test login
    echo "🧪 Testing login with pi_jerry..."
    LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:12001/api/auth/login" -H "Content-Type: application/json" -d '{"username":"pi_jerry","password":"pi123"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo "✅ Login successful! Sample data created."
        echo "🎉 pi_jerry is now available for login"
        echo ""
        echo "🔗 Access the application at: http://localhost:12000"
        echo "👤 Login with: pi_jerry / pi123"
    else
        echo "❌ Login failed. Response: $LOGIN_RESPONSE"
        echo "🔍 Sample data may not have been created properly."
    fi
else
    echo "❌ Not all services are running. Only $SERVICE_COUNT services found."
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Go to http://localhost:12000"
echo "   2. Login with pi_jerry / pi123"
echo "   3. Check 'My Team & Organization' panel"
echo "   4. You should see LAB001 membership" 