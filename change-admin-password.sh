#!/bin/bash

echo "🔒 Admin Password Change Script"
echo "================================"
echo ""

# Check if services are running
echo "Checking if Auth Service is running..."
if ! curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
    echo "❌ Auth Service is not running on port 8081"
    echo "Please start your services first with: ./start-app.sh"
    exit 1
fi

echo "✅ Auth Service is running"
echo ""

echo "🚨 SECURITY WARNING:"
echo "The current admin password 'admin' is too weak and has been detected by your browser."
echo "You MUST change it to a secure password."
echo ""

echo "📋 Instructions to change admin password:"
echo "1. Open your browser and go to: http://localhost:8081/h2-console"
echo "2. Connect with these settings:"
echo "   - JDBC URL: jdbc:h2:file:./auth-db"
echo "   - Username: sa"
echo "   - Password: (leave empty)"
echo "3. Run this SQL command (replace 'YourNewPassword123!' with your desired password):"
echo ""
echo "UPDATE USERS SET PASSWORD = '\$2a\$10\$YOUR_NEW_BCRYPT_HASH_HERE' WHERE USERNAME = 'admin';"
echo ""

echo "🔧 Alternative: Use the provided SQL file"
echo "1. Edit the file 'change-admin-password.sql'"
echo "2. Replace the password hash with your desired password"
echo "3. Run it in H2 Console"
echo ""

echo "💡 Password Requirements:"
echo "- At least 12 characters long"
echo "- Mix of uppercase, lowercase, numbers, and symbols"
echo "- Avoid common words or patterns"
echo "- Don't reuse passwords from other accounts"
echo ""

echo "🔗 BCrypt Hash Generator:"
echo "You can generate a BCrypt hash online at:"
echo "https://bcrypt.online/"
echo ""

echo "⚠️  IMPORTANT: After changing the password, restart your services to ensure the change takes effect."
echo ""

read -p "Press Enter when you've changed the password..."
echo "✅ Password change process completed!" 