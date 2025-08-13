# 🔒 AgenticOmics Security Guide

## Data Protection

### ✅ What's Protected
- User profile photos
- Uploaded data files
- Database files with user information
- Personal user data (emails, phone numbers, etc.)

### 🚫 What's NOT Committed to Repository
- Real user data
- Database files (*.mv.db, *.trace.db)
- User uploads (profile photos, data files)
- Sensitive configuration files

### 📁 Directory Structure
```
backend/auth/data/           # User data (gitignored)
├── uploads/
│   ├── profile-photos/      # User profile photos
│   └── temp/               # Temporary files
└── *.mv.db                 # Database files

backend/data-management/data/  # Data files (gitignored)
├── uploads/
│   ├── omics-data/         # User uploaded data
│   └── temp/               # Temporary files
└── *.mv.db                 # Database files

data/                       # Root data directory (gitignored)
├── uploads/                # General uploads
├── processed/              # Processed data
├── pipelines/              # Pipeline data
├── models/                 # ML models
└── exports/                # Exported results
```

## Development Setup

### Initial Setup
```bash
./scripts/secure-data-setup.sh
```

### Sample Data
The application automatically creates sample users on first run:
- **admin/admin123** - Administrator account
- **demo/demo123** - Demo user account

### Production Deployment
1. Never commit real user data
2. Use external databases (PostgreSQL, MySQL)
3. Store files in cloud storage (AWS S3, Google Cloud Storage)
4. Use environment variables for sensitive configuration

## Security Best Practices

1. **Never commit user data** - All user data is gitignored
2. **Use sample data for development** - Real data should be added manually
3. **Secure configuration** - Use environment variables for secrets
4. **Regular security audits** - Check for accidental data commits
5. **Data encryption** - Encrypt sensitive data at rest and in transit

## Emergency Data Removal

If user data is accidentally committed:

```bash
# Remove from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/auth/data/*.mv.db' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remove from remote
git push origin --force --all
```

## Monitoring

- Check `.gitignore` before commits
- Use `git status` to verify no user data is staged
- Regular security scans of the repository
- Monitor for accidental data exposure
