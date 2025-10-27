#!/bin/bash

# Curanova Development Setup Script
# This script helps you get started with local development

echo "🏥 Starting CuraNova Development Environment"
echo "============================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
    echo "✅ Wrangler CLI installed"
fi

# Check if user is logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please login:"
    wrangler login
    echo "✅ Logged in to Cloudflare"
else
    echo "✅ Already logged in to Cloudflare"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting development server with authentication support..."
echo ""
echo "IMPORTANT:"
echo "- The app will be available at http://localhost:8787"
echo "- Google authentication will work properly"
echo "- Database will persist locally"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start wrangler dev with local persistence
wrangler dev --local --persist-to=.wrangler/state
