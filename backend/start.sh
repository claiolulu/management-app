#!/bin/bash

# Enhanced startup script with environment selection
# Usage: ./start.sh [dev|prod|test]

ENVIRONMENT=${1:-dev}

echo "🚀 Starting Figma Web App Backend in $ENVIRONMENT mode..."

# Load base environment
if [ -f .env ]; then
    source .env
fi

# Load environment-specific variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📋 Loading environment-specific config: .env.$ENVIRONMENT"
    source .env.$ENVIRONMENT
else
    echo "⚠️  No environment-specific config found: .env.$ENVIRONMENT"
fi

# Set environment-specific frontend URL and other configs
case $ENVIRONMENT in
    "dev")
        export FRONTEND_URL=${FRONTEND_URL_DEV:-http://localhost:3000}
        export SPRING_PROFILES_ACTIVE=dev
        export LOG_LEVEL_APP=${LOG_LEVEL_APP:-DEBUG}
        export LOG_LEVEL_SECURITY=${LOG_LEVEL_SECURITY:-DEBUG}
        export LOG_LEVEL_WEB=${LOG_LEVEL_WEB:-DEBUG}
        export SERVER_PORT=${SERVER_PORT:-5001}
        ;;
    "prod")
        export FRONTEND_URL=${FRONTEND_URL_PROD:-https://gcgcm-fe.s3.eu-north-1.amazonaws.com}
        export SPRING_PROFILES_ACTIVE=prod
        export LOG_LEVEL_APP=${LOG_LEVEL_APP:-INFO}
        export LOG_LEVEL_SECURITY=${LOG_LEVEL_SECURITY:-WARN}
        export LOG_LEVEL_WEB=${LOG_LEVEL_WEB:-WARN}
        export SERVER_PORT=${SERVER_PORT:-8080}
        ;;
    "test")
        export FRONTEND_URL=${FRONTEND_URL_TEST:-http://localhost:3001}
        export SPRING_PROFILES_ACTIVE=test
        export LOG_LEVEL_APP=${LOG_LEVEL_APP:-INFO}
        export SERVER_PORT=${SERVER_PORT:-5002}
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Usage: $0 [dev|prod|test]"
        exit 1
        ;;
esac

echo "🌐 Frontend URL: $FRONTEND_URL"
echo "📁 Environment: $ENVIRONMENT"
echo "🔧 Spring Profile: $SPRING_PROFILES_ACTIVE"
echo "🔊 Log Level: $LOG_LEVEL_APP"
echo "🚪 Server Port: $SERVER_PORT"

# Validate required environment variables
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DB_PASSWORD is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET is required"
    exit 1
fi

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "❌ Error: ADMIN_PASSWORD is required"
    exit 1
fi

# Export all variables for the Java process
export $(grep -v '^#' .env | xargs) 2>/dev/null || true
[ -f ".env.$ENVIRONMENT" ] && export $(grep -v '^#' ".env.$ENVIRONMENT" | xargs) 2>/dev/null || true

# Start the application
echo "▶️  Starting Spring Boot application..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=$SPRING_PROFILES_ACTIVE
