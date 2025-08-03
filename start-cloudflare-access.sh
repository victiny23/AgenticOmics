#!/bin/bash

# AgenticOmics Cloudflare Tunnel External Access Script
# This script provides immediate external access using cloudflared

set -e

echo "🌍 AgenticOmics Cloudflare Tunnel External Access"
echo "================================================="
echo "🚀 This will create a public URL for immediate external access"
echo

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed. Installing now..."
    brew install cloudflared
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
echo "🚀 Starting Cloudflare Tunnel..."
echo "   This will create a public URL for your application"
echo "   Press Ctrl+C to stop the tunnel"
echo

# Start cloudflared tunnel
echo "📡 Creating tunnel to localhost:12000..."
echo "   Your public URL will appear below:"
echo "   ==================================="
cloudflared tunnel --url http://localhost:12000 