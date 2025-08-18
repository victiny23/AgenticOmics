#!/bin/bash

echo "🚨 REMOVING PASSWORDS FROM GIT HISTORY"
echo "======================================"
echo ""

echo "⚠️  WARNING: This will rewrite Git history!"
echo "Make sure you have a backup of your repository."
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "🔍 Current exposed passwords:"
git grep -i "admin.*password\|password.*admin" || echo "No passwords found"

echo ""
echo "📋 Files that need to be cleaned:"
echo "1. backend/auth/src/main/java/com/agenticomics/auth/DataInitializer.java"
echo "2. add-sample-lab-data.sh"
echo "3. add-sample-team-data.sh"
echo "4. add-second-lab.sh"
echo "5. test-context-change.sh"
echo "6. test-lab-team-context-fixed.sh"
echo "7. scripts/secure-data-setup.sh"
echo "8. docker-compose.yml"
echo "9. .env.example"
echo ""

echo "🔧 Steps to fix:"
echo "1. Remove hardcoded passwords from all files"
echo "2. Use environment variables or secure configuration"
echo "3. Rewrite Git history to remove password traces"
echo "4. Force push to remote repository"
echo ""

echo "💡 Recommended approach:"
echo "- Use environment variables for all passwords"
echo "- Create .env files (already in .gitignore)"
echo "- Use secure configuration files"
echo "- Never commit passwords to Git"
echo ""

echo "⚠️  IMPORTANT: After cleaning, you'll need to:"
echo "- Update all team members to pull the new history"
echo "- Update any CI/CD pipelines"
echo "- Verify no passwords remain in any branches"
echo ""

read -p "Ready to start cleaning? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "🚀 Starting password removal process..."
echo "This may take a while depending on repository size."
echo ""

# Note: This is a template. Actual BFG or git filter-branch commands would go here
echo "To completely remove passwords from Git history, you should:"
echo "1. Use BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/"
echo "2. Or use git filter-branch (more complex)"
echo "3. Force push the cleaned history"
echo ""
echo "For now, let's focus on removing passwords from current files..." 