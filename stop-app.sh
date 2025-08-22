#!/bin/bash

# AgenticOmics Platform Stop Script
# This script stops all running services

echo "🛑 Stopping AgenticOmics Platform..."
echo "===================================="

# Stop processes using PID file if available
if [ -f "logs/app-pids.txt" ]; then
    echo "📋 Stopping services using saved PIDs..."
    PIDS=$(cat logs/app-pids.txt)
    for pid in $PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo "   Stopping process $pid..."
            kill $pid 2>/dev/null || true
        fi
    done
    rm -f logs/app-pids.txt
    echo "✅ Services stopped using PIDs"
fi

# Fallback: kill by process name
echo "🧹 Cleaning up any remaining processes..."
pkill -f "spring-boot:run" 2>/dev/null && echo "   ✅ Stopped Spring Boot services" || true
pkill -f "npm" 2>/dev/null && echo "   ✅ Stopped npm processes" || true
pkill -f "node" 2>/dev/null && echo "   ✅ Stopped Node.js processes" || true
pkill -f "java.*agenticomics" 2>/dev/null && echo "   ✅ Stopped Java processes" || true

# Force kill any process using port 12000 (React dev server)
if lsof -ti:12000 >/dev/null 2>&1; then
    echo "   🔥 Force killing processes on port 12000..."
    lsof -ti:12000 | xargs kill -9 2>/dev/null && echo "   ✅ Killed processes on port 12000" || true
fi

# Wait a moment for processes to terminate
sleep 2

# Check if ports are free
echo ""
echo "🔍 Checking port status..."
if command -v lsof >/dev/null 2>&1; then
    for port in 12000 12001 8081 8082; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo "   ⚠️  Port $port still in use"
        else
            echo "   ✅ Port $port is free"
        fi
    done
else
    echo "   ℹ️  Port check not available (lsof not found)"
fi

echo ""
echo "✅ AgenticOmics Platform stopped successfully!"
echo ""
echo "💡 To start again, run:"
echo "   ./start-app.sh (Mac/Linux)"
echo "   start-app.bat (Windows)"
echo ""