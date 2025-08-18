#!/bin/bash
# Complete EC2 Setup Script for Figma Web App

echo "🚀 Setting up Figma Web App on Ubuntu EC2..."
echo "======================================"

# Exit on any error
set -e

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Java 17
echo "☕ Installing Java 17..."
sudo apt install -y openjdk-17-jdk

# Verify Java installation
java -version
echo "JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" | sudo tee -a /etc/environment
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Install Maven
echo "📋 Installing Maven..."
sudo apt install -y maven
mvn -version

# Install MySQL client
echo "🗄️ Installing MySQL client..."
sudo apt install -y mysql-client-core-8.0

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Install other utilities
echo "🛠️ Installing additional utilities..."
sudo apt install -y git curl wget unzip htop tree

# Create application user
echo "👤 Creating application user..."
sudo useradd -m -s /bin/bash figma-app
sudo mkdir -p /home/figma-app/app
sudo chown -R figma-app:figma-app /home/figma-app

# Create directories with proper permissions
echo "📁 Creating application directories..."
sudo mkdir -p /var/uploads/profiles
sudo mkdir -p /var/log/figma-app
sudo mkdir -p /etc/figma-app

# Set ownership and permissions
sudo chown -R figma-app:figma-app /var/uploads
sudo chown -R figma-app:figma-app /var/log/figma-app
sudo chmod 755 /var/uploads
sudo chmod 755 /var/uploads/profiles
sudo chmod 755 /var/log/figma-app

# Configure firewall
echo "🔥 Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configure system limits
echo "⚙️ Configuring system limits..."
echo "figma-app soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "figma-app hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Create environment file template
echo "📝 Creating environment template..."
sudo tee /home/figma-app/.env << 'EOF'
# IMPORTANT: Replace these values with your actual configuration

# Database Configuration
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=figma_app
DB_USERNAME=admin
DB_PASSWORD=CHANGE_THIS_PASSWORD

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_64_CHAR_SECRET

# Admin Configuration
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD

# File Upload Configuration
UPLOAD_PATH=/var/uploads/profiles

# Frontend Configuration
FRONTEND_URL=https://your-domain.com

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=liuprope@gmail.com
MAIL_PASSWORD=svlhrmvrgbirwegl
EOF

sudo chown figma-app:figma-app /home/figma-app/.env
sudo chmod 600 /home/figma-app/.env

# Display system information
echo "📊 System Information:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Java: $(java -version 2>&1 | head -n 1)"
echo "Maven: $(mvn -version | head -n 1)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Available Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Available Disk: $(df -h / | tail -1 | awk '{print $4}')"

echo ""
echo "✅ EC2 setup complete!"
echo "======================================"
echo "📋 Next steps:"
echo "1. Update /home/figma-app/.env with your actual values"
echo "2. Run the deployment script"
echo "3. Configure your domain DNS"
echo "4. Get SSL certificate with certbot"
echo ""
echo "🔧 Useful commands:"
echo "sudo systemctl status figma-app"
echo "sudo journalctl -u figma-app -f"
echo "sudo nginx -t && sudo systemctl reload nginx"
