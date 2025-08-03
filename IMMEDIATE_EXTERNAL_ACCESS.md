# 🌍 Immediate External Access Solutions

## Current Situation
✅ **Local Access Working**: `http://localhost:12000`  
❌ **External Access Not Working**: `https://agentic.omics`

## 🚀 Quick Solutions (Choose One)

### Option 1: Ngrok (Immediate - Recommended)
Get instant external access with a public URL:

```bash
# Start the application first
./start-app-external-runtime.sh

# In another terminal, create public tunnel
./start-ngrok-access.sh
```

**Benefits:**
- ✅ Instant external access
- ✅ HTTPS included
- ✅ No DNS/SSL setup needed
- ✅ Works from anywhere

**Limitations:**
- URL changes each time (unless you have ngrok account)
- Free tier has limitations

### Option 2: LocalTunnel (Alternative)
Another free tunneling service:

```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel
lt --port 12000
```

### Option 3: Cloudflare Tunnel (Professional)
For permanent external access:

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:12000
```

## 🔧 Permanent Solution: Custom Domain Setup

To use `https://agentic.omics` permanently, you need:

### Step 1: Domain Registration
1. Purchase `agentic.omics` from a registrar (Namecheap, GoDaddy, etc.)
2. Cost: ~$10-15/year

### Step 2: DNS Configuration
Point your domain to your server IP:

```
agentic.omics     A    YOUR_SERVER_IP
api.agentic.omics A    YOUR_SERVER_IP
```

### Step 3: SSL Certificates
Get free SSL certificates:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d agentic.omics -d api.agentic.omics
```

### Step 4: Nginx Configuration
Set up reverse proxy using the provided config:

```bash
# Copy nginx config
sudo cp config/nginx/agentic-omics.conf /etc/nginx/sites-available/agentic-omics

# Enable site
sudo ln -s /etc/nginx/sites-available/agentic-omics /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 📋 Step-by-Step Instructions

### For Immediate Access (Ngrok):

1. **Start Application**:
   ```bash
   ./start-app-external-runtime.sh
   ```

2. **Create Public Tunnel**:
   ```bash
   ./start-ngrok-access.sh
   ```

3. **Share the URL**:
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Share with others for immediate access

### For Permanent Access (Custom Domain):

1. **Follow the Custom Domain Setup Guide**:
   ```bash
   ./setup-custom-domain.sh
   ```

2. **Complete DNS and SSL setup** (see `CUSTOM_DOMAIN_SETUP.md`)

3. **Access via**: `https://agentic.omics`

## 🔍 Testing Your Setup

### Test Local Access:
```bash
curl http://localhost:12000
```

### Test External Access (after ngrok):
```bash
# Replace with your actual ngrok URL
curl https://your-ngrok-url.ngrok.io
```

### Test Custom Domain (after setup):
```bash
curl https://agentic.omics
```

## 🛠️ Troubleshooting

### Application Not Starting:
```bash
# Check if ports are in use
lsof -i :12000
lsof -i :12001

# Kill existing processes
./stop-app.sh
```

### Ngrok Issues:
```bash
# Check ngrok status
ngrok config check

# Authenticate ngrok (optional but recommended)
ngrok config add-authtoken YOUR_TOKEN
```

### DNS Issues:
```bash
# Test DNS resolution
nslookup agentic.omics
dig agentic.omics
```

## 📞 Quick Commands Reference

```bash
# Start application
./start-app-external-runtime.sh

# Get immediate external access
./start-ngrok-access.sh

# Stop application
./stop-app.sh

# Check status
./check-external-status.sh

# Setup custom domain
./setup-custom-domain.sh
```

## 🎯 Recommended Approach

1. **For immediate testing**: Use ngrok (`./start-ngrok-access.sh`)
2. **For production**: Set up custom domain following `CUSTOM_DOMAIN_SETUP.md`
3. **For development**: Use localhost:12000

## 🎉 Success!

Once configured, you'll have:
- **Immediate access**: Via ngrok URL
- **Permanent access**: Via `https://agentic.omics`
- **Professional domain**: Branded URL for your application 