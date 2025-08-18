#!/bin/bash
# Stop application script for CodeDeploy

echo "Stopping Figma Web App..."

# Stop the systemd service
sudo systemctl stop figma-app || true

# Kill any remaining Java processes (fallback)
sudo pkill -f figma-web-app.jar || true

# Wait for processes to stop
sleep 5

echo "Application stopped successfully"
