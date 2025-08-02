#!/usr/bin/env python3
"""
AgenticOmics External Access Setup
Provides network access configuration and utilities for the AgenticOmics platform
"""

import http.server
import socketserver
import socket
import threading
import time
import os
import sys
import subprocess
import json

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "localhost"

def start_server(port=8080, directory=None):
    """Start HTTP server on specified port"""
    if directory:
        os.chdir(directory)
    
    handler = http.server.SimpleHTTPRequestHandler
    
    # Enable CORS for cross-origin requests
    class CORSRequestHandler(handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            super().end_headers()
    
    with socketserver.TCPServer(("0.0.0.0", port), CORSRequestHandler) as httpd:
        local_ip = get_local_ip()
        
        print("=" * 60)
        print("🧬 AgenticOmics UI Server Started!")
        print("=" * 60)
        print(f"📍 Local Access:    http://localhost:{port}")
        print(f"🌐 Network Access:  http://{local_ip}:{port}")
        print("=" * 60)
        print("📱 Access from your laptop:")
        print(f"   1. Direct: http://{local_ip}:{port}")
        print(f"   2. SSH Tunnel: ssh -L {port}:localhost:{port} user@server")
        print(f"      Then open: http://localhost:{port}")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

def check_services_running():
    """Check if AgenticOmics services are running"""
    services = {
        'Frontend': 3000,
        'API Gateway': 8080,
        'Auth Service': 8081
    }
    
    running_services = {}
    for service, port in services.items():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            running_services[service] = result == 0
        except:
            running_services[service] = False
    
    return running_services

def display_network_info():
    """Display network access information"""
    local_ip = get_local_ip()
    services = check_services_running()
    
    print("=" * 70)
    print("🧬 AgenticOmics Network Access Information")
    print("=" * 70)
    print(f"🖥️  Local IP Address: {local_ip}")
    print()
    
    print("📋 Service Status:")
    for service, is_running in services.items():
        status = "✅ Running" if is_running else "❌ Not Running"
        print(f"   {service}: {status}")
    
    if any(services.values()):
        print()
        print("🌐 Network Access URLs (share with others on your network):")
        if services.get('Frontend'):
            print(f"   📱 Main Application: http://{local_ip}:3000")
        if services.get('API Gateway'):
            print(f"   🔧 API Gateway:      http://{local_ip}:8080")
        if services.get('Auth Service'):
            print(f"   🔐 Auth Service:     http://{local_ip}:8081")
        
        print()
        print("📱 Device-Specific Instructions:")
        print("   • Mobile/Tablet: Open browser and go to the Main Application URL")
        print("   • Other Laptops: Use any browser to access the Main Application URL")
        print("   • Same WiFi Network: All devices must be on the same network")
        
    else:
        print()
        print("⚠️  No services are currently running!")
        print("   Start the application first using:")
        print("   ./start-app-network.sh")
    
    print()
    print("🔧 Troubleshooting:")
    print("   • Ensure all devices are on the same WiFi network")
    print("   • Check firewall settings if connection fails")
    print("   • Try disabling VPN if you have one active")
    print("=" * 70)

def start_full_application():
    """Start the full AgenticOmics application with network access"""
    script_path = "./start-app-network.sh"
    
    if not os.path.exists(script_path):
        print("❌ Network startup script not found!")
        print("   Please ensure you're in the AgenticOmics project directory")
        return False
    
    print("🚀 Starting AgenticOmics with network access...")
    print("   This will start all services (frontend + backend)")
    print("   Press Ctrl+C to stop all services when done")
    print()
    
    try:
        subprocess.run([script_path], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start application: {e}")
        return False
    except KeyboardInterrupt:
        print("\n🛑 Application startup cancelled")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "info":
            display_network_info()
        elif command == "start":
            start_full_application()
        elif command == "static":
            # Legacy static file serving mode
            dist_dir = "/workspace/AgenticOmics/frontend/web-app/dist"
            port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
            
            if os.path.exists(dist_dir):
                print(f"📁 Serving static files from: {dist_dir}")
                start_server(port, dist_dir)
            else:
                print(f"❌ Directory not found: {dist_dir}")
                print("Please build the React app first: npm run build")
        else:
            print("Usage:")
            print("  python3 setup-external-access.py info   - Show network access information")
            print("  python3 setup-external-access.py start  - Start full application with network access")
            print("  python3 setup-external-access.py static [port] - Serve static files only")
    else:
        # Default behavior: show info
        display_network_info()