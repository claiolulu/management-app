#!/bin/bash
# Validate service script for CodeDeploy

echo "Validating Figma Web App deployment..."

# Wait for service to start
sleep 10

# Check if service is running
if sudo systemctl is-active --quiet figma-app; then
    echo "✅ Service is running"
else
    echo "❌ Service is not running"
    sudo systemctl status figma-app
    exit 1
fi

# Check application health endpoint
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:8080/api/actuator/health > /dev/null; then
        echo "✅ Health check passed"
        exit 0
    else
        echo "⏳ Attempt $ATTEMPT/$MAX_ATTEMPTS: Health check failed, retrying in 10 seconds..."
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

echo "❌ Health check failed after $MAX_ATTEMPTS attempts"
sudo journalctl -u figma-app --no-pager -n 50
exit 1
