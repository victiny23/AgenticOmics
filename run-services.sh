#!/bin/bash

# AgenticOmics Backend Services Runner
# This script helps you run individual microservices

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/backend" && pwd)"

show_help() {
    echo "AgenticOmics Backend Services Runner"
    echo ""
    echo "Usage: $0 [SERVICE] [OPTIONS]"
    echo ""
    echo "Services:"
    echo "  auth              Run Authentication Service (port 8081)"
    echo "  data              Run Data Management Service (port 8082)"
    echo "  pipeline          Run Pipeline Engine Service (port 8083)"
    echo "  gateway           Run API Gateway Service (port 8080)"
    echo "  notification      Run Notification Service (port 8084)"
    echo "  all               Run all services (in background)"
    echo ""
    echo "Options:"
    echo "  --build           Build all modules before running"
    echo "  --clean           Clean and build all modules"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 auth                    # Run authentication service"
    echo "  $0 gateway --build         # Build and run API gateway"
    echo "  $0 all                     # Run all services in background"
    echo ""
}

build_all() {
    echo "Building all modules..."
    cd "$BACKEND_DIR"
    mvn clean install -DskipTests
    echo "Build completed successfully!"
}

run_service() {
    local service=$1
    local service_dir=""
    local service_name=""
    local port=""
    
    case $service in
        "auth")
            service_dir="$BACKEND_DIR/auth"
            service_name="Authentication Service"
            port="8081"
            ;;
        "data")
            service_dir="$BACKEND_DIR/data-management"
            service_name="Data Management Service"
            port="8082"
            ;;
        "pipeline")
            service_dir="$BACKEND_DIR/pipeline-engine"
            service_name="Pipeline Engine Service"
            port="8083"
            ;;
        "gateway")
            service_dir="$BACKEND_DIR/api-gateway"
            service_name="API Gateway Service"
            port="8080"
            ;;
        "notification")
            service_dir="$BACKEND_DIR/notification"
            service_name="Notification Service"
            port="8084"
            ;;
        *)
            echo "Error: Unknown service '$service'"
            echo "Run '$0 --help' for available services"
            exit 1
            ;;
    esac
    
    echo "Starting $service_name on port $port..."
    echo "Service directory: $service_dir"
    echo "Press Ctrl+C to stop the service"
    echo "----------------------------------------"
    
    cd "$service_dir"
    mvn spring-boot:run
}

run_all_services() {
    echo "Starting all services in background..."
    
    # Create logs directory
    mkdir -p "$BACKEND_DIR/logs"
    
    # Start each service in background
    echo "Starting Authentication Service (port 8081)..."
    cd "$BACKEND_DIR/auth"
    nohup mvn spring-boot:run > "$BACKEND_DIR/logs/auth.log" 2>&1 &
    AUTH_PID=$!
    
    echo "Starting Data Management Service (port 8082)..."
    cd "$BACKEND_DIR/data-management"
    nohup mvn spring-boot:run > "$BACKEND_DIR/logs/data-management.log" 2>&1 &
    DATA_PID=$!
    
    echo "Starting Pipeline Engine Service (port 8083)..."
    cd "$BACKEND_DIR/pipeline-engine"
    nohup mvn spring-boot:run > "$BACKEND_DIR/logs/pipeline-engine.log" 2>&1 &
    PIPELINE_PID=$!
    
    echo "Starting API Gateway Service (port 8080)..."
    cd "$BACKEND_DIR/api-gateway"
    nohup mvn spring-boot:run > "$BACKEND_DIR/logs/api-gateway.log" 2>&1 &
    GATEWAY_PID=$!
    
    echo "Starting Notification Service (port 8084)..."
    cd "$BACKEND_DIR/notification"
    nohup mvn spring-boot:run > "$BACKEND_DIR/logs/notification.log" 2>&1 &
    NOTIFICATION_PID=$!
    
    # Save PIDs for later cleanup
    echo "$AUTH_PID $DATA_PID $PIPELINE_PID $GATEWAY_PID $NOTIFICATION_PID" > "$BACKEND_DIR/logs/service-pids.txt"
    
    echo ""
    echo "All services started in background!"
    echo "Service logs are available in: $BACKEND_DIR/logs/"
    echo ""
    echo "Service URLs:"
    echo "  Authentication Service: http://localhost:8081"
    echo "  Data Management Service: http://localhost:8082"
    echo "  Pipeline Engine Service: http://localhost:8083"
    echo "  API Gateway Service: http://localhost:8080"
    echo "  Notification Service: http://localhost:8084"
    echo ""
    echo "To stop all services, run: pkill -f 'spring-boot:run'"
    echo "Or kill individual processes using the PIDs in: $BACKEND_DIR/logs/service-pids.txt"
}

# Parse command line arguments
BUILD=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        --build)
            BUILD=true
            shift
            ;;
        --clean)
            CLEAN=true
            BUILD=true
            shift
            ;;
        auth|data|pipeline|gateway|notification|all)
            SERVICE=$1
            shift
            ;;
        *)
            echo "Error: Unknown option '$1'"
            echo "Run '$0 --help' for usage information"
            exit 1
            ;;
    esac
done

# Show help if no service specified
if [[ -z "$SERVICE" ]]; then
    show_help
    exit 1
fi

# Build if requested
if [[ "$CLEAN" == true ]]; then
    echo "Cleaning and building all modules..."
    cd "$BACKEND_DIR"
    mvn clean install -DskipTests
elif [[ "$BUILD" == true ]]; then
    build_all
fi

# Run the requested service
if [[ "$SERVICE" == "all" ]]; then
    run_all_services
else
    run_service "$SERVICE"
fi