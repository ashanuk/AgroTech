#!/bin/bash
# Build script for production deployment

echo "🚀 Starting AgroTech Forum API build process"

# Show environment info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Ensure required directories exist
echo "📁 Creating required directories..."
mkdir -p uploads

echo "✅ Build completed successfully"
