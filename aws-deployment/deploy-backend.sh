#!/bin/bash
# Complete Backend Deployment Script

echo "📦 Deploying Figma Web App Backend..."
echo "======================================"

# Exit on any error
set -e

# Check if running as figma-app user or with sudo
if [[ $EUID -eq 0 ]]; then
   echo "This script should be run as figma-app user or with sudo"
fi

# Navigate to app directory
cd /home/figma-app

# Stop the service if it's running
echo "⏹️ Stopping existing service..."
sudo systemctl stop figma-app || true

# Backup existing app (if it exists)
if [ -d "app" ]; then
    echo "📋 Backing up existing application..."
    sudo -u figma-app mv app app_backup_$(date +%Y%m%d_%H%M%S) || true
fi

# Clone the repository
echo "📥 Cloning repository..."

# Try HTTPS first (works for public repos)
if sudo -u figma-app git clone https://github.com/claiolulu/management-app.git app 2>/dev/null; then
    echo "✅ Repository cloned successfully via HTTPS"
else
    echo "❌ HTTPS clone failed. Repository might be private."
    echo "💡 For private repositories, you need to:"
    echo "   1. Set up SSH keys, or"
    echo "   2. Use personal access token"
    echo "   3. Run: git clone git@github.com:claiolulu/management-app.git app"
    exit 1
fi

# Navigate to backend directory
cd /home/figma-app/app/backend

# Make maven wrapper executable
sudo -u figma-app chmod +x mvnw

# Build the application
echo "🔨 Building Spring Boot application..."
sudo -u figma-app ./mvnw clean package -DskipTests

# Check if build was successful
if [ ! -f target/*.jar ]; then
    echo "❌ Build failed - JAR file not found"
    exit 1
fi

# Copy JAR file
echo "📄 Copying JAR file..."
sudo -u figma-app cp target/*.jar /home/figma-app/figma-web-app.jar

# Copy production application.yml
echo "⚙️ Setting up production configuration..."
if [ -f /home/figma-app/app/aws-deployment/application-production.yml ]; then
    sudo -u figma-app cp /home/figma-app/app/aws-deployment/application-production.yml /home/figma-app/application-production.yml
fi

# Install systemd service
echo "🔧 Installing systemd service..."
sudo cp /home/figma-app/app/aws-deployment/figma-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable figma-app

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo cp /home/figma-app/app/aws-deployment/nginx-backend.conf /etc/nginx/sites-available/figma-app
sudo ln -sf /etc/nginx/sites-available/figma-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Check environment file
if [ ! -f /home/figma-app/.env ]; then
    echo "⚠️ Warning: Environment file not found at /home/figma-app/.env"
    echo "Please create and configure the environment file before starting the service"
else
    echo "✅ Environment file found"
fi

# Set proper permissions
sudo chown figma-app:figma-app /home/figma-app/figma-web-app.jar
sudo chmod 755 /home/figma-app/figma-web-app.jar

# Test database connection (optional)
echo "🗄️ Testing database connection..."
if [ -f /home/figma-app/.env ]; then
    source /home/figma-app/.env
    mysql -h "$DB_HOST" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null && echo "✅ Database connection successful" || echo "⚠️ Database connection failed - please check credentials"
fi

# Start the service
echo "▶️ Starting Figma Web App service..."
sudo systemctl start figma-app

# Wait a moment and check status
sleep 5
sudo systemctl status figma-app --no-pager

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Backend deployment complete!"
echo "======================================"
echo "📋 Service Status:"
sudo systemctl is-active figma-app
echo ""
echo "📊 Health Check:"
echo "Local: curl http://localhost:8080/api/actuator/health"
echo "External: curl http://your-server-ip/api/actuator/health"
echo ""
echo "📝 Logs:"
echo "Application: sudo journalctl -u figma-app -f"
echo "Nginx: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔧 Management Commands:"
echo "Restart: sudo systemctl restart figma-app"
echo "Stop: sudo systemctl stop figma-app"
echo "Status: sudo systemctl status figma-app"
