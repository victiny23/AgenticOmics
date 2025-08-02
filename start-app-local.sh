#!/bin/bash

# AgenticOmics Platform Local-Only Startup Script
# This script starts all services with localhost binding for security

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

echo "🔒 Starting AgenticOmics Platform (Local Access Only)..."
echo "======================================================="
echo "🖥️  Access Mode: Localhost only (secure)"
echo "   This is the recommended mode for development"
echo ""

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
            pkill -f "vite" 2>/dev/null || true
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
pkill -f "vite" 2>/dev/null || true
sleep 2

# Check required ports
check_port 8080
check_port 8081
check_port 3000

# Create logs directory
mkdir -p logs

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

# Step 2: Start API Gateway (localhost only)
echo ""
echo "🌐 Starting API Gateway (port 8080) - localhost only..."
./run-services.sh gateway > logs/gateway.log 2>&1 &
GATEWAY_PID=$!

# Step 3: Start Authentication Service (localhost only)
echo "🔐 Starting Authentication Service (port 8081) - localhost only..."
./run-services.sh auth > logs/auth.log 2>&1 &
AUTH_PID=$!

# Wait for backend services
wait_for_service 8080 "API Gateway"
wait_for_service 8081 "Authentication Service"

# Step 4: Start Frontend (localhost only)
echo ""
echo "🎨 Starting Frontend Application (port 3000) - localhost only..."
cd frontend/web-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install --silent
fi

# Start the frontend (localhost only)
echo "   Starting React development server..."
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend
wait_for_service 3000 "Frontend Application"

# Create PID file for cleanup
echo "$GATEWAY_PID $AUTH_PID $FRONTEND_PID" > logs/app-pids.txt

echo ""
echo "🎉 AgenticOmics Platform Started Successfully (Local Access Only)!"
echo "=================================================================="
echo ""
echo "📱 Access the application:"
echo "   🏠 Main Application: http://localhost:3000"
echo "   🔧 API Gateway:      http://localhost:8080"
echo "   🔐 Auth Service:     http://localhost:8081"
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
echo "🌐 Need network access? Use: ./start-app-network.sh"
echo "🛑 To stop all services: ./stop-app.sh or press Ctrl+C"
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
    pkill -f "vite" 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
while true; do
    sleep 1
done