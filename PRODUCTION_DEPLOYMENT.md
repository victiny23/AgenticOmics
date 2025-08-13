# 🚀 AgenticOmics Production Deployment Guide

## 🔒 Security-First Production Setup

This guide ensures your AgenticOmics platform is deployed securely without exposing user data in the open repository.

## 📋 Prerequisites

### Required Services
- **PostgreSQL Database** (or MySQL)
- **Redis Cache** (optional but recommended)
- **Cloud Storage** (AWS S3, Google Cloud Storage, or Azure Blob Storage)
- **Email Service** (SMTP server)
- **SSL Certificate** (for HTTPS)

### Environment Variables
Create a `.env` file (never commit this to git):

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://your-db-host:5432/agenticomics_auth
DATABASE_USERNAME=agenticomics
DATABASE_PASSWORD=your-secure-password
DATABASE_DRIVER=org.postgresql.Driver

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRATION=86400000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# File Storage (Choose one)
STORAGE_TYPE=s3
S3_BUCKET=agenticomics-user-data
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Or for Google Cloud Storage
# STORAGE_TYPE=gcs
# GCS_BUCKET=agenticomics-user-data
# GCS_PROJECT_ID=your-project-id
# GCS_CREDENTIALS_FILE=/path/to/credentials.json

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Application Configuration
AUTH_PORT=8081
DATA_MANAGEMENT_PORT=8082
API_GATEWAY_PORT=12001
FRONTEND_PORT=12000
```

## 🗄️ Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Create Database**:
```sql
CREATE DATABASE agenticomics_auth;
CREATE DATABASE agenticomics_data;
CREATE USER agenticomics WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE agenticomics_auth TO agenticomics;
GRANT ALL PRIVILEGES ON DATABASE agenticomics_data TO agenticomics;
```

3. **Run Migrations**:
```bash
# The application will create tables automatically on first run
# Or use Flyway/Liquibase for production migrations
```

## ☁️ Cloud Storage Setup

### AWS S3 Setup

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://agenticomics-user-data
aws s3api put-bucket-versioning --bucket agenticomics-user-data --versioning-configuration Status=Enabled
```

2. **Configure CORS**:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedOrigins": ["https://your-domain.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

3. **Create IAM User**:
```bash
aws iam create-user --user-name agenticomics-storage
aws iam attach-user-policy --user-name agenticomics-storage --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

## 🐳 Docker Deployment

### Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: agenticomics_auth
      POSTGRES_USER: agenticomics
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  api-gateway:
    build:
      context: ./backend/api-gateway
      dockerfile: Dockerfile
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://postgres:5432/agenticomics_auth
      - DATABASE_USERNAME=agenticomics
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "12001:8080"
    depends_on:
      - postgres
      - redis

  auth-service:
    build:
      context: ./backend/auth
      dockerfile: Dockerfile
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://postgres:5432/agenticomics_auth
      - DATABASE_USERNAME=agenticomics
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MAIL_HOST=${MAIL_HOST}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - S3_BUCKET=${S3_BUCKET}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "8081:8080"
    depends_on:
      - postgres
      - redis

  data-management:
    build:
      context: ./backend/data-management
      dockerfile: Dockerfile
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://postgres:5432/agenticomics_data
      - DATABASE_USERNAME=agenticomics
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - S3_BUCKET=${S3_BUCKET}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
    ports:
      - "8082:8080"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend/web-app
      dockerfile: Dockerfile
    environment:
      - VITE_API_BASE_URL=https://your-domain.com/api
    ports:
      - "12000:80"
    depends_on:
      - api-gateway

volumes:
  postgres_data:
  redis_data:
```

### Deploy with Docker Compose

```bash
# Load environment variables
source .env

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Nginx Reverse Proxy

Create `/etc/nginx/sites-available/agenticomics`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:12000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:12001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:12001/actuator/health;
        access_log off;
    }
}
```

## 🔐 Security Checklist

### ✅ Pre-Deployment
- [ ] All environment variables set
- [ ] Database created and configured
- [ ] Cloud storage bucket created
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Backup strategy implemented

### ✅ Post-Deployment
- [ ] HTTPS working correctly
- [ ] Database connections successful
- [ ] File uploads working
- [ ] Email sending functional
- [ ] Health checks passing
- [ ] Monitoring configured

### ✅ Ongoing Security
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Log monitoring active
- [ ] SSL certificate renewal automated
- [ ] Access logs reviewed regularly

## 📊 Monitoring & Logging

### Health Checks
```bash
# Check API Gateway
curl https://your-domain.com/api/actuator/health

# Check Auth Service
curl https://your-domain.com/api/auth/actuator/health

# Check Data Management
curl https://your-domain.com/api/data/health
```

### Log Monitoring
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f auth-service

# Monitor database
docker-compose -f docker-compose.prod.yml logs -f postgres

# Check nginx access logs
tail -f /var/log/nginx/access.log
```

## 🔄 Backup Strategy

### Database Backups
```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U agenticomics agenticomics_auth > backup_auth_$DATE.sql
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U agenticomics agenticomics_data > backup_data_$DATE.sql
```

### File Storage Backups
```bash
# AWS S3 backup
aws s3 sync s3://agenticomics-user-data s3://agenticomics-backup/$(date +%Y%m%d)/

# Google Cloud Storage backup
gsutil -m cp -r gs://agenticomics-user-data gs://agenticomics-backup/$(date +%Y%m%d)/
```

## 🚨 Emergency Procedures

### Data Breach Response
1. **Immediate Actions**:
   - Disable affected services
   - Change all passwords and keys
   - Review access logs
   - Notify affected users

2. **Investigation**:
   - Analyze security logs
   - Identify breach source
   - Document incident

3. **Recovery**:
   - Restore from clean backups
   - Update security measures
   - Implement additional monitoring

### Service Recovery
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restore database from backup
docker-compose -f docker-compose.prod.yml exec postgres psql -U agenticomics -d agenticomics_auth < backup.sql

# Verify services
docker-compose -f docker-compose.prod.yml ps
```

## 📞 Support

For production deployment support:
- Review logs in `/var/log/agenticomics/`
- Check health endpoints
- Monitor resource usage
- Contact system administrator

---

**Remember**: Never commit sensitive data to the repository. All user data should be stored in external databases and cloud storage. 