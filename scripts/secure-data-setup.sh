#!/bin/bash

# AgenticOmics Secure Data Setup Script
# This script ensures no user data is committed to the repository

echo "🔒 Setting up secure data management for AgenticOmics..."
echo "=================================================="

# Create necessary directories with .gitkeep files
echo "📁 Creating secure data directories..."

# Auth service data directories
mkdir -p backend/auth/data/uploads/profile-photos
mkdir -p backend/auth/data/uploads/temp

# Data management service data directories
mkdir -p backend/data-management/data/uploads/omics-data
mkdir -p backend/data-management/data/uploads/temp

# Root data directories
mkdir -p data/uploads
mkdir -p data/processed
mkdir -p data/pipelines/executions
mkdir -p data/models/trained-models
mkdir -p data/exports

# Add .gitkeep files to preserve directory structure
echo "📝 Adding .gitkeep files to preserve directory structure..."
touch backend/auth/data/uploads/profile-photos/.gitkeep
touch backend/auth/data/uploads/temp/.gitkeep
touch backend/data-management/data/uploads/omics-data/.gitkeep
touch backend/data-management/data/uploads/temp/.gitkeep
touch data/uploads/.gitkeep
touch data/processed/.gitkeep
touch data/pipelines/executions/.gitkeep
touch data/models/trained-models/.gitkeep
touch data/exports/.gitkeep

# Remove any existing database files and user data
echo "🧹 Removing existing user data and database files..."
rm -f backend/auth/data/*.mv.db
rm -f backend/auth/data/*.trace.db
rm -f backend/data-management/data/*.mv.db
rm -f backend/data-management/data/*.trace.db

# Remove user uploads (but keep .gitkeep files)
echo "🗑️  Removing user uploads..."
find backend/auth/data/uploads/profile-photos -type f ! -name '.gitkeep' -delete
find backend/data-management/data/uploads/omics-data -type f ! -name '.gitkeep' -delete
find data/uploads -type f ! -name '.gitkeep' -delete

<<<<<<< HEAD
# Create sample data for development (without passwords)
=======
# Create sample data for development
>>>>>>> develop
echo "📋 Creating sample data for development..."
cat > backend/auth/data/sample-users.json << 'EOF'
{
  "sample_users": [
    {
      "username": "admin",
<<<<<<< HEAD
      "email": "admin@agenticomics.com",
      "role": "Super Admin",
      "description": "Sample administrator account - use environment variables for password"
    },
    {
      "username": "demo",
      "email": "demo@agenticomics.com",
      "role": "PhD student",
      "description": "Sample demo account - use environment variables for password"
    }
  ],
  "note": "These are sample accounts for development only. Passwords should be set via environment variables (ADMIN_PASSWORD, DEMO_PASSWORD). Real user data should never be committed to the repository."
=======
      "password": "admin123",
      "email": "admin@agenticomics.com",
      "role": "Lab PI",
      "description": "Sample administrator account"
    },
    {
      "username": "demo",
      "password": "demo123", 
      "email": "demo@agenticomics.com",
      "role": "PhD student",
      "description": "Sample demo account"
    }
  ],
  "note": "These are sample accounts for development only. Real user data should never be committed to the repository."
>>>>>>> develop
}
EOF

# Create security documentation
echo "📚 Creating security documentation..."
cat > SECURITY_GUIDE.md << 'EOF'
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
EOF

echo "✅ Secure data setup completed!"
echo ""
echo "🔒 Security measures implemented:"
echo "   • All user data directories are gitignored"
echo "   • Database files are excluded from repository"
echo "   • Sample data will be created on first run"
echo "   • Security documentation created"
echo ""
echo "📋 Next steps:"
echo "   1. Commit the updated .gitignore and security files"
echo "   2. Remove any existing user data from git history if needed"
echo "   3. Test the application with sample data"
echo ""
echo "⚠️  IMPORTANT: Review SECURITY_GUIDE.md for complete security guidelines" 