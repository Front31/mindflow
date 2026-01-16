#!/bin/bash

# MindFlow - Automated Setup Script
# This script will set up and run MindFlow in one command

set -e

echo "🎯 MindFlow - Automated Setup"
echo "=============================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher!"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
elif command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install
else
    echo "Using npm..."
    npm install
fi

echo ""
echo "✅ Dependencies installed!"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Build for production (optional)
echo "🎯 Choose setup type:"
echo "1) Development (npm run dev)"
echo "2) Production build (npm run build)"
echo "3) Exit"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development server..."
        echo "================================"
        echo ""
        echo "📍 Local:    http://localhost:3000"
        echo "📍 Network:  http://$(hostname -I | awk '{print $1}'):3000"
        echo ""
        echo "Press Ctrl+C to stop"
        echo ""
        
        if command -v pnpm &> /dev/null; then
            pnpm dev
        elif command -v yarn &> /dev/null; then
            yarn dev
        else
            npm run dev
        fi
        ;;
    2)
        echo ""
        echo "🔨 Building for production..."
        if command -v pnpm &> /dev/null; then
            pnpm build
            echo ""
            echo "✅ Build complete!"
            echo ""
            echo "🚀 Starting production server..."
            pnpm start
        elif command -v yarn &> /dev/null; then
            yarn build
            echo ""
            echo "✅ Build complete!"
            echo ""
            echo "🚀 Starting production server..."
            yarn start
        else
            npm run build
            echo ""
            echo "✅ Build complete!"
            echo ""
            echo "🚀 Starting production server..."
            npm start
        fi
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
