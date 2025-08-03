#!/bin/bash

# Start the application in the background
echo "🚀 Starting AgenticOmics Platform with External Access..."
./start-app.sh --external &

# Wait for services to start
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check external access
echo ""
echo "🔍 Checking External Access..."
./check-external-status.sh

echo ""
echo "✅ Application is running in the background."
echo "• To stop the application, run: ./stop-app.sh"
echo "• To check status again, run: ./check-external-status.sh"