#!/bin/bash

# ===========================================
# QUICK FIX FOR SPRING BOOT DEPENDENCY INJECTION ISSUE
# ===========================================

echo "🚀 Quick Fix for Spring Boot Dependency Injection Error"
echo "======================================================"

# Build the updated backend with fixed SecurityConfig
echo "📦 Building backend with dependency injection fix..."
cd /opt/figma-web-app/backend
sudo ./mvnw clean package -DskipTests -Dspring.profiles.active=prod

if [ ! -f "target/figma-web-app-backend-1.0.0.jar" ]; then
    echo "❌ Build failed - JAR not created"
    exit 1
fi

echo "✅ Backend built successfully"

# Stop any running backend processes
echo "🛑 Stopping existing backend processes..."
sudo systemctl stop figma-app || true
sudo pkill -f "figma-web-app-backend" || true

# Fix environment file CORS variables
echo "🔧 Adding missing CORS environment variables..."
cd /opt/figma-web-app/backend

# Ensure all required CORS variables are set
if ! grep -q "CORS_ORIGIN_S3=" .env; then
    echo "CORS_ORIGIN_S3=https://gcgcm-fe.s3.eu-north-1.amazonaws.com" >> .env
fi

if ! grep -q "CORS_ORIGIN_EC2_HTTPS=" .env; then
    echo "CORS_ORIGIN_EC2_HTTPS=https://13.61.195.234" >> .env
fi

# Test environment variables
echo "🔍 Testing environment variables..."
source .env
if [ -z "$ADMIN_PASSWORD" ]; then
    echo "❌ ADMIN_PASSWORD is missing from environment"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is missing from environment"
    exit 1
fi

echo "✅ Critical environment variables are set"

# Start backend manually first to test
echo "🧪 Testing backend startup..."
cd /opt/figma-web-app/backend

# Run with timeout to test startup
timeout 30s bash -c '
source .env
java -jar \
  -Dspring.profiles.active=prod \
  -Dserver.port=5001 \
  -Djava.security.egd=file:/dev/./urandom \
  target/figma-web-app-backend-1.0.0.jar \
  --spring.main.web-environment=true
' &

TEST_PID=$!
sleep 15

# Check if it started successfully
if kill -0 $TEST_PID 2>/dev/null; then
    echo "✅ Backend startup test successful"
    kill $TEST_PID 2>/dev/null
    wait $TEST_PID 2>/dev/null
else
    echo "❌ Backend startup test failed"
    wait $TEST_PID 2>/dev/null
    echo "Exit code: $?"
    exit 1
fi

# Now start with systemd
echo "🔄 Starting backend service with systemd..."
sudo systemctl daemon-reload
sudo systemctl start figma-app

# Wait and check
sleep 10

if sudo systemctl is-active --quiet figma-app; then
    echo "✅ Backend service started successfully"
    
    # Test API endpoint
    sleep 5
    if curl -s http://localhost:5001/api/health > /dev/null; then
        echo "✅ API endpoint responding"
        echo "🌐 Backend should now be accessible at: http://13.61.195.234:5001/api/"
    else
        echo "⚠️ API endpoint not responding yet (may need more time)"
    fi
else
    echo "❌ Backend service failed to start"
    echo "Service status:"
    sudo systemctl status figma-app --no-pager -l
    echo ""
    echo "Recent logs:"
    sudo journalctl -u figma-app -n 30 --no-pager
    exit 1
fi

echo ""
echo "🎉 Backend fix completed successfully!"
echo "🔗 Test the API: curl http://13.61.195.234:5001/api/health"
echo "🔗 Login endpoint: http://13.61.195.234:5001/api/login"
