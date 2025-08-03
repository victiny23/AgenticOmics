# 🌍 External Access Solutions - Complete Guide

## Current Status Summary
✅ **Local Access Working**: `http://localhost:12000` (200 ✅)  
❌ **External Access Not Working**: `https://agentic.omics` (000 ❌)

## 🚀 Immediate Solutions (Tested)

### Option 1: Ngrok (Requires Free Account)
**Status**: ❌ Requires authentication
```bash
# Sign up at: https://ngrok.com/signup
# Get auth token from dashboard
ngrok config add-authtoken YOUR_TOKEN
ngrok http 12000
```

### Option 2: LocalTunnel (No Account Needed)
**Status**: ❌ Connection issues
```bash
npm install -g localtunnel
lt --port 12000
# Result: https://clever-aliens-cheer.loca.lt (but connection refused)
```

### Option 3: Cloudflare Tunnel (No Account Needed)
**Status**: ✅ Running (PID: 95852)
```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:12000
```

### Option 4: Serveo (SSH-based)
**Status**: ⚠️ Not tested yet
```bash
ssh -R 80:localhost:12000 serveo.net
```

## 🔧 Permanent Solution: Custom Domain

To use `https://agentic.omics` permanently:

### Prerequisites
1. **Domain Registration**: Purchase `agentic.omics` (~$10-15/year)
2. **Server Access**: Need access to configure DNS and install nginx
3. **Public IP**: Your server needs a public IP address

### Setup Steps
1. **DNS Configuration**:
   ```
   agentic.omics     A    YOUR_SERVER_IP
   api.agentic.omics A    YOUR_SERVER_IP
   ```

2. **SSL Certificates**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d agentic.omics -d api.agentic.omics
   ```

3. **Nginx Configuration**:
   ```bash
   sudo cp config/nginx/agentic-omics.conf /etc/nginx/sites-available/agentic-omics
   sudo ln -s /etc/nginx/sites-available/agentic-omics /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 📋 Quick Commands Reference

### Start Application
```bash
./start-app-external-runtime.sh
```

### Get External Access (Choose One)
```bash
# Option 1: Ngrok (with account)
ngrok http 12000

# Option 2: LocalTunnel
lt --port 12000

# Option 3: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:12000

# Option 4: Serveo
ssh -R 80:localhost:12000 serveo.net
```

### Test Access
```bash
# Test local access
curl http://localhost:12000

# Test external access (replace with actual URL)
curl https://your-tunnel-url.com

# Check application status
./check-external-status.sh
```

## 🎯 Recommended Approach

### For Immediate Testing
1. **Try Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:12000`
2. **If that fails**: Try Serveo: `ssh -R 80:localhost:12000 serveo.net`
3. **For reliable access**: Sign up for free ngrok account

### For Production
1. **Purchase domain**: `agentic.omics`
2. **Follow custom domain setup**: See `CUSTOM_DOMAIN_SETUP.md`
3. **Configure DNS and SSL**: Use provided nginx configuration

## 🛠️ Troubleshooting

### Application Not Starting
```bash
# Check if ports are in use
lsof -i :12000
lsof -i :12001

# Kill existing processes
./stop-app.sh
```

### Tunnel Issues
```bash
# Check if tunnel is running
ps aux | grep cloudflared
ps aux | grep ngrok
ps aux | grep localtunnel

# Restart tunnel
pkill cloudflared && cloudflared tunnel --url http://localhost:12000
```

### DNS Issues
```bash
# Test DNS resolution
nslookup agentic.omics
dig agentic.omics
```

## 📊 Current Test Results

| Method | Status | URL | Notes |
|--------|--------|-----|-------|
| Local Access | ✅ Working | `http://localhost:12000` | 200 OK |
| Ngrok | ❌ Auth Required | - | Needs free account |
| LocalTunnel | ❌ Connection Failed | `https://clever-aliens-cheer.loca.lt` | 503 Service Unavailable |
| Cloudflare Tunnel | ✅ Running | - | PID: 95852 |
| Custom Domain | ❌ Not Configured | `https://agentic.omics` | 000 No Response |

## 🎉 Next Steps

1. **Immediate**: Try the Cloudflare Tunnel that's currently running
2. **Alternative**: Test Serveo: `ssh -R 80:localhost:12000 serveo.net`
3. **Reliable**: Sign up for ngrok free account
4. **Permanent**: Set up custom domain following `CUSTOM_DOMAIN_SETUP.md`

## 💡 Pro Tips

- **For development**: Use `localhost:12000`
- **For testing**: Use tunneling services
- **For production**: Use custom domain with proper SSL
- **For sharing**: Use ngrok with free account for consistent URLs 