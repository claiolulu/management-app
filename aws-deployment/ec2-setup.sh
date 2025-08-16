#!/bin/bash
# AWS EC2 Setup Script for Spring Boot Backend

echo "🚀 Setting up Spring Boot Backend on Ubuntu EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install -y openjdk-17-jdk

# Install MySQL client (for database connection)
sudo apt install -y mysql-client-core-8.0

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# Install Git
sudo apt install -y git

# Create application user
sudo useradd -m -s /bin/bash figma-app
sudo mkdir -p /home/figma-app/app
sudo chown -R figma-app:figma-app /home/figma-app

# Create upload directories
sudo mkdir -p /var/uploads/profiles
sudo chown -R figma-app:figma-app /var/uploads

# Create log directory
sudo mkdir -p /var/log/figma-app
sudo chown -R figma-app:figma-app /var/log/figma-app

echo "✅ Basic setup complete!"
