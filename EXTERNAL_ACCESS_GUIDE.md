# 🌐 AgenticOmics External Access Guide

## 🎯 Quick Start for Local Network Access

### Method 1: Network-Enabled Startup (Recommended for Local Network)
```bash
# Start the full application with network access enabled:
./start-app-network.sh

# This will display network URLs that others can use to access your app
```

### Method 2: Check Network Status
```bash
# Check if services are running and get network URLs:
python3 setup-external-access.py info

# Or start the application with network access:
python3 setup-external-access.py start
```

### Method 3: SSH Port Forwarding (For Remote Access)
```bash
# From your laptop terminal:
ssh -L 3000:localhost:3000 username@your-server-ip

# Then open in your laptop browser:
http://localhost:3000
```

## 🔧 Troubleshooting

### If Direct IP Access Doesn't Work:
1. **Firewall Issues**: Server firewall may block ports 3000, 8080, 8081
2. **Network Restrictions**: Corporate/university networks often block direct access
3. **NAT/Router**: Home routers typically block incoming connections
4. **Different Networks**: Devices must be on the same WiFi/network

### Solutions:
1. **Check Network Status**: Run `python3 setup-external-access.py info`
2. **Use SSH Tunneling** (most reliable for remote access)
3. **Disable VPN** temporarily if you have one active
4. **Check Firewall**: Allow ports 3000, 8080, 8081 through firewall
5. **Same Network**: Ensure all devices are on the same WiFi network

## 🚀 Production Deployment Options

### For Permanent External Access:

1. **Cloud Deployment** (AWS, GCP, Azure)
2. **Docker with Port Mapping**
3. **Reverse Proxy Setup** (nginx + SSL)
4. **Domain + SSL Certificate**

## 📱 Mobile Access
The UI is responsive and works on mobile devices. Once you start the application with network access:
1. Get your network IP using `python3 setup-external-access.py info`
2. Share the Main Application URL (e.g., `http://192.168.1.100:3000`) with others
3. Others can open this URL in their mobile browser or laptop

## 🔒 Security Notes
- Current setup is for development only
- For production, add authentication
- Use HTTPS with SSL certificates
- Implement proper firewall rules

## 🆘 Need Help?
If none of these methods work, please provide:
1. Your network setup (home/office/university)
2. Operating system of your laptop
3. Any error messages you see
4. Whether you can SSH to the server