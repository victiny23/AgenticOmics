#!/bin/bash

# Define URLs
FRONTEND_EXTERNAL="https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev"
API_GATEWAY_EXTERNAL="https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev"
FRONTEND_LOCAL="http://localhost:12000"
API_GATEWAY_LOCAL="http://localhost:12001"
AUTH_SERVICE_LOCAL="http://localhost:8081"

# Function to check service status with detailed output
check_service() {
    local name=$1
    local url=$2
    local timeout=5
    
    echo -n "🔍 $name: "
    
    # Get HTTP status code with timeout
    local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
            echo "✅ OK (HTTP $status)"
        else
            echo "❌ Error (HTTP $status)"
        fi
    else
        echo "❌ Connection failed (curl exit code: $exit_code)"
    fi
}

# Function to check if a process is running
check_process() {
    local name=$1
    local pattern=$2
    
    echo -n "🔍 $name Process: "
    if pgrep -f "$pattern" > /dev/null; then
        echo "✅ Running"
    else
        echo "❌ Not running"
    fi
}

# Check if services are running
check_running_services() {
    echo "📊 Process Status:"
    echo "----------------"
    check_process "API Gateway" "api-gateway.*spring-boot:run"
    check_process "Auth Service" "auth.*spring-boot:run"
    check_process "Frontend" "npm run dev"
    echo ""
}

# Main test function
run_tests() {
    echo "🧪 Testing External Access..."
    echo "================================"
    
    # Check processes first
    check_running_services
    
    # Check endpoints
    echo "🌐 Endpoint Status:"
    echo "----------------"
    check_service "Frontend (External)" "$FRONTEND_EXTERNAL"
    check_service "API Gateway (External)" "$API_GATEWAY_EXTERNAL"
    check_service "Frontend (Local)" "$FRONTEND_LOCAL"
    check_service "API Gateway (Local)" "$API_GATEWAY_LOCAL"
    check_service "Auth Service (Local)" "$AUTH_SERVICE_LOCAL"
    echo ""
    
    # Check ports
    echo "🔌 Port Status:"
    echo "----------------"
    echo -n "🔍 Port 12000 (Frontend): "
    if netstat -tuln 2>/dev/null | grep -q ":12000 "; then
        echo "✅ Open"
    else
        echo "❌ Closed"
    fi
    
    echo -n "🔍 Port 12001 (API Gateway): "
    if netstat -tuln 2>/dev/null | grep -q ":12001 "; then
        echo "✅ Open"
    else
        echo "❌ Closed"
    fi
    
    echo -n "🔍 Port 8081 (Auth Service): "
    if netstat -tuln 2>/dev/null | grep -q ":8081 "; then
        echo "✅ Open"
    else
        echo "❌ Closed"
    fi
    echo ""
    
    # Provide troubleshooting guidance
    echo "💡 Troubleshooting Tips:"
    echo "------------------------"
    echo "• If external URLs show errors but local ones work, check CORS settings"
    echo "• If processes aren't running, restart with: ./start-app.sh --external"
    echo "• If ports are closed, check for port conflicts or firewall issues"
    echo "• For detailed logs, check the logs/ directory"
}

# Run the tests
run_tests
