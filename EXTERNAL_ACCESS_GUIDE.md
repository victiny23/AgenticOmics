# 🌐 AgenticOmics External Access Guide

## 🎯 Quick Access Methods

### Method 1: SSH Port Forwarding (Recommended)
```bash
# From your laptop terminal:
ssh -L 8080:localhost:8080 username@your-server-ip

# Then open in your laptop browser:
http://localhost:8080
```

### Method 2: Direct Network Access
```bash
# If on same network, try:
http://10.2.67.139:8080
```

### Method 3: Using the Setup Script
```bash
# On the server:
cd /workspace/AgenticOmics
python3 setup-external-access.py

# Follow the displayed instructions
```

## 🔧 Troubleshooting

### If Direct IP Access Doesn't Work:
1. **Firewall Issues**: Server firewall may block port 8080
2. **Network Restrictions**: Corporate/university networks often block direct access
3. **NAT/Router**: Home routers typically block incoming connections

### Solutions:
1. **Use SSH Tunneling** (most reliable)
2. **Ask your IT admin** to open port 8080
3. **Use a VPN** if on different networks
4. **Set up reverse proxy** (nginx, Apache)

## 🚀 Production Deployment Options

### For Permanent External Access:

1. **Cloud Deployment** (AWS, GCP, Azure)
2. **Docker with Port Mapping**
3. **Reverse Proxy Setup** (nginx + SSL)
4. **Domain + SSL Certificate**

## 📱 Mobile Access
The UI is responsive and works on mobile devices once accessible via any of the above methods.

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