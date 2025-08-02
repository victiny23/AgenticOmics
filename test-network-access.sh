#!/bin/bash

# AgenticOmics Network Access Testing Script
# This script starts the application with network access and provides comprehensive testing

set -e

echo "🧪 AgenticOmics Network Access Testing"
echo "======================================"

# Function to get local IP address
get_local_ip() {
    if command -v ip >/dev/null 2>&1; then
        ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}' 2>/dev/null || echo "localhost"
    elif command -v ifconfig >/dev/null 2>&1; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1 || echo "localhost"
    else
        echo "localhost"
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-5}
    
    echo -n "   Testing $name ($url)... "
    
    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout $timeout --max-time $timeout "$url" >/dev/null 2>&1; then
            echo "✅ OK"
            return 0
        else
            echo "❌ Failed"
            return 1
        fi
    else
        echo "⚠️  curl not available"
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "   Waiting for $name (port $port)... "
    
    while [ $attempt -le $max_attempts ]; do
        if command -v nc >/dev/null 2>&1; then
            if nc -z localhost $port 2>/dev/null; then
                echo "✅ Ready"
                return 0
            fi
        elif command -v lsof >/dev/null 2>&1; then
            if lsof -i :$port >/dev/null 2>&1; then
                echo "✅ Ready"
                return 0
            fi
        fi
        
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo "❌ Timeout"
    return 1
}

LOCAL_IP=$(get_local_ip)

echo ""
echo "🖥️  Network Information:"
echo "   Local IP: $LOCAL_IP"
echo "   Hostname: $(hostname)"

if [[ "$LOCAL_IP" == "localhost" ]]; then
    echo "   ⚠️  Warning: Could not detect local IP address"
    echo "   This may prevent network access from other devices"
fi

echo ""
echo "🚀 Starting AgenticOmics with Network Access..."

# Kill any existing processes
echo "   Stopping any existing services..."
pkill -f "java.*gateway" 2>/dev/null || true
pkill -f "java.*auth" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
sleep 2

# Start the application with network access
echo "   Starting application..."
./start-app-network.sh &
START_PID=$!

# Wait a bit for startup
sleep 5

echo ""
echo "⏳ Waiting for Services to Start..."

# Wait for each service
wait_for_service 8080 "API Gateway"
wait_for_service 8081 "Auth Service" 
wait_for_service 3000 "Frontend"

echo ""
echo "🧪 Testing Network Connectivity..."

# Test localhost access
echo ""
echo "📍 Testing Localhost Access:"
test_endpoint "http://localhost:3000" "Frontend (localhost)"
test_endpoint "http://localhost:8080/actuator/health" "API Gateway (localhost)"
test_endpoint "http://localhost:8081/actuator/health" "Auth Service (localhost)"

# Test network access
if [[ "$LOCAL_IP" != "localhost" ]]; then
    echo ""
    echo "🌐 Testing Network Access:"
    test_endpoint "http://$LOCAL_IP:3000" "Frontend (network)"
    test_endpoint "http://$LOCAL_IP:8080/actuator/health" "API Gateway (network)"
    test_endpoint "http://$LOCAL_IP:8081/actuator/health" "Auth Service (network)"
else
    echo ""
    echo "⚠️  Cannot test network access - local IP not detected"
fi

echo ""
echo "📱 URLs for Other Devices:"
if [[ "$LOCAL_IP" != "localhost" ]]; then
    echo "   🌐 Main Application: http://$LOCAL_IP:3000"
    echo "   🔧 API Gateway: http://$LOCAL_IP:8080"
    echo "   🔐 Auth Service: http://$LOCAL_IP:8081"
    echo ""
    echo "   📋 Share this URL with others on your network:"
    echo "   ➡️  http://$LOCAL_IP:3000"
else
    echo "   ❌ Network URLs not available - local IP detection failed"
fi

echo ""
echo "🔧 Troubleshooting Commands:"
echo "   Check services: ./debug-network.sh"
echo "   View logs: tail -f logs/*.log"
echo "   Stop services: ./stop-app.sh"

echo ""
echo "🎯 Next Steps:"
echo "1. Try accessing http://$LOCAL_IP:3000 from another device"
echo "2. Ensure both devices are on the same WiFi network"
echo "3. Check firewall settings if connection fails"
echo "4. Run ./debug-network.sh for detailed diagnostics"

echo ""
echo "✅ Network access testing complete!"
echo "   The application should now be accessible from other devices on your network."