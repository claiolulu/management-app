#!/bin/bash
# SSL Certificate Setup with Let's Encrypt

echo "🔒 Setting up SSL Certificate for Figma Web App"
echo "=============================================="

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <your-domain.com>"
    echo "Example: $0 mydomain.com"
    exit 1
fi

DOMAIN="$1"
API_DOMAIN="api.$DOMAIN"

echo "Setting up SSL for:"
echo "- Main domain: $DOMAIN"
echo "- API domain: $API_DOMAIN"
echo ""

# Update Nginx configuration with actual domain
echo "📝 Updating Nginx configuration with your domain..."

# Replace placeholder domain in nginx config
sudo sed -i "s/api.your-domain.com/$API_DOMAIN/g" /etc/nginx/sites-available/figma-app
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/figma-app

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
sudo systemctl reload nginx

# Check if DNS is properly configured
echo "🔍 Checking DNS configuration..."
API_IP=$(dig +short $API_DOMAIN)
SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$API_IP" ]; then
    echo "⚠️ Warning: DNS record for $API_DOMAIN not found or not propagated yet"
    echo "Please ensure your DNS A record points $API_DOMAIN to $SERVER_IP"
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 1
    fi
else
    echo "✅ DNS record found: $API_DOMAIN -> $API_IP"
    if [ "$API_IP" != "$SERVER_IP" ]; then
        echo "⚠️ Warning: DNS IP ($API_IP) doesn't match server IP ($SERVER_IP)"
    fi
fi

# Get SSL certificate
echo "📜 Requesting SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $API_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check:"
    echo "1. DNS records are properly configured"
    echo "2. Domain is accessible from internet"
    echo "3. No firewall blocking port 80/443"
    exit 1
fi

# Test SSL certificate
echo "🔍 Testing SSL certificate..."
curl -I https://$API_DOMAIN/api/actuator/health

# Set up automatic renewal
echo "🔄 Setting up automatic SSL renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "🧪 Testing SSL renewal (dry run)..."
sudo certbot renew --dry-run

echo ""
echo "✅ SSL Setup Complete!"
echo "===================="
echo "🌐 Your API is now available at: https://$API_DOMAIN"
echo "🔒 SSL certificate will auto-renew every 90 days"
echo ""
echo "📋 Test your setup:"
echo "Health check: curl https://$API_DOMAIN/health"
echo "API test: curl https://$API_DOMAIN/api/actuator/health"
echo ""
echo "🔧 SSL Management Commands:"
echo "Check certificate: sudo certbot certificates"
echo "Renew manually: sudo certbot renew"
echo "Check renewal timer: sudo systemctl status certbot.timer"
