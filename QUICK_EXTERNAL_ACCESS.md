# 🚀 Quick External Access Solutions

## Current Status
✅ **Local Access Working**: `http://localhost:12000`  
❌ **External Access Not Working**: `https://agentic.omics`

## 🎯 Immediate Solutions

### Option 1: LocalTunnel (Recommended - No Account Needed)

```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel (in a new terminal)
lt --port 12000
```

**Result**: You'll get a URL like `https://abc123.loca.lt`

### Option 2: Ngrok (Requires Free Account)

1. Sign up at https://ngrok.com/signup
2. Get your auth token
3. Run:
```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 12000
```

### Option 3: Serveo (SSH-based)

```bash
ssh -R 80:localhost:12000 serveo.net
```

## 🔧 For Permanent Custom Domain

To use `https://agentic.omics` permanently:

1. **Buy the domain**: `agentic.omics` (~$10-15/year)
2. **Set up DNS**: Point to your server IP
3. **Install SSL**: Use Let's Encrypt
4. **Configure nginx**: Use the provided config

See `CUSTOM_DOMAIN_SETUP.md` for detailed instructions.

## 📋 Quick Commands

```bash
# Start application
./start-app-external-runtime.sh

# Get external access (choose one):
lt --port 12000                    # LocalTunnel
ngrok http 12000                   # Ngrok (with account)
ssh -R 80:localhost:12000 serveo.net  # Serveo

# Stop application
./stop-app.sh
```

## 🎉 Success!

Once you run one of the tunneling commands, you'll get:
- **Public URL**: Accessible from anywhere
- **HTTPS**: Secure connection
- **Shareable**: Send to others immediately

## 💡 Recommendation

For immediate testing: Use **LocalTunnel** (`lt --port 12000`)
For production: Set up custom domain following `CUSTOM_DOMAIN_SETUP.md` 