# 🔒 Security Setup Guide

## Protecting User Information

This guide explains how to secure your AgenticOmics installation and protect user data.

## 🚨 Important Security Notes

### 1. Default Admin Account
- **Username**: `admin`
- **Password**: `admin` (CHANGE THIS IMMEDIATELY!)
- **Role**: `Super Admin`

### 2. Change Default Credentials

#### Option A: Using H2 Console (Recommended for Development)
1. Start your services
2. Access H2 Console: `http://localhost:8081/h2-console`
3. Connect with:
   - JDBC URL: `jdbc:h2:file:./auth-db`
   - Username: `sa`
   - Password: (leave empty)
4. Run this SQL to change admin password:
   ```sql
   UPDATE USERS 
   SET PASSWORD = '$2a$10$YOUR_NEW_BCRYPT_HASH_HERE' 
   WHERE USERNAME = 'admin';
   ```

#### Option B: Using Secure Properties File
1. Copy `backend/auth/src/main/resources/application-secure.properties.template` to `backend/auth/src/main/resources/application-secure.properties`
2. Update the values with your secure credentials
3. Restart the auth service

### 3. Environment Variables (Production)
For production deployments, use environment variables:

```bash
export ADMIN_USERNAME=your-secure-admin-username
export ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password
export ADMIN_EMAIL=your-admin-email@domain.com
export JWT_SECRET=your-super-secret-jwt-key
```

### 4. Database Security
- **Development**: H2 database files are automatically ignored by git
- **Production**: Use a proper database (PostgreSQL, MySQL) with strong passwords
- **Backups**: Encrypt database backups
- **Access**: Limit database access to authorized personnel only

### 5. File Upload Security
- Uploaded files are stored in `./uploads/` directory
- This directory is automatically ignored by git
- Set proper file permissions: `chmod 750 uploads/`
- Implement virus scanning for uploaded files in production

### 6. Network Security
- Use HTTPS in production
- Configure firewall rules
- Use reverse proxy (nginx) for additional security
- Implement rate limiting

### 7. User Data Protection
- All user data is stored locally by default
- Implement data retention policies
- Provide user data export/deletion capabilities
- Comply with GDPR/privacy regulations

## 🔧 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Configure HTTPS (production)
- [ ] Set up proper file permissions
- [ ] Implement backup strategy
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] User data encryption (if required)
- [ ] Access control audit

## 🚨 Emergency Procedures

If you suspect a security breach:
1. Immediately change all admin passwords
2. Review access logs
3. Check for unauthorized file uploads
4. Audit user accounts
5. Consider database reset if necessary

## 📞 Security Contact

For security issues, please contact the development team immediately.

---

**Remember**: Security is an ongoing process. Regularly review and update your security measures! 