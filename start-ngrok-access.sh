#!/bin/bash

# AgenticOmics Ngrok External Access Script
# This script provides immediate external access using ngrok

set -e

echo "🌍 AgenticOmics Ngrok External Access"
echo "====================================="
echo "🚀 This will create a public URL for immediate external access"
echo

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing now..."
    brew install ngrok
fi

# Check if the application is running
echo "🔍 Checking if application is running..."
if ! curl -s http://localhost:12000 > /dev/null 2>&1; then
    echo "❌ Application is not running on localhost:12000"
    echo "   Please start the application first:"
    echo "   ./start-app-external-runtime.sh"
    exit 1
fi

echo "✅ Application is running on localhost:12000"

# Check if ngrok is authenticated
echo "🔐 Checking ngrok authentication..."
if ! ngrok config check > /dev/null 2>&1; then
    echo "⚠️  ngrok is not authenticated"
    echo "   To get a free account and auth token:"
    echo "   1. Go to https://ngrok.com/signup"
    echo "   2. Sign up for a free account"
    echo "   3. Get your auth token from the dashboard"
    echo "   4. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo
    echo "   For now, we'll use ngrok without authentication (limited features)"
fi

echo
echo "🚀 Starting ngrok tunnel..."
echo "   This will create a public URL for your application"
echo "   Press Ctrl+C to stop the tunnel"
echo

# Start ngrok tunnel
echo "📡 Creating tunnel to localhost:12000..."
ngrok http 12000 --log=stdout 