#!/bin/bash

echo "🔍 Debugging Java process on EC2..."
echo "=================================="

echo ""
echo "1. Checking systemd service status:"
sudo systemctl status figma-app --no-pager

echo ""
echo "2. Checking if Java is installed:"
java -version 2>&1 | head -3

echo ""
echo "3. Looking for Java processes:"
ps aux | grep -E "(java|figma)" | grep -v grep

echo ""
echo "4. Checking processes on port 5001:"
sudo lsof -i :5001 2>/dev/null || echo "No process found on port 5001"

echo ""
echo "5. Checking JAR file:"
ls -la /opt/figma-web-app/backend/target/figma-web-app-backend-1.0.0.jar 2>/dev/null || echo "JAR file not found!"

echo ""
echo "6. Checking environment file:"
ls -la /opt/figma-web-app/backend/.env-prod 2>/dev/null || echo "Environment file not found!"

echo ""
echo "7. Recent service logs:"
sudo journalctl -u figma-app -n 10 --no-pager

echo ""
echo "8. System resource usage:"
free -h
df -h /opt

echo ""
echo "9. Network connections:"
sudo netstat -tlnp | grep :5001 || echo "Port 5001 not listening"

echo ""
echo "10. Process tree:"
pstree -p | grep -E "(systemd|java)" | head -10

echo ""
echo "Debug complete!"
