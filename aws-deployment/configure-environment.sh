#!/bin/bash
# Environment Configuration Helper

echo "⚙️ Figma Web App Environment Configuration"
echo "=========================================="

ENV_FILE="/home/figma-app/.env"

# Function to prompt for input with default
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        input=${input:-$default}
    else
        read -p "$prompt: " input
        while [ -z "$input" ]; do
            echo "This field is required!"
            read -p "$prompt: " input
        done
    fi
    
    # Store in environment variable for later use
    export $var_name="$input"
}

# Generate secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

echo "Let's configure your environment variables..."
echo ""

# Database Configuration
echo "📊 Database Configuration"
echo "------------------------"
prompt_input "RDS Endpoint (without port)" "" "DB_HOST"
prompt_input "Database Port" "3306" "DB_PORT"
prompt_input "Database Name" "figma_app" "DB_NAME"
prompt_input "Database Username" "admin" "DB_USERNAME"
prompt_input "Database Password" "" "DB_PASSWORD"

echo ""

# JWT Configuration
echo "🔑 JWT Configuration"
echo "-------------------"
JWT_SECRET=$(generate_jwt_secret)
echo "Generated secure JWT secret: ${JWT_SECRET:0:20}..."
prompt_input "Use generated JWT secret? (y/n)" "y" "USE_GENERATED"
if [ "$USE_GENERATED" != "y" ]; then
    prompt_input "JWT Secret (min 64 chars)" "$JWT_SECRET" "JWT_SECRET"
fi

echo ""

# Admin Configuration
echo "👤 Admin Configuration"
echo "---------------------"
prompt_input "Admin Password" "" "ADMIN_PASSWORD"

echo ""

# Domain Configuration
echo "🌐 Domain Configuration"
echo "----------------------"
prompt_input "Your Domain (e.g., mydomain.com)" "" "DOMAIN_NAME"
FRONTEND_URL="https://$DOMAIN_NAME"
API_DOMAIN="api.$DOMAIN_NAME"

echo ""

# Email Configuration
echo "📧 Email Configuration"
echo "---------------------"
prompt_input "Email Host" "smtp.gmail.com" "MAIL_HOST"
prompt_input "Email Port" "587" "MAIL_PORT"
prompt_input "Email Username" "liuprope@gmail.com" "MAIL_USERNAME"
prompt_input "Email Password" "svlhrmvrgbirwegl" "MAIL_PASSWORD"

echo ""
echo "📝 Creating environment file..."

# Create the environment file
cat > $ENV_FILE << EOF
# Figma Web App Production Environment
# Generated on $(date)

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=$JWT_SECRET

# ============================================
# ADMIN CONFIGURATION
# ============================================
ADMIN_PASSWORD=$ADMIN_PASSWORD

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
UPLOAD_PATH=/var/uploads/profiles

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL=$FRONTEND_URL

# ============================================
# EMAIL CONFIGURATION
# ============================================
MAIL_HOST=$MAIL_HOST
MAIL_PORT=$MAIL_PORT
MAIL_USERNAME=$MAIL_USERNAME
MAIL_PASSWORD=$MAIL_PASSWORD

# ============================================
# DOMAIN CONFIGURATION
# ============================================
DOMAIN_NAME=$DOMAIN_NAME
API_DOMAIN=$API_DOMAIN

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_PATH=/var/log/figma-app
LOG_LEVEL=INFO
EOF

# Set proper permissions
chown figma-app:figma-app $ENV_FILE
chmod 600 $ENV_FILE

echo "✅ Environment file created at $ENV_FILE"
echo ""
echo "🔍 Environment Summary:"
echo "======================="
echo "Database: $DB_USERNAME@$DB_HOST:$DB_PORT/$DB_NAME"
echo "Frontend URL: $FRONTEND_URL"
echo "API Domain: $API_DOMAIN"
echo "Email: $MAIL_USERNAME via $MAIL_HOST:$MAIL_PORT"
echo ""
echo "🔐 Security:"
echo "JWT Secret: ${JWT_SECRET:0:10}... (64 chars)"
echo "Admin Password: *** (configured)"
echo "DB Password: *** (configured)"
echo ""
echo "📋 Next Steps:"
echo "1. Test database connection"
echo "2. Configure your DNS records"
echo "3. Deploy the application"
echo "4. Set up SSL certificate"
echo ""
echo "🔧 Test Database Connection:"
echo "mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD -e 'SELECT 1;'"
