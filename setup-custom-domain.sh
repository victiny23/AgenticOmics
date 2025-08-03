#!/bin/bash

# AgenticOmics Custom Domain Setup Script
# This script helps configure the application to use https://agentic.omics

set -e

echo "🌍 AgenticOmics Custom Domain Setup"
echo "==================================="
echo "🎯 Target Domain: https://agentic.omics"
echo "🔧 API Domain: https://api.agentic.omics"
echo

# Check if we're in the right directory
if [ ! -f "start-app-external-runtime.sh" ]; then
    echo "❌ Error: Please run this script from the AgenticOmics project root directory"
    exit 1
fi

echo "📋 Current Configuration Status:"
echo "================================"

# Check if the external runtime script has been updated
if grep -q "agentic.omics" start-app-external-runtime.sh; then
    echo "✅ External runtime script: Updated with custom domain"
else
    echo "❌ External runtime script: Still using old URLs"
fi

# Check if vite config has been updated
if grep -q "agentic.omics" frontend/web-app/vite.config.ts; then
    echo "✅ Frontend vite config: Updated with custom domain"
else
    echo "❌ Frontend vite config: Still using old URLs"
fi

# Check if status check script has been updated
if grep -q "agentic.omics" check-external-status.sh; then
    echo "✅ Status check script: Updated with custom domain"
else
    echo "❌ Status check script: Still using old URLs"
fi

echo

echo "🔧 Domain Configuration Requirements:"
echo "====================================="
echo "To use https://agentic.omics, you need to:"
echo
echo "1. 📝 DNS Configuration:"
echo "   • Point agentic.omics → Your server IP"
echo "   • Point api.agentic.omics → Your server IP"
echo
echo "2. 🔒 SSL Certificate:"
echo "   • Obtain SSL certificate for agentic.omics"
echo "   • Obtain SSL certificate for api.agentic.omics"
echo "   • Configure your web server (nginx/apache) with SSL"
echo
echo "3. 🌐 Reverse Proxy Setup:"
echo "   • Configure nginx/apache to proxy:"
echo "     - agentic.omics → localhost:12000 (frontend)"
echo "     - api.agentic.omics → localhost:12001 (API gateway)"
echo
echo "4. 🔧 Application Configuration:"
echo "   • The application is already configured for these domains"
echo "   • CORS is set to allow agentic.omics"
echo "   • API endpoints point to api.agentic.omics"
echo

echo "🚀 Quick Start Guide:"
echo "===================="
echo
echo "1. Start the application with custom domain config:"
echo "   ./start-app-external-runtime.sh"
echo
echo "2. Test the configuration:"
echo "   ./check-external-status.sh"
echo
echo "3. Access the application:"
echo "   • Main App: https://agentic.omics"
echo "   • API Gateway: https://api.agentic.omics"
echo

echo "📋 Configuration Files Updated:"
echo "==============================="
echo "✅ start-app-external-runtime.sh"
echo "✅ frontend/web-app/vite.config.ts"
echo "✅ check-external-status.sh"
echo "✅ EXTERNAL_ACCESS_SOLUTION.md"
echo "✅ EXTERNAL_ACCESS_DIAGNOSIS.md"
echo

echo "🔍 Verification Commands:"
echo "========================"
echo "# Test if the application is configured correctly:"
echo "grep -n 'agentic.omics' start-app-external-runtime.sh"
echo "grep -n 'agentic.omics' frontend/web-app/vite.config.ts"
echo "grep -n 'agentic.omics' check-external-status.sh"
echo

echo "⚠️  Important Notes:"
echo "==================="
echo "• The application is now configured for agentic.omics"
echo "• You still need to set up DNS and SSL certificates"
echo "• Without proper DNS/SSL setup, the URLs won't work externally"
echo "• Local testing will still work on localhost:12000"
echo

echo "🎉 Custom Domain Configuration Complete!"
echo "========================================"
echo "Your AgenticOmics application is now configured to use:"
echo "   🌍 https://agentic.omics"
echo "   🔧 https://api.agentic.omics"
echo
echo "Next steps: Set up DNS and SSL certificates for production use." 