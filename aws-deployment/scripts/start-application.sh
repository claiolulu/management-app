#!/bin/bash
# Start application script for CodeDeploy

echo "Starting Figma Web App..."

# Set permissions
sudo chown figma-app:figma-app /home/figma-app/figma-web-app.jar
sudo chmod 755 /home/figma-app/figma-web-app.jar

# Copy frontend build to nginx directory
if [ -d "/home/figma-app/frontend-build" ]; then
    sudo cp -r /home/figma-app/frontend-build/* /var/www/figma-app/
    sudo chown -R nginx:nginx /var/www/figma-app/
fi

# Setup configuration
if [ -f "/home/figma-app/deployment-scripts/application-production.yml" ]; then
    sudo -u figma-app cp /home/figma-app/deployment-scripts/application-production.yml /home/figma-app/application-production.yml
fi

if [ -f "/home/figma-app/deployment-scripts/nginx-backend.conf" ]; then
    sudo cp /home/figma-app/deployment-scripts/nginx-backend.conf /etc/nginx/sites-available/figma-app
    sudo ln -sf /etc/nginx/sites-available/figma-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

if [ -f "/home/figma-app/deployment-scripts/figma-app.service" ]; then
    sudo cp /home/figma-app/deployment-scripts/figma-app.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable figma-app
fi

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Start the application
sudo systemctl start figma-app

echo "Application started successfully"
