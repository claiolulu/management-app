#!/bin/bash

# ===========================================
# FIGMA WEB APP - BACKEND DEVELOPMENT SETUP SCRIPT
# ===========================================
# This script sets up the backend development environment

set -e

echo "🚀 Setting up Figma Web App backend development environment..."
echo ""

# Check if we're in the correct directory
if [ ! -f "pom.xml" ] || [ ! -f "mvnw" ]; then
    echo "❌ Error: Run this script from the backend directory"
    exit 1
fi

# Make Maven wrapper executable
chmod +x mvnw

# Create development environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from development template..."
    cp .env.development .env
    echo "✅ Created .env - please customize with your settings:"
    echo "   - Set DB_PASSWORD to your MySQL root password"
    echo "   - Update JWT_SECRET with a secure key"
    echo "   - Configure email settings if needed"
else
    echo "ℹ️  .env already exists"
fi

# Check if MySQL is running
echo "🔍 Checking MySQL connection..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client found"
    
    # Try to connect to MySQL (will prompt for password if needed)
    echo "Testing MySQL connection (enter your MySQL root password if prompted)..."
    if mysql -u root -p -e "SELECT 1;" &> /dev/null; then
        echo "✅ MySQL connection successful"
        
        # Create development database
        echo "Creating development database..."
        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS figma_app_dev;" 2>/dev/null || echo "Database may already exist"
        echo "✅ Development database ready"
    else
        echo "⚠️  Could not connect to MySQL - please ensure it's running and you have the correct password"
    fi
else
    echo "⚠️  MySQL client not found - please install MySQL"
fi

echo ""
echo "📦 Installing backend dependencies and building..."
./mvnw clean compile

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🔧 Available commands:"
echo "  ./mvnw spring-boot:run                    - Run with default profile"
echo "  ./mvnw spring-boot:run -Dspring.profiles.active=dev  - Run with dev profile"  
echo "  ./mvnw clean package                      - Build JAR"
echo "  ./mvnw test                               - Run tests"
echo ""
echo "🌐 Backend will run at:"
echo "  Local:   http://localhost:5001/api"
echo "  Health:  http://localhost:5001/api/actuator/health"
echo "  Swagger: http://localhost:5001/api/swagger-ui.html"
echo ""
echo "💡 Next steps:"
echo "  1. Customize .env file with your settings"
echo "  2. Ensure MySQL is running"
echo "  3. Run: ./mvnw spring-boot:run -Dspring.profiles.active=dev"
