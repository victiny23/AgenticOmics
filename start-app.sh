#!/bin/bash

# AgenticOmics Platform Startup Script
# This script starts all necessary services for the platform

set -e

# Set JAVA_HOME if not already set
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
    elif [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
    elif [ -d "/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home" ]; then
        export JAVA_HOME="/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home"
    fi
fi

# Check if we're in a runtime environment with external URLs
if [[ -n "$RUNTIME_ENV" || "$1" == "--external" ]]; then
    echo "🌍 Starting AgenticOmics Platform with External Access..."
    echo "========================================================"
    echo "🖥️  Runtime Environment: OpenHands"
    echo "🌐 External URLs will be enabled"
    export EXTERNAL_MODE=true
    export SERVER_ADDRESS=0.0.0.0
    export FRONTEND_PORT=12000
    export API_GATEWAY_PORT=12001
    export AUTH_PORT=8081
    export VITE_HOST=0.0.0.0
    export VITE_PORT=12000
    export VITE_API_TARGET=https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev
    export CORS_ALLOWED_ORIGINS=https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev,http://localhost:12000,http://0.0.0.0:12000
else
    echo "🚀 Starting AgenticOmics Platform (Local Access Only)..."
    echo "======================================================="
    echo "🔒 Security Mode: Localhost only (recommended)"
    echo "   For network access, use: ./start-app.sh --external"
    echo ""
    EXTERNAL_MODE=false
fi

# Check if we're in the right directory
if [ ! -f "run-services.sh" ]; then
    echo "❌ Error: Please run this script from the AgenticOmics project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: run-services.sh, backend/, frontend/"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :$port >/dev/null 2>&1; then
            echo "⚠️  Port $port is already in use. Stopping existing processes..."
            pkill -f "spring-boot:run" 2>/dev/null || true
            pkill -f "npm start" 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Function to wait for service to start
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to start on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if command -v curl >/dev/null 2>&1; then
            if curl -s http://localhost:$port >/dev/null 2>&1; then
                echo "✅ $service_name is ready!"
                return 0
            fi
        else
            # Fallback: just wait a bit longer without curl
            if [ $attempt -eq 10 ]; then
                echo "✅ $service_name should be ready (curl not available for verification)"
                return 0
            fi
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "⚠️  $service_name may not be fully ready yet, but continuing..."
    return 0
}

# Clean up any existing processes
echo "🧹 Cleaning up any existing processes..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Check required ports
check_port 8080
check_port 8081
check_port 3000

# Step 1: Build backend (if needed)
echo ""
echo "🔨 Building backend services..."
cd backend
if [ ! -d "auth/target" ] || [ ! -d "api-gateway/target" ]; then
    echo "   First time setup - building all modules..."
    mvn clean install -DskipTests -q
    echo "✅ Backend build completed!"
else
    echo "✅ Backend already built (skipping)"
fi
cd ..

# Step 2: Start API Gateway
echo ""
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🌐 Starting API Gateway (port $API_GATEWAY_PORT) with external access..."
    cd backend/api-gateway
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$API_GATEWAY_PORT --server.address=$SERVER_ADDRESS --cors.allowed-origins=$CORS_ALLOWED_ORIGINS" > ../../logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
    cd ../..
else
    echo "🌐 Starting API Gateway (port 8080)..."
    ./run-services.sh gateway > logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
fi

# Step 3: Start Authentication Service
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🔐 Starting Authentication Service (port $AUTH_PORT) with external access..."
    cd backend/auth
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$AUTH_PORT --server.address=$SERVER_ADDRESS" > ../../logs/auth.log 2>&1 &
    AUTH_PID=$!
    cd ../..
else
    echo "🔐 Starting Authentication Service (port 8081)..."
    ./run-services.sh auth > logs/auth.log 2>&1 &
    AUTH_PID=$!
fi

# Wait for backend services
if [ "$EXTERNAL_MODE" = true ]; then
    wait_for_service $API_GATEWAY_PORT "API Gateway"
    wait_for_service $AUTH_PORT "Authentication Service"
else
    wait_for_service 8080 "API Gateway"
    wait_for_service 8081 "Authentication Service"
fi

# Step 4: Start Frontend
echo ""
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🎨 Starting Frontend Application with External Access (port $FRONTEND_PORT)..."
else
    echo "🎨 Starting Frontend Application (port 3000)..."
fi

cd frontend/web-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install --silent
fi

if [ "$EXTERNAL_MODE" = true ]; then
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

    echo "   Starting React development server with external access..."
    nohup npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend
    wait_for_service $FRONTEND_PORT "Frontend Application"
else
    echo "   Starting React development server..."
    npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend
    wait_for_service 3000 "Frontend Application"
fi

# Create PID file for cleanup
mkdir -p logs
echo "$GATEWAY_PID $AUTH_PID $FRONTEND_PID" > logs/app-pids.txt

echo ""
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🎉 AgenticOmics Platform Started Successfully with External Access!"
    echo "=================================================================="
    echo ""
    echo "📱 Access the application:"
    echo "   🌍 External Access (from anywhere on the internet):"
    echo "      • Main Application: https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
    echo "      • API Gateway:      https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev"
    echo ""
    echo "   🏠 Local Access (for testing):"
    echo "      • Main Application: http://localhost:$FRONTEND_PORT"
    echo "      • API Gateway:      http://localhost:$API_GATEWAY_PORT"
    echo "      • Auth Service:     http://localhost:$AUTH_PORT"
else
    echo "🎉 AgenticOmics Platform Started Successfully!"
    echo "=============================================="
    echo ""
    echo "📱 Access the application:"
    echo "   🌐 Main Application: http://localhost:3000"
    echo "   🔧 API Gateway:      http://localhost:8080"
    echo "   🔐 Auth Service:     http://localhost:8081"
fi

echo ""
echo "📋 Service Status:"
echo "   ✅ API Gateway running (PID: $GATEWAY_PID)"
echo "   ✅ Authentication Service running (PID: $AUTH_PID)"
echo "   ✅ Frontend Application running (PID: $FRONTEND_PID)"
echo ""
echo "📁 Logs available in:"
echo "   - logs/gateway.log"
echo "   - logs/auth.log"
echo "   - logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-app.sh"
echo "   or press Ctrl+C in this terminal"
echo ""

if [ "$EXTERNAL_MODE" = true ]; then
    echo "🎯 Open your browser and go to: https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
    echo "💡 Test external access with: ./check-external-status.sh"
else
    echo "🎯 Open your browser and go to: http://localhost:3000"
    echo "💡 For external access, restart with: ./start-app.sh --external"
fi
echo ""

# Keep the script running and handle Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Stopping AgenticOmics Platform..."
    
    if [ -f "logs/app-pids.txt" ]; then
        PIDS=$(cat logs/app-pids.txt)
        for pid in $PIDS; do
            kill $pid 2>/dev/null || true
        done
        rm -f logs/app-pids.txt
    fi
    
    pkill -f "spring-boot:run" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
while true; do
    sleep 1
done