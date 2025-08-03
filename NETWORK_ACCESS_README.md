# 🌐 Network Access Feature

## Overview
This feature enables others on your local network (same WiFi) to access your AgenticOmics application from their devices. **By default, the application runs in secure localhost-only mode.**

## Quick Start

### 1. Secure Local Access (Default & Recommended)
```bash
./start-app.sh
# or
./start-app-local.sh
```

This starts the application in secure localhost-only mode.

### 2. Network Access (When Needed)
```bash
./start-app-network.sh
```

⚠️ **Security Warning**: This enables network access. Only use on trusted networks!

This will:
- Start all services bound to your local IP address (not 0.0.0.0)
- Display your local IP address and access URLs
- Show URLs that others can use to access your app
- Include security warnings

### 3. External Network Access (For Access Outside Local Network)
```bash
./start-app-external.sh
```

⚠️ **Security Warning**: This enables external access. Use with caution and proper firewall settings!

This will:
- Start all services bound to all interfaces (0.0.0.0)
- Display both local and public IP addresses
- Provide instructions for port forwarding to enable external access
- Launch both backend and frontend services in a single command
- Include security warnings and guidance

### 4. Check Network Status
```bash
python3 setup-external-access.py info
```

This will show:
- Your local IP address
- Which services are running
- Network URLs for sharing

### 5. Share Access URLs
Once running, share these URLs with others on your network:
- **Main Application**: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)
- **API Gateway**: `http://YOUR_IP:8080`

## What's Changed

### Security-First Approach
- **Default Mode**: All services bind to `localhost` for security
- **Network Mode**: Services bind to local IP address (not 0.0.0.0) when explicitly requested
- **Environment Variables**: `SERVER_ADDRESS`, `VITE_HOST`, `VITE_API_TARGET` control binding

### Backend Services
- **API Gateway** (port 8080): Configurable binding via `SERVER_ADDRESS` environment variable
- **Auth Service** (port 8081): Configurable binding via `SERVER_ADDRESS` environment variable
- **CORS Configuration**: Restrictive CORS that only allows specific origins

### Frontend
- **Vite Dev Server**: Configurable host via `VITE_HOST` environment variable
- **Port 3000**: Only accessible from network when explicitly enabled

### New Scripts
- **`start-app-local.sh`**: Explicit localhost-only startup (secure)
- **`start-app-network.sh`**: Network-enabled startup with security warnings
- **Enhanced `setup-external-access.py`**: Network status checking and management

## Requirements
- All devices must be on the same WiFi network
- Firewall should allow ports 3000, 8080, 8081
- No VPN should be active (may interfere with local network access)

## Troubleshooting

### Can't Access from Other Devices?
1. Check if services are running: `python3 setup-external-access.py info`
2. Ensure all devices are on the same WiFi network
3. Try disabling VPN temporarily
4. Check firewall settings (allow ports 3000, 8080, 8081)

### Services Not Starting?
1. Stop any existing services: `./stop-app.sh`
2. Check if ports are in use: `lsof -i :3000 -i :8080 -i :8081`
3. Try the regular startup first: `./start-app.sh`

## Security Notes
- **Default is secure**: Application runs localhost-only by default
- **Network mode is explicit**: Must use `start-app-network.sh` to enable network access
- **Local IP binding**: Services bind to specific local IP, not 0.0.0.0
- **Restrictive CORS**: Only allows specific origins, not wildcard
- **Development only**: This is for development/local use only
- **Trusted networks**: Only use network mode on trusted networks (home WiFi)
- **Production**: For production use, implement proper authentication and HTTPS
- **Remote access**: Consider using SSH tunneling for remote access instead

## Files Modified
- `backend/api-gateway/src/main/resources/application.yml`
- `backend/auth/src/main/resources/application.yml`
- `frontend/web-app/vite.config.ts`
- `setup-external-access.py` (enhanced)
- `EXTERNAL_ACCESS_GUIDE.md` (updated)

## Files Added
- `start-app-local.sh` (explicit localhost-only startup script)
- `start-app-network.sh` (network-enabled startup script with security warnings)
- `backend/api-gateway/src/main/java/com/agenticomics/gateway/config/CorsConfig.java`
- `NETWORK_ACCESS_README.md` (this file)