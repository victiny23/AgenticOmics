# 🌐 Network Access Feature

## Overview
This feature enables others on your local network (same WiFi) to access your AgenticOmics application from their devices.

## Quick Start

### 1. Start with Network Access
```bash
./start-app-network.sh
```

This will:
- Start all services (frontend + backend) with network access enabled
- Display your local IP address and access URLs
- Show URLs that others can use to access your app

### 2. Check Network Status
```bash
python3 setup-external-access.py info
```

This will show:
- Your local IP address
- Which services are running
- Network URLs for sharing

### 3. Share Access URLs
Once running, share these URLs with others on your network:
- **Main Application**: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)
- **API Gateway**: `http://YOUR_IP:8080`

## What's Changed

### Backend Services
- **API Gateway** (port 8080): Now binds to `0.0.0.0` instead of `localhost`
- **Auth Service** (port 8081): Now binds to `0.0.0.0` instead of `localhost`
- **CORS Configuration**: Added to allow cross-origin requests

### Frontend
- **Vite Dev Server**: Now binds to `0.0.0.0` with CORS enabled
- **Port 3000**: Accessible from other devices on the network

### New Scripts
- **`start-app-network.sh`**: Enhanced startup script with network access
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
- This is for development/local use only
- Services are accessible to anyone on your network
- For production use, implement proper authentication and HTTPS
- Consider using SSH tunneling for remote access instead

## Files Modified
- `backend/api-gateway/src/main/resources/application.yml`
- `backend/auth/src/main/resources/application.yml`
- `frontend/web-app/vite.config.ts`
- `setup-external-access.py` (enhanced)
- `EXTERNAL_ACCESS_GUIDE.md` (updated)

## Files Added
- `start-app-network.sh` (new network-enabled startup script)
- `backend/api-gateway/src/main/java/com/agenticomics/gateway/config/CorsConfig.java`
- `NETWORK_ACCESS_README.md` (this file)