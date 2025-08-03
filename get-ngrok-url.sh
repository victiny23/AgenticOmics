#!/bin/bash
# AgenticOmics - Get Current Ngrok URL
# Simple script to get the current ngrok URL and update status check

echo "🌐 Getting Current Ngrok URL..."
echo "================================"

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "❌ Ngrok is not running!"
    echo "💡 Start ngrok with: ngrok http 12000"
    exit 1
fi

# Get current ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'])" 2>/dev/null || echo "")

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL"
    exit 1
fi

echo "🌐 Current ngrok URL: $NGROK_URL"

# Update status check script
echo "📝 Updating status check script..."
sed -i.bak "s|https://[a-zA-Z0-9-]*\.ngrok-free\.app|$NGROK_URL|g" check-external-status.sh
echo "✅ Updated status check script"

# Test the URL
echo "🧪 Testing external access..."
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$NGROK_URL" || echo "000")

echo ""
echo "🎉 Ready to share!"
echo "=================="
echo "🌐 External URL: $NGROK_URL"
echo "📊 Status: $([ "$STATUS" = "200" ] && echo "✅ Working" || echo "❌ Failed ($STATUS)")"
echo ""
echo "💡 Test anytime: ./check-external-status.sh" 