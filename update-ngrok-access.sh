#!/bin/bash
# AgenticOmics Ngrok External Access Update Script
# This script updates external access after app restarts

set -e

echo "🔄 Updating External Access After App Restart..."
echo "================================================"

# Step 1: Check if ngrok is running
echo "📋 Step 1: Checking ngrok status..."
if ! pgrep -x "ngrok" > /dev/null; then
    echo "❌ Ngrok is not running!"
    echo "💡 Start ngrok with: ngrok http 12000"
    exit 1
fi
echo "✅ Ngrok is running"

# Step 2: Get current ngrok URL
echo "📋 Step 2: Getting current ngrok URL..."
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'])" 2>/dev/null || echo "")

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL"
    exit 1
fi

NGROK_HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||')
echo "🌐 Current ngrok URL: $NGROK_URL"
echo "🏷️  Hostname: $NGROK_HOSTNAME"

# Step 3: Check Vite configuration
echo "📋 Step 3: Checking Vite configuration..."
VITE_CONFIG="frontend/web-app/vite.config.ts"

# Check if .ngrok-free.app is in allowedHosts (this allows all ngrok URLs)
if grep -q "\.ngrok-free\.app" "$VITE_CONFIG"; then
    echo "✅ Vite config allows all ngrok URLs automatically"
else
    echo "⚠️  Adding .ngrok-free.app to Vite config..."
    sed -i.bak "s/'0.0.0.0'/'0.0.0.0',\n      '.ngrok-free.app'/" "$VITE_CONFIG"
    echo "✅ Updated Vite config to allow all ngrok URLs"
fi

# Step 4: Update status check script
echo "📋 Step 4: Updating status check script..."
STATUS_SCRIPT="check-external-status.sh"

# Update the URLs in the status script
sed -i.bak "s|https://[a-zA-Z0-9-]*\.ngrok-free\.app|$NGROK_URL|g" "$STATUS_SCRIPT"
echo "✅ Updated status script"

# Step 5: Test external access
echo "📋 Step 5: Testing external access..."
echo "⏳ Waiting 3 seconds for app to be ready..."
sleep 3

echo "🧪 Testing frontend access..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$NGROK_URL" || echo "000")
echo "   Frontend: $FRONTEND_STATUS"

echo "🧪 Testing API access..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$NGROK_URL/api" || echo "000")
echo "   API: $API_STATUS"

# Step 6: Display results
echo ""
echo "🎉 External Access Update Complete!"
echo "=================================="
echo "🌐 External URL: $NGROK_URL"
echo "📊 Status:"
echo "   Frontend: $([ "$FRONTEND_STATUS" = "200" ] && echo "✅ Working" || echo "❌ Failed ($FRONTEND_STATUS)")"
echo "   API: $([ "$API_STATUS" = "200" ] && echo "✅ Working" || echo "❌ Failed ($API_STATUS)")"
echo ""
echo "💡 You can now share this URL: $NGROK_URL"
echo "🔧 To test anytime: ./check-external-status.sh" 