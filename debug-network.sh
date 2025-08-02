#!/bin/bash

# AgenticOmics Network Debugging and Testing Script
# This script helps diagnose and fix network connectivity issues

set -e

echo "🔍 AgenticOmics Network Debugging Tool"
echo "======================================"

# Function to get local IP address with multiple methods
get_local_ip() {
    local ip=""
    
    # Method 1: ip route (Linux)
    if command -v ip >/dev/null 2>&1; then
        ip=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}' 2>/dev/null)
        if [[ -n "$ip" && "$ip" != "localhost" ]]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 2: ifconfig (macOS/Linux)
    if command -v ifconfig >/dev/null 2>&1; then
        ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
        if [[ -n "$ip" ]]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 3: hostname -I (Linux)
    if command -v hostname >/dev/null 2>&1; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [[ -n "$ip" && "$ip" != "127.0.0.1" ]]; then
            echo "$ip"
            return
        fi
    fi
    
    # Method 4: netstat (fallback)
    if command -v netstat >/dev/null 2>&1; then
        ip=$(netstat -rn 2>/dev/null | grep "^0.0.0.0" | awk '{print $2}' | head -1)
        if [[ -n "$ip" && "$ip" != "127.0.0.1" ]]; then
            echo "$ip"
            return
        fi
    fi
    
    echo "localhost"
}

# Function to test port connectivity
test_port() {
    local host=$1
    local port=$2
    local service_name=$3
    
    if command -v nc >/dev/null 2>&1; then
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "✅ $service_name ($host:$port) - Accessible"
            return 0
        else
            echo "❌ $service_name ($host:$port) - Not accessible"
            return 1
        fi
    elif command -v telnet >/dev/null 2>&1; then
        if timeout 3 telnet "$host" "$port" </dev/null >/dev/null 2>&1; then
            echo "✅ $service_name ($host:$port) - Accessible"
            return 0
        else
            echo "❌ $service_name ($host:$port) - Not accessible"
            return 1
        fi
    else
        echo "⚠️  $service_name ($host:$port) - Cannot test (nc/telnet not available)"
        return 1
    fi
}

# Function to check if port is in use
check_port_usage() {
    local port=$1
    local service_name=$2
    
    if command -v lsof >/dev/null 2>&1; then
        local process=$(lsof -i :$port 2>/dev/null | grep LISTEN | head -1)
        if [[ -n "$process" ]]; then
            echo "✅ $service_name (port $port) - Running"
            echo "   Process: $process"
            return 0
        else
            echo "❌ $service_name (port $port) - Not running"
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        local process=$(netstat -ln 2>/dev/null | grep ":$port ")
        if [[ -n "$process" ]]; then
            echo "✅ $service_name (port $port) - Running"
            return 0
        else
            echo "❌ $service_name (port $port) - Not running"
            return 1
        fi
    else
        echo "⚠️  Cannot check $service_name (port $port) - lsof/netstat not available"
        return 1
    fi
}

# Function to check firewall status
check_firewall() {
    echo ""
    echo "🔥 Firewall Status:"
    
    # Linux - ufw
    if command -v ufw >/dev/null 2>&1; then
        local ufw_status=$(ufw status 2>/dev/null | head -1)
        echo "   UFW: $ufw_status"
        if [[ "$ufw_status" == *"active"* ]]; then
            echo "   ⚠️  UFW is active - may block network access"
            echo "   💡 To allow ports: sudo ufw allow 3000 && sudo ufw allow 8080 && sudo ufw allow 8081"
        fi
    fi
    
    # Linux - iptables
    if command -v iptables >/dev/null 2>&1; then
        local iptables_rules=$(iptables -L INPUT 2>/dev/null | wc -l)
        if [[ $iptables_rules -gt 3 ]]; then
            echo "   iptables: Active ($iptables_rules rules)"
            echo "   ⚠️  iptables rules detected - may block network access"
        fi
    fi
    
    # macOS - pfctl
    if command -v pfctl >/dev/null 2>&1; then
        local pf_status=$(pfctl -s info 2>/dev/null | grep "Status" || echo "Status: Unknown")
        echo "   pfctl: $pf_status"
    fi
    
    # Windows - netsh (if running in WSL)
    if [[ -n "$WSL_DISTRO_NAME" ]]; then
        echo "   WSL detected - Windows Firewall may block access"
        echo "   💡 Check Windows Firewall settings for ports 3000, 8080, 8081"
    fi
}

# Function to provide network troubleshooting tips
show_troubleshooting_tips() {
    echo ""
    echo "🔧 Network Troubleshooting Tips:"
    echo ""
    echo "1. 📱 Same Network Check:"
    echo "   • Ensure both devices are on the same WiFi network"
    echo "   • Check WiFi network name on both devices"
    echo "   • Avoid guest networks (they often isolate devices)"
    echo ""
    echo "2. 🔥 Firewall Solutions:"
    echo "   • Temporarily disable firewall to test"
    echo "   • Add firewall rules for ports 3000, 8080, 8081"
    echo "   • Check antivirus software firewall settings"
    echo ""
    echo "3. 🌐 Network Solutions:"
    echo "   • Disable VPN on both devices"
    echo "   • Try connecting from phone's hotspot as test"
    echo "   • Check router's AP isolation settings"
    echo ""
    echo "4. 🖥️  Service Solutions:"
    echo "   • Restart the application: ./stop-app.sh && ./start-app-network.sh"
    echo "   • Check logs: tail -f logs/*.log"
    echo "   • Try localhost first: http://localhost:3000"
    echo ""
    echo "5. 🧪 Manual Testing:"
    echo "   • Test with curl: curl http://YOUR_IP:3000"
    echo "   • Test with ping: ping YOUR_IP"
    echo "   • Check port: telnet YOUR_IP 3000"
}

# Main diagnostic routine
main() {
    LOCAL_IP=$(get_local_ip)
    
    echo ""
    echo "🖥️  Network Information:"
    echo "   Local IP Address: $LOCAL_IP"
    echo "   Hostname: $(hostname 2>/dev/null || echo 'Unknown')"
    
    if [[ "$LOCAL_IP" == "localhost" ]]; then
        echo "   ⚠️  Could not detect local IP address!"
        echo "   💡 Try manually finding your IP with: ifconfig | grep 'inet '"
    fi
    
    echo ""
    echo "📋 Service Status Check:"
    check_port_usage 3000 "Frontend"
    check_port_usage 8080 "API Gateway"
    check_port_usage 8081 "Auth Service"
    
    echo ""
    echo "🌐 Network Connectivity Test:"
    if [[ "$LOCAL_IP" != "localhost" ]]; then
        test_port "$LOCAL_IP" 3000 "Frontend"
        test_port "$LOCAL_IP" 8080 "API Gateway"
        test_port "$LOCAL_IP" 8081 "Auth Service"
    else
        echo "❌ Cannot test network connectivity - IP address not detected"
    fi
    
    test_port "localhost" 3000 "Frontend (localhost)"
    test_port "127.0.0.1" 3000 "Frontend (127.0.0.1)"
    
    check_firewall
    
    echo ""
    echo "📱 URLs for Other Devices:"
    if [[ "$LOCAL_IP" != "localhost" ]]; then
        echo "   Main App: http://$LOCAL_IP:3000"
        echo "   API Gateway: http://$LOCAL_IP:8080"
        echo "   Auth Service: http://$LOCAL_IP:8081"
    else
        echo "   ❌ Cannot provide network URLs - IP address not detected"
    fi
    
    show_troubleshooting_tips
}

# Run the diagnostic
main

echo ""
echo "🎯 Next Steps:"
echo "1. If services are not running: ./start-app-network.sh"
echo "2. If firewall is blocking: Configure firewall rules"
echo "3. If still not working: Try the manual fixes above"
echo "4. For more help: Check logs in logs/ directory"