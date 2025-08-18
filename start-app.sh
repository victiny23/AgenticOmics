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
# Set default ports for all modes
export FRONTEND_PORT=12000
export API_GATEWAY_PORT=12001
export AUTH_PORT=8081
export DATA_PORT=8082

if [[ -n "$RUNTIME_ENV" || "$1" == "--external" ]]; then
    echo "🌍 Starting AgenticOmics Platform with External Access..."
    echo "========================================================"
    echo "🖥️  Runtime Environment: OpenHands"
    echo "🌐 External URLs will be enabled"
    export EXTERNAL_MODE=true
    export SERVER_ADDRESS=0.0.0.0
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
check_port $API_GATEWAY_PORT
check_port $AUTH_PORT
check_port $DATA_PORT
check_port $FRONTEND_PORT

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
    echo "🌐 Starting API Gateway (port $API_GATEWAY_PORT)..."
    cd backend/api-gateway
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$API_GATEWAY_PORT" > ../../logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
    cd ../..
fi

# Step 3: Start Authentication Service
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🔐 Starting Authentication Service (port $AUTH_PORT) with external access..."
    cd backend/auth
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$AUTH_PORT --server.address=$SERVER_ADDRESS" > ../../logs/auth.log 2>&1 &
    AUTH_PID=$!
    cd ../..
else
    echo "🔐 Starting Authentication Service (port $AUTH_PORT)..."
    cd backend/auth
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$AUTH_PORT" > ../../logs/auth.log 2>&1 &
    AUTH_PID=$!
    cd ../..
fi

# Step 4: Start Data Management Service
if [ "$EXTERNAL_MODE" = true ]; then
    echo "📊 Starting Data Management Service (port $DATA_PORT) with external access..."
    cd backend/data-management
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$DATA_PORT --server.address=$SERVER_ADDRESS" > ../../logs/data-management.log 2>&1 &
    DATA_PID=$!
    cd ../..
else
    echo "📊 Starting Data Management Service (port $DATA_PORT)..."
    cd backend/data-management
    nohup mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=$DATA_PORT" > ../../logs/data-management.log 2>&1 &
    DATA_PID=$!
    cd ../..
fi

# Wait for backend services
wait_for_service $API_GATEWAY_PORT "API Gateway"
wait_for_service $AUTH_PORT "Authentication Service"
wait_for_service $DATA_PORT "Data Management Service"

# Step 4: Start Frontend
echo ""
echo "🎨 Starting Frontend Application (port $FRONTEND_PORT)..."

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
else
    echo "   Starting React development server..."
    nohup npm run dev -- --port $FRONTEND_PORT > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
fi

# Wait for frontend
wait_for_service $FRONTEND_PORT "Frontend Application"

# Create PID file for cleanup
mkdir -p logs
echo "$GATEWAY_PID $AUTH_PID $DATA_PID $FRONTEND_PID" > logs/app-pids.txt

# Add at the top, after set -e
get_local_ip() {
    if command -v hostname >/dev/null 2>&1; then
        hostname -I | awk '{print $1}' 2>/dev/null || echo "your-ip-address"
    elif command -v ip >/dev/null 2>&1; then
        ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "your-ip-address"
    elif command -v ifconfig >/dev/null 2>&1; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1 || echo "your-ip-address"
    else
        echo "your-ip-address"
    fi
}

get_public_ip() {
    if [ -n "$EXTERNAL_URL" ]; then
        echo "$EXTERNAL_URL"
    elif command -v curl >/dev/null 2>&1; then
        curl -s https://api.ipify.org || echo "unavailable"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO- https://api.ipify.org || echo "unavailable"
    else
        echo "unavailable"
    fi
}

LOCAL_IP=$(get_local_ip)
PUBLIC_IP=$(get_public_ip)

echo ""
if [ "$EXTERNAL_MODE" = true ]; then
    echo "🎉 AgenticOmics Platform Started Successfully with External Access!"
    echo "=================================================================="
    echo ""
    echo "📱 Access the application:"
    echo "   🏠 Local Access:"
    echo "      • Main Application: http://localhost:$FRONTEND_PORT"
    echo "      • API Gateway:      http://localhost:$API_GATEWAY_PORT"
    echo "      • Auth Service:     http://localhost:$AUTH_PORT"
    echo ""
    echo "   🌐 Network Access (from other devices on same network):"
    echo "      • Main Application: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "      • API Gateway:      http://$LOCAL_IP:$API_GATEWAY_PORT"
    echo "      • Auth Service:     http://$LOCAL_IP:$AUTH_PORT"
    echo ""
    echo "   🌍 External Access (if port forwarding or tunnel is configured):"
    echo "      • Main Application: http://$PUBLIC_IP:$FRONTEND_PORT"
    echo "      • API Gateway:      http://$PUBLIC_IP:$API_GATEWAY_PORT"
    echo "      • Auth Service:     http://$PUBLIC_IP:$AUTH_PORT"
    echo ""
    echo "🔗 Share these URLs with others:"
    echo "   📱 Mobile/Tablet on same network: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "   💻 Other Laptops on same network: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "   🌍 External devices (if port forwarding/tunnel configured): http://$PUBLIC_IP:$FRONTEND_PORT"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./stop-app.sh"
    echo "   or press Ctrl+C in this terminal"
    echo ""
    echo "Press Ctrl+C to stop all services..."
else
    echo "🎉 AgenticOmics Platform Started Successfully!"
    echo "=============================================="
    echo ""
    echo "📱 Access the application:"
    echo "   🏠 Local Access:"
    echo "      • Main Application (Frontend): http://localhost:$FRONTEND_PORT"
    echo "      • H2 Database Console:        http://localhost:$AUTH_PORT/h2-console"
    echo "   🔧 Backend Services (for developers):"
    echo "      • API Gateway:      http://localhost:$API_GATEWAY_PORT"
    echo "      • Auth Service:     http://localhost:$AUTH_PORT"
    echo "      • Data Management:  http://localhost:$DATA_PORT"
    echo "   🌐 Network Access (from other devices on same network):"
    echo "      • Main Application: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "   🌍 External Access (if port forwarding or tunnel is configured):"
    echo "      • Main Application: http://$PUBLIC_IP:$FRONTEND_PORT"
    echo "🔗 Share these URLs with others:"
    echo "   📱 Mobile/Tablet on same network: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "   💻 Other Laptops on same network: http://$LOCAL_IP:$FRONTEND_PORT"
    echo "   🌍 External devices (if port forwarding/tunnel configured): http://$PUBLIC_IP:$FRONTEND_PORT"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./stop-app.sh"
    echo "   or press Ctrl+C in this terminal"
    echo ""
    echo "Press Ctrl+C to stop all services..."
fi

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
while true; do
    sleep 1
done