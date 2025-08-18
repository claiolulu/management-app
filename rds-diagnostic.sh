#!/bin/bash

echo "=== RDS Connection Diagnostic ==="
echo "✅ Network connectivity: SUCCESS (confirmed by user)"
echo "🔍 Now checking application configuration..."
echo ""

echo "=== Current Application Config ==="
echo "sudo cat /opt/figma-web-app/backend/config/application-production.yml"
echo ""

echo "=== Look for these potential issues ==="
echo "❌ Placeholder strings still present:"
echo "   - RDS_ENDPOINT_PLACEHOLDER"
echo "   - RDS_DATABASE_PLACEHOLDER"
echo "   - RDS_USERNAME_PLACEHOLDER"
echo "   - RDS_PASSWORD_PLACEHOLDER"
echo ""

echo "❌ Wrong database name format:"
echo "   - Should be: gcgcm_mgt_db (with underscores)"
echo "   - NOT: gcgcm-mgt-db (with dashes)"
echo ""

echo "❌ Missing or empty values in datasource section"
echo ""

echo "=== Test Manual Connection ==="
echo "mysql -h gcgcm-mgt-db.c1448q0cqz8u.eu-north-1.rds.amazonaws.com -u admin -p"
echo "Password: [enter your RDS master password]"
echo ""

echo "=== Check Service Logs ==="
echo "sudo journalctl -u figma-app -n 50"
echo ""

echo "=== Restart Service After Config Fix ==="
echo "sudo systemctl restart figma-app"
echo "sudo systemctl status figma-app"
