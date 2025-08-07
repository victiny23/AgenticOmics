# H2 Database Setup for AgenticOmics

## Overview

The AgenticOmics platform now uses an **H2 embedded database** for user management. This database is packaged with the application and requires no external database installation.

## Database Features

### ✅ **Embedded Database**
- **H2 Database**: Lightweight, embedded Java database
- **File-based storage**: Data persists between application restarts
- **No external dependencies**: Runs entirely within the application
- **Automatic setup**: Database and tables created automatically

### ✅ **User Management**
- **User registration**: Username, password, email
- **Secure authentication**: BCrypt password hashing
- **JWT token generation**: For stateless authentication
- **User tracking**: Creation date, last login, active status

### ✅ **Database Schema**

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

## Database Files

The database files are stored in:
```
./backend/auth/data/
├── auth-db.mv.db      # Main database file
└── auth-db.trace.db   # Trace log file
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/users/count` - Get user count

### Database Management Endpoints
- `GET /api/db/status` - Database status
- `GET /api/db/users` - List all users
- `GET /api/db/users/{id}` - Get user by ID
- `GET /api/db/users/username/{username}` - Get user by username

## H2 Console Access

Access the H2 web console at: **http://localhost:8081/h2-console**

**Connection Details:**
- JDBC URL: `jdbc:h2:file:./data/auth-db`
- Username: `sa`
- Password: `password`

## Sample Users

The application automatically creates sample users on first startup:
- **admin/admin123** - Administrator account
- **demo/demo123** - Demo user account

## Testing the Database

### 1. Register a new user
```bash
curl -X POST http://localhost:12001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","email":"test@example.com"}'
```

### 2. Login with the user
```bash
curl -X POST http://localhost:12001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 3. Check database status
```bash
curl http://localhost:8081/api/db/status
```

## Configuration

### Database Configuration (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/auth-db
    username: sa
    password: password
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

## Security Features

### ✅ **Password Security**
- **BCrypt hashing**: All passwords are hashed using BCrypt
- **Salt generation**: Automatic salt generation for each password
- **Secure comparison**: Timing-safe password comparison

### ✅ **JWT Authentication**
- **Token-based**: Stateless authentication using JWT
- **Secure headers**: User information passed via secure headers
- **Gateway integration**: Centralized authentication in API Gateway

## Data Persistence

### ✅ **File-based Storage**
- **Persistent data**: User data survives application restarts
- **Automatic backups**: H2 handles data integrity
- **Portable**: Database files can be moved with the application

### ✅ **Automatic Schema Management**
- **DDL auto-update**: Schema automatically updated on startup
- **Migration support**: Future schema changes handled automatically
- **Data preservation**: Existing data preserved during updates

## Monitoring and Maintenance

### ✅ **Database Monitoring**
- **Health checks**: Database status endpoint
- **User statistics**: Active user count
- **Logging**: SQL queries logged for debugging

### ✅ **Backup and Recovery**
- **File backup**: Simply copy the `auth-db.mv.db` file
- **Data export**: Use H2 console for data export
- **Recovery**: Replace database file to restore from backup

## Troubleshooting

### Common Issues

1. **Database not starting**
   - Check file permissions on `./backend/auth/data/`
   - Ensure port 8081 is available

2. **H2 Console not accessible**
   - Verify H2 console is enabled in configuration
   - Check if auth service is running on port 8081

3. **User registration fails**
   - Check if username/email already exists
   - Verify API Gateway is running on port 12001

### Logs Location
- **Auth Service**: `logs/auth.log`
- **API Gateway**: `logs/gateway.log`
- **Database**: `backend/auth/data/auth-db.trace.db`

## Future Enhancements

### Potential Improvements
- **Database encryption**: Encrypt database files
- **Connection pooling**: Optimize database connections
- **Data migration**: Tools for schema evolution
- **Backup automation**: Automated backup scheduling
- **Performance monitoring**: Database performance metrics

---

## Quick Start

1. **Start the application**:
   ```bash
   ./start-app-external-runtime.sh
   ```

2. **Access the application**:
   - Frontend: http://localhost:12000
   - API Gateway: http://localhost:12001
   - H2 Console: http://localhost:8081/h2-console

3. **Test registration**:
   - Use the login page in the frontend
   - Or use the API endpoints directly

4. **Monitor database**:
   - Check user count: `curl http://localhost:8081/api/db/status`
   - View users in H2 console
   - Check logs: `tail -f logs/auth.log` 