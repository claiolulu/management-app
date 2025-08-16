#!/bin/bash
# Deploy Spring Boot Application

echo "📦 Deploying Spring Boot Application..."

# Clone your repository
cd /home/figma-app
sudo -u figma-app git clone https://github.com/claiolulu/management-app.git app

cd /home/figma-app/app/backend

# Build the application
sudo -u figma-app ./mvnw clean package -DskipTests

# Copy the JAR file
sudo -u figma-app cp target/*.jar /home/figma-app/app/figma-web-app.jar

echo "✅ Application built successfully!"
