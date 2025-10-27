#!/bin/bash

# Curanova Authentication Troubleshooting Script
# This script helps diagnose and fix common authentication issues

echo "🏥 CuraNova Authentication Troubleshooter"
echo "========================================"
echo ""

# Check if wrangler is installed
echo "🔧 Checking Wrangler CLI installation..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
    echo "✅ Wrangler CLI installed"
else
    echo "✅ Wrangler CLI is installed"
fi

echo ""

# Check Cloudflare authentication
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    echo "Then re-run this script"
    exit 1
else
    echo "✅ Logged in to Cloudflare as: $(wrangler whoami)"
fi

echo ""

# Check if required secrets are available
echo "🔑 Checking required secrets..."
echo "Ensure the following secrets are configured for your Worker:"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET"
echo "- GOOGLE_REDIRECT_URI"
echo "- GEMINI_API_KEY (optional, for AI features)"

echo ""

# Check if project dependencies are installed
echo "📦 Checking project dependencies..."
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Installing..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies are installed"
fi

echo ""

# Check if D1 database exists locally
echo "🗄️ Checking local database..."
if [ ! -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite" ] 2>/dev/null; then
    echo "ℹ️ Local database will be created automatically on first run"
else
    echo "✅ Local database exists"
fi

echo ""

# Provide final instructions
echo "🚀 Ready to start development server!"
echo ""
echo "IMPORTANT INSTRUCTIONS:"
echo "1. Use this command to start the dev server:"
echo "   wrangler dev --local --persist-to=.wrangler/state"
echo ""
echo "2. Access the app at: http://localhost:8787"
echo "   (NOT http://localhost:5173)"
echo ""
echo "3. Google authentication will work properly with wrangler dev"
echo ""
echo "4. If you see authentication errors, make sure you're using"
echo "   localhost:8787 and not localhost:5173"
echo ""
echo "5. The app will automatically handle OAuth callbacks and"
echo "   session management when using wrangler dev"
echo ""

read -p "Press Enter to start the development server now, or Ctrl+C to exit..."

echo ""
echo "🚀 Starting CuraNova with proper authentication support..."
echo ""

# Start the development server
wrangler dev --local --persist-to=.wrangler/state
