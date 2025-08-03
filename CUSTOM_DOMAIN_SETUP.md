# 🌍 Custom Domain Setup Guide - agentic.omics

## Overview
This guide will help you set up your AgenticOmics application to use the custom domain `https://agentic.omics` instead of the current OpenHands runtime URLs.

## ✅ What's Already Configured

The application has been updated with the new domain configuration:

- **Main Application**: `https://agentic.omics`
- **API Gateway**: `https://api.agentic.omics`
- **Frontend Port**: 12000
- **API Gateway Port**: 12001

## 🔧 What You Need to Set Up

### 1. Domain Registration
First, you need to own the domain `agentic.omics`:

```bash
# Check if the domain is available (you'll need to do this through a domain registrar)
# Common registrars: Namecheap, GoDaddy, Google Domains, Cloudflare
```

### 2. DNS Configuration
Configure your DNS records to point to your server:

```bash
# A Records
agentic.omics     → YOUR_SERVER_IP
api.agentic.omics → YOUR_SERVER_IP

# Example (replace with your actual server IP):
# agentic.omics     A    34.70.174.52
# api.agentic.omics A    34.70.174.52
```

### 3. SSL Certificates
Obtain SSL certificates for both domains using Let's Encrypt:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d agentic.omics -d api.agentic.omics

# Or obtain certificates separately
sudo certbot --nginx -d agentic.omics
sudo certbot --nginx -d api.agentic.omics
```

### 4. Nginx Configuration
Set up nginx as a reverse proxy:

```bash
# Install nginx
sudo apt install nginx

# Copy the configuration file
sudo cp config/nginx/agentic-omics.conf /etc/nginx/sites-available/agentic-omics

# Enable the site
sudo ln -s /etc/nginx/sites-available/agentic-omics /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Firewall Configuration
Ensure ports 80 and 443 are open:

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80
sudo ufw allow 443

# Check firewall status
sudo ufw status
```

## 🚀 Quick Start

### Step 1: Verify Configuration
```bash
# Run the setup verification script
./setup-custom-domain.sh
```

### Step 2: Start the Application
```bash
# Start with custom domain configuration
./start-app-external-runtime.sh
```

### Step 3: Test the Setup
```bash
# Test external access
./check-external-status.sh
```

## 📋 Configuration Files Updated

The following files have been updated with the new domain configuration:

- ✅ `start-app-external-runtime.sh` - External runtime startup script
- ✅ `frontend/web-app/vite.config.ts` - Frontend Vite configuration
- ✅ `check-external-status.sh` - Status checking script
- ✅ `EXTERNAL_ACCESS_SOLUTION.md` - Solution documentation
- ✅ `EXTERNAL_ACCESS_DIAGNOSIS.md` - Diagnosis documentation
- ✅ `config/nginx/agentic-omics.conf` - Nginx configuration template

## 🔍 Testing Your Setup

### Local Testing
```bash
# Test local access (should work without DNS/SSL)
curl http://localhost:12000
curl http://localhost:12001/actuator/health
```

### DNS Testing
```bash
# Test DNS resolution
nslookup agentic.omics
nslookup api.agentic.omics

# Test with curl (will fail until DNS is configured)
curl -I https://agentic.omics
curl -I https://api.agentic.omics
```

### SSL Testing
```bash
# Test SSL certificate
openssl s_client -connect agentic.omics:443 -servername agentic.omics
openssl s_client -connect api.agentic.omics:443 -servername api.agentic.omics
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. DNS Not Resolving
```bash
# Check if DNS is configured correctly
dig agentic.omics
dig api.agentic.omics

# Check if the domain points to your server IP
nslookup agentic.omics
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates if needed
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

#### 3. Application Not Starting
```bash
# Check if ports are in use
sudo netstat -tlnp | grep :12000
sudo netstat -tlnp | grep :12001

# Check application logs
tail -f logs/frontend.log
tail -f logs/gateway.log
```

#### 4. CORS Issues
```bash
# Check if CORS is configured correctly
curl -H "Origin: https://agentic.omics" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.agentic.omics
```

## 🔒 Security Considerations

### SSL/TLS
- Use strong SSL configuration (already included in nginx config)
- Enable HSTS headers
- Use modern TLS protocols (TLS 1.2+)

### CORS
- Restrict CORS to specific domains
- Don't use wildcard (*) in production
- Configure proper preflight handling

### Firewall
- Only open necessary ports (80, 443)
- Use fail2ban for additional protection
- Regular security updates

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl https://agentic.omics/health
curl https://api.agentic.omics/actuator/health

# SSL certificate expiry
sudo certbot certificates
```

### Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f logs/frontend.log
tail -f logs/gateway.log
```

## 🎯 Final URLs

Once everything is set up, your application will be accessible at:

- **Main Application**: https://agentic.omics
- **API Gateway**: https://api.agentic.omics
- **Health Check**: https://agentic.omics/health
- **API Health**: https://api.agentic.omics/actuator/health

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify DNS and SSL configuration
3. Check application and nginx logs
4. Ensure firewall allows traffic on ports 80 and 443

## 🎉 Success!

Once configured, your AgenticOmics application will be accessible worldwide at `https://agentic.omics` with a professional, branded domain name! 