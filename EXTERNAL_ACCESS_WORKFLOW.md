# 🌐 External Access Workflow After App Restart

## 📋 **Complete Process (After calling `./start-app-external-runtime.sh`)**

### **Option 1: Simple & Automated (Recommended)**
```bash
# Get current ngrok URL and update status check
./get-ngrok-url.sh
```

### **Option 2: Manual Steps**

#### **Step 1: Check ngrok status**
```bash
ps aux | grep ngrok | grep -v grep
```

#### **Step 2: Get new ngrok URL**
```bash
curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'])"
```

#### **Step 3: Vite configuration (Automatic)**
```bash
# ✅ Already configured to accept ALL ngrok URLs automatically
# No manual updates needed!
```

#### **Step 4: Update status script**
```bash
# Update check-external-status.sh with the new URL
```

#### **Step 5: Test access**
```bash
./check-external-status.sh
```

## 🔄 **Why This Happens**

1. **App Restart**: When you run `./start-app-external-runtime.sh`, it restarts all services
2. **Ngrok Session**: Ngrok creates a new tunnel session with a new URL
3. **Vite Configuration**: ✅ **Automatically accepts all ngrok URLs** (no manual updates needed!)
4. **Status Scripts**: Need to be updated to test the correct URL

## 🛠️ **Quick Commands**

### **Get Current ngrok URL**
```bash
curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print('🌐 URL:', data['tunnels'][0]['public_url'])"
```

### **Test External Access**
```bash
./check-external-status.sh
```

### **View ngrok Dashboard**
```bash
open http://127.0.0.1:4040
```

## 📊 **Current Status**

- ✅ **Ngrok**: Running
- ✅ **App**: Running on localhost:12000
- ✅ **External URL**: https://b664249479a7.ngrok-free.app
- ✅ **Status**: Working (Frontend: 200, API: 200)

## 💡 **Pro Tips**

1. **Keep ngrok running**: Don't restart ngrok unless necessary
2. **Use the simple script**: `./get-ngrok-url.sh` gets the URL and updates status check
3. **Vite is automatic**: No need to update configuration files manually
4. **Bookmark the ngrok dashboard**: http://127.0.0.1:4040
5. **Test regularly**: Use `./check-external-status.sh` to verify access

## 🚨 **Troubleshooting**

### **If ngrok is not running**
```bash
ngrok http 12000
```

### **If app is not accessible**
```bash
./start-app-external-runtime.sh
```

### **If Vite blocks requests**
```bash
# Check allowedHosts in frontend/web-app/vite.config.ts
# Add the current ngrok hostname
```

## 📱 **Share Your App**

**Current External URL**: `https://b664249479a7.ngrok-free.app`

Anyone with this URL can access your AgenticOmics application from anywhere on the internet! 🌍 