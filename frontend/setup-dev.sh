#!/bin/bash

# ===========================================
# FIGMA WEB APP - DEVELOPMENT SETUP SCRIPT
# ===========================================
# This script sets up the development environment

set -e

echo "🚀 Setting up Figma Web App development environment..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

# Create development environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local - you can customize it if needed"
else
    echo "ℹ️  .env.local already exists"
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"  
echo "  npm run preview    - Preview production build"
echo ""
echo "🌐 Development server will run at:"
echo "  Local:   http://localhost:5173"
echo "  Network: http://[your-ip]:5173"
echo ""
echo "💡 Make sure the backend is running at http://localhost:5001"
