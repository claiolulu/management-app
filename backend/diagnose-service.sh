#!/bin/bash

# ===========================================
# BACKEND SERVICE TROUBLESHOOTING SCRIPT
# ===========================================
# Run this script on the EC2 server to diagnose backend service issues

set -e

echo "🔍 Figma Web App Backend Service Diagnostics"
echo "=============================================="
echo ""

# Check if we're running as root or sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo "📊 System Information:"
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Working Directory: $(pwd)"
echo ""

# 1. Check Service Status
echo "🔧 Service Status Check:"
echo "------------------------"
if systemctl is-active --quiet figma-app; then
    echo "✅ figma-app service is ACTIVE"
else
    echo "❌ figma-app service is NOT ACTIVE"
    echo "Service status:"
    $SUDO systemctl status figma-app --no-pager
fi
echo ""

# 2. Check Service Logs
echo "📝 Recent Service Logs (last 50 lines):"
echo "----------------------------------------"
$SUDO journalctl -u figma-app -n 50 --no-pager
echo ""

# 3. Check Environment File
echo "🌍 Environment Configuration:"
echo "-----------------------------"
if [ -f "/opt/figma-web-app/backend/.env" ]; then
    echo "✅ Environment file exists: /opt/figma-web-app/backend/.env"
    echo "Environment file size: $(wc -l < /opt/figma-web-app/backend/.env) lines"
    echo ""
    echo "Environment variables (sensitive values masked):"
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Z_]+= ]]; then
            var_name=$(echo "$line" | cut -d'=' -f1)
            if [[ $var_name =~ (PASSWORD|SECRET|KEY) ]]; then
                echo "$var_name=***MASKED***"
            else
                echo "$line"
            fi
        elif [[ $line =~ ^# ]] || [[ -z "$line" ]]; then
            echo "$line"
        fi
    done < /opt/figma-web-app/backend/.env
else
    echo "❌ Environment file NOT FOUND: /opt/figma-web-app/backend/.env"
fi
echo ""

# 4. Check Required Directories
echo "📁 Directory Structure:"
echo "----------------------"
for dir in "/opt/figma-web-app" "/opt/figma-web-app/backend" "/opt/figma-web-app/uploads/profiles" "/var/log/figma-app"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists ($(ls -la $dir | wc -l) items)"
    else
        echo "❌ $dir does NOT exist"
    fi
done
echo ""

# 5. Check JAR File
echo "☕ JAR File Check:"
echo "------------------"
JAR_FILE="/opt/figma-web-app/backend/target/figma-web-app-backend-1.0.0.jar"
if [ -f "$JAR_FILE" ]; then
    echo "✅ JAR file exists: $JAR_FILE"
    echo "JAR file size: $(ls -lh $JAR_FILE | awk '{print $5}')"
    echo "JAR file date: $(ls -l $JAR_FILE | awk '{print $6, $7, $8}')"
else
    echo "❌ JAR file NOT FOUND: $JAR_FILE"
    echo "Available files in target directory:"
    ls -la /opt/figma-web-app/backend/target/ 2>/dev/null || echo "Target directory not found"
fi
echo ""

# 6. Check Database Connectivity
echo "🗄️  Database Connectivity:"
echo "---------------------------"
if [ -f "/opt/figma-web-app/backend/.env" ]; then
    source /opt/figma-web-app/backend/.env
    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
            echo "✅ Database connection successful: $DB_HOST:$DB_PORT"
        else
            echo "❌ Database connection FAILED: $DB_HOST:$DB_PORT"
        fi
        
        if [ -n "$DB_USERNAME" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_NAME" ]; then
            if command -v mysql &> /dev/null; then
                echo "Testing database authentication..."
                if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
                    echo "✅ Database authentication successful"
                    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" 2>/dev/null; then
                        echo "✅ Database '$DB_NAME' exists and accessible"
                    else
                        echo "⚠️  Database '$DB_NAME' does not exist or not accessible"
                    fi
                else
                    echo "❌ Database authentication FAILED"
                fi
            else
                echo "⚠️  MySQL client not installed - cannot test authentication"
            fi
        else
            echo "⚠️  Database credentials not found in environment"
        fi
    else
        echo "⚠️  Database host/port not configured"
    fi
else
    echo "⚠️  Cannot test database - environment file not found"
fi
echo ""

# 7. Check Port Availability
echo "🔌 Port Check:"
echo "--------------"
PORT="${SERVER_PORT:-5001}"
if netstat -tuln | grep -q ":$PORT "; then
    echo "⚠️  Port $PORT is already in use:"
    netstat -tuln | grep ":$PORT "
    echo "Process using port $PORT:"
    $SUDO lsof -i :$PORT 2>/dev/null || echo "Could not determine process"
else
    echo "✅ Port $PORT is available"
fi
echo ""

# 8. Check Systemd Service Configuration
echo "⚙️  Systemd Service Configuration:"
echo "----------------------------------"
if [ -f "/etc/systemd/system/figma-app.service" ]; then
    echo "✅ Service file exists: /etc/systemd/system/figma-app.service"
    echo "Service file contents:"
    cat /etc/systemd/system/figma-app.service
else
    echo "❌ Service file NOT FOUND: /etc/systemd/system/figma-app.service"
fi
echo ""

# 9. Test JAR Execution
echo "☕ JAR Execution Test:"
echo "---------------------"
if [ -f "$JAR_FILE" ] && [ -f "/opt/figma-web-app/backend/.env" ]; then
    echo "Testing JAR file execution (will timeout after 30 seconds)..."
    cd /opt/figma-web-app/backend
    timeout 30s java -jar -Dspring.profiles.active=prod "$JAR_FILE" --spring.main.web-environment=false --logging.level.root=INFO 2>&1 | head -50 || echo "JAR execution test completed/timed out"
else
    echo "❌ Cannot test JAR execution - missing JAR file or environment"
fi
echo ""

# 10. Suggested Actions
echo "💡 Suggested Actions:"
echo "--------------------"
echo "Based on the diagnostics above, try these fixes:"
echo ""

if [ ! -f "/opt/figma-web-app/backend/.env" ]; then
    echo "❗ CRITICAL: Create environment file:"
    echo "   sudo cp /opt/figma-web-app/backend/.env.example /opt/figma-web-app/backend/.env"
    echo "   sudo vim /opt/figma-web-app/backend/.env  # Configure with your values"
fi

if [ ! -f "$JAR_FILE" ]; then
    echo "❗ CRITICAL: Build the application:"
    echo "   cd /opt/figma-web-app/backend"
    echo "   sudo ./mvnw clean package -DskipTests -Dspring.profiles.active=prod"
fi

echo ""
echo "🔄 Common fixes to try:"
echo "   1. Restart the service: sudo systemctl restart figma-app"
echo "   2. Check logs in real-time: sudo journalctl -u figma-app -f"
echo "   3. Validate environment: source /opt/figma-web-app/backend/.env && env | grep -E '(DB_|MAIL_|JWT_)'"
echo "   4. Test database manually: mysql -h \$DB_HOST -u \$DB_USERNAME -p"
echo "   5. Check GitHub Secrets are properly configured"
echo ""
echo "📞 For additional help:"
echo "   - Check GitHub Actions logs for deployment errors"
echo "   - Verify all required secrets are set in GitHub repository settings"
echo "   - Review ENVIRONMENT_CONFIGURATION.md for complete setup guide"
