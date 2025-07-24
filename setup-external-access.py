#!/usr/bin/env python3
"""
AgenticOmics External Access Setup
Creates a simple HTTP server accessible from external networks
"""

import http.server
import socketserver
import socket
import threading
import time
import os
import sys

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

if __name__ == "__main__":
    # Default to serving the built React app
    dist_dir = "/workspace/AgenticOmics/frontend/web-app/dist"
    
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8080
    
    if os.path.exists(dist_dir):
        print(f"📁 Serving from: {dist_dir}")
        start_server(port, dist_dir)
    else:
        print(f"❌ Directory not found: {dist_dir}")
        print("Please build the React app first: npm run build")