#!/bin/bash

# AgenticOmics External Access Startup Script for Runtime Environment
# This script configures the application to use the provided external URLs

set -e

echo "🌍 Starting AgenticOmics Platform for External Runtime Access..."
echo "========================================================"
echo "🖥️  Runtime Environment: OpenHands"
echo "🌐 External URLs:"
echo "   • Main App: https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
echo "   • API Gateway: https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev"
echo "⚠️  Security Notice: Services will be accessible from the internet"
echo

# Set environment variables for external runtime access
export SERVER_ADDRESS=0.0.0.0
export FRONTEND_PORT=12000
export API_GATEWAY_PORT=12001
export AUTH_PORT=8081
export VITE_HOST=0.0.0.0
export VITE_PORT=12000
export VITE_API_TARGET=https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev
export CORS_ALLOWED_ORIGINS=https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev,http://localhost:12000,http://0.0.0.0:12000

echo "🧹 Cleaning up any existing processes..."
./stop-app.sh 2>/dev/null || true

echo
echo "🔨 Building backend services..."
if [ ! -f "backend/target/built" ]; then
    echo "   First time setup - building all modules..."
    cd backend
    mvn clean install -DskipTests -q
    mkdir -p target
    touch target/built
    cd ..
    echo "✅ Backend build completed!"
else
    echo "✅ Backend already built (skipping)"
fi

echo
echo "🌐 Starting API Gateway (port $API_GATEWAY_PORT) with external access..."
cd backend/api-gateway
nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$API_GATEWAY_PORT --server.address=$SERVER_ADDRESS --cors.allowed-origins=$CORS_ALLOWED_ORIGINS" > ../../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
cd ../..

echo "🔐 Starting Authentication Service (port $AUTH_PORT) with external access..."
cd backend/auth
nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$AUTH_PORT --server.address=$SERVER_ADDRESS" > ../../logs/auth.log 2>&1 &
AUTH_PID=$!
cd ../..

# Wait for backend services to start
echo "⏳ Waiting for API Gateway to start on port $API_GATEWAY_PORT..."
for i in {1..30}; do
    if curl -s http://localhost:$API_GATEWAY_PORT/actuator/health >/dev/null 2>&1; then
        echo "✅ API Gateway is ready!"
        break
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 2
done

echo "⏳ Waiting for Authentication Service to start on port $AUTH_PORT..."
for i in {1..30}; do
    if curl -s http://localhost:$AUTH_PORT/actuator/health >/dev/null 2>&1; then
        echo "✅ Authentication Service is ready!"
        break
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 2
done

echo
echo "🎨 Starting Frontend Application with External Runtime Access (port $FRONTEND_PORT)..."
cd frontend/web-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install --silent
fi

# Create or update vite config for external access
cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: $FRONTEND_PORT,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev',
      'localhost',
      '0.0.0.0'
    ]
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('$VITE_API_TARGET')
  }
})
EOF

echo "   Starting React development server with external runtime access..."
nohup npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
echo "⏳ Waiting for Frontend Application to start on port $FRONTEND_PORT..."
for i in {1..30}; do
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        echo "✅ Frontend Application is ready!"
        break
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 2
done

echo
echo "🎉 AgenticOmics Platform Started Successfully with External Runtime Access!"
echo "=================================================================="
echo
echo "📱 Access the application:"
echo "   🌍 External Access (from anywhere on the internet):"
echo "      • Main Application: https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
echo "      • API Gateway:      https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev"
echo
echo "   🏠 Local Access (for testing):"
echo "      • Main Application: http://localhost:$FRONTEND_PORT"
echo "      • API Gateway:      http://localhost:$API_GATEWAY_PORT"
echo "      • Auth Service:     http://localhost:$AUTH_PORT"
echo
echo "📋 Service Status:"
echo "   ✅ API Gateway running (PID: $GATEWAY_PID)"
echo "   ✅ Authentication Service running (PID: $AUTH_PID)"
echo "   ✅ Frontend Application running (PID: $FRONTEND_PID)"
echo
echo "📁 Logs available in:"
echo "   - logs/gateway.log"
echo "   - logs/auth.log"
echo "   - logs/frontend.log"
echo
echo "🔗 Share this URL with others:"
echo "   🌍 https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
echo
echo "🛑 To stop all services:"
echo "   ./stop-app.sh"
echo "   or press Ctrl+C in this terminal"
echo

# Create a simple status check script
cat > check-external-status.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing External Access..."
echo "================================"
echo -n "Frontend (External): "
curl -s -o /dev/null -w "%{http_code}" https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev && echo " ✅" || echo " ❌"
echo -n "API Gateway (External): "
curl -s -o /dev/null -w "%{http_code}" https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev && echo " ✅" || echo " ❌"
echo -n "Frontend (Local): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:12000 && echo " ✅" || echo " ❌"
echo -n "API Gateway (Local): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:12001 && echo " ✅" || echo " ❌"
EOF
chmod +x check-external-status.sh

echo "💡 Test external access with: ./check-external-status.sh"
echo

# Keep the script running and handle Ctrl+C
trap 'echo "🛑 Stopping AgenticOmics Platform..."; ./stop-app.sh; echo "✅ All services stopped"; exit 0' INT

echo "Press Ctrl+C to stop all services..."
while true; do
    sleep 1
done