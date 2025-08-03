#!/bin/bash

# AgenticOmics LocalTunnel External Access Script
# This script provides immediate external access using localtunnel

set -e

echo "🌍 AgenticOmics LocalTunnel External Access"
echo "==========================================="
echo "🚀 This will create a public URL for immediate external access"
echo

# Check if localtunnel is installed
if ! command -v lt &> /dev/null; then
    echo "❌ localtunnel is not installed. Installing now..."
    npm install -g localtunnel
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

echo
echo "🚀 Starting localtunnel..."
echo "   This will create a public URL for your application"
echo "   Press Ctrl+C to stop the tunnel"
echo

# Start localtunnel
echo "📡 Creating tunnel to localhost:12000..."
echo "   Your public URL will appear below:"
echo "   ==================================="
lt --port 12000 