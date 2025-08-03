#!/bin/bash

# AgenticOmics External Access - Quick Solution
# This script provides the easiest way to get external access

echo "🌍 AgenticOmics External Access"
echo "==============================="
echo

# Check if application is running
if ! curl -s http://localhost:12000 > /dev/null 2>&1; then
    echo "❌ Application is not running!"
    echo "   Please start it first: ./start-app-external-runtime.sh"
    exit 1
fi

echo "✅ Application is running on localhost:12000"
echo

echo "🚀 Choose your external access method:"
echo "======================================"
echo
echo "1. 🎯 RECOMMENDED: Ngrok (Free account needed)"
echo "   - Sign up: https://ngrok.com/signup"
echo "   - Get auth token from dashboard"
echo "   - Run: ngrok config add-authtoken YOUR_TOKEN"
echo "   - Run: ngrok http 12000"
echo
echo "2. 🔧 Alternative: Serveo (No account needed)"
echo "   - Run: ssh -R 80:localhost:12000 serveo.net"
echo "   - Use the URL it provides"
echo
echo "3. 🌐 Permanent: Custom Domain"
echo "   - Buy domain: agentic.omics (~$10-15/year)"
echo "   - Follow: CUSTOM_DOMAIN_SETUP.md"
echo
echo "4. 📱 Local Network Access"
echo "   - Share: http://localhost:12000 (same WiFi only)"
echo

echo "💡 Quick Start (Ngrok):"
echo "======================="
echo "1. Go to: https://ngrok.com/signup"
echo "2. Sign up for free account"
echo "3. Copy your auth token"
echo "4. Run: ngrok config add-authtoken YOUR_TOKEN"
echo "5. Run: ngrok http 12000"
echo "6. Share the URL it provides"
echo

echo "🔗 Current Status:"
echo "=================="
echo "✅ Local Access: http://localhost:12000"
echo "❌ External Access: https://agentic.omics (not configured)"
echo "❌ Custom Domain: Needs DNS + SSL setup"
echo

echo "📋 Files Available:"
echo "==================="
echo "• EXTERNAL_ACCESS_SOLUTIONS.md - Complete guide"
echo "• CUSTOM_DOMAIN_SETUP.md - Permanent domain setup"
echo "• QUICK_EXTERNAL_ACCESS.md - Quick solutions"
echo 