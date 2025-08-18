# Environment-Based Configuration Guide

## Overview

This application uses a comprehensive environment-based configuration system that supports multiple deployment environments (development, production, staging) with proper separation of concerns and security best practices.

## Architecture

### Backend Configuration (Spring Boot)
- **Base Configuration**: `application.yml` with environment variable placeholders
- **Environment Profiles**: 
  - `application-dev.yml` - Development-specific settings
  - `application-prod.yml` - Production-specific settings
- **Environment Files**: 
  - `.env.example` - Template with all available variables
  - `.env.development` - Development defaults
  - `.env` - Local development (gitignored)

### Frontend Configuration (Vite/React)
- **Environment Files**:
  - `.env.example` - Template with all available variables
  - `.env.development` - Development-specific settings
  - `.env.production` - Production settings (auto-generated during deployment)
  - `.env.local` - Local overrides (gitignored)

## Environment Profiles

### Development Profile (`dev`)
**Purpose**: Local development and testing
**Characteristics**:
- Verbose logging (DEBUG level)
- All management endpoints enabled
- Database auto-creation (`create-drop`)
- Local database connection
- Extended JWT expiration (24 hours)
- Console email output
- All CORS origins allowed

### Production Profile (`prod`)
**Purpose**: Live production deployment
**Characteristics**:
- Minimal logging (INFO/WARN levels)
- Restricted management endpoints
- Database preservation (`update`)
- RDS database connection with SSL
- Short JWT expiration (1 hour)
- Real SMTP email configuration
- Restricted CORS origins
- Enhanced security settings

## Configuration Variables

### Backend Environment Variables

#### Required Variables (No Defaults)
```bash
# Security (CRITICAL)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-64-characters
ADMIN_PASSWORD=your-secure-admin-password

# Database (Production)
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

# Email
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
```

#### Optional Variables (With Defaults)
```bash
# Server
SERVER_PORT=5001
SERVER_CONTEXT_PATH=/api
APP_NAME=figma-web-app-backend

# Database
DB_PORT=3306
DB_NAME=figma_app_prod (prod) / figma_app_dev (dev)
DB_USE_SSL=true (prod) / false (dev)
DB_TIMEZONE=UTC

# JPA/Hibernate
JPA_DDL_AUTO=update (prod) / create-drop (dev)
JPA_SHOW_SQL=false (prod) / true (dev)
JPA_FORMAT_SQL=false (prod) / true (dev)

# JWT
JWT_EXPIRATION_MS=3600000 (prod) / 86400000 (dev)

# CORS
CORS_ALLOW_CREDENTIALS=true
FRONTEND_URL=https://your-domain.com (prod) / http://localhost:3000 (dev)

# Logging
LOG_LEVEL_APP=INFO (prod) / DEBUG (dev)
LOG_LEVEL_SECURITY=WARN (prod) / DEBUG (dev)
LOG_LEVEL_WEB=WARN (prod) / DEBUG (dev)
LOG_FILE=/var/log/figma-app/application.log (prod) / logs/figma-app-dev.log (dev)

# Management
MANAGEMENT_ENDPOINTS=health,info (prod) / * (dev)
MANAGEMENT_HEALTH_DETAILS=when-authorized (prod) / always (dev)
```

### Frontend Environment Variables

#### Required Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5001/api (dev) / https://your-domain.com/api (prod)
```

#### Optional Variables
```bash
# Environment Detection
VITE_ENVIRONMENT=development / production
VITE_ENABLE_DEBUG=true (dev) / false (prod)
VITE_ENABLE_ANALYTICS=false (dev) / true (prod)
VITE_API_TIMEOUT=10000 (dev) / 5000 (prod)

# Build Configuration
VITE_CHUNK_SIZE_WARNING_LIMIT=1000
```

## Local Development Setup

### 1. Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your local settings
# Minimum required changes:
# - DB_PASSWORD=your-local-db-password
# - JWT_SECRET=your-dev-jwt-secret-key

# Run with development profile
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### 2. Frontend Setup
```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Edit .env.local if needed (defaults should work)
# VITE_API_URL=http://localhost:5001/api

# Install and run
npm install
npm run dev
```

### 3. Database Setup
```bash
# Create development database
mysql -u root -p -e "CREATE DATABASE figma_app_dev;"

# Application will auto-create tables with dev profile
```

## Production Deployment

### 1. GitHub Secrets Configuration
Required secrets in GitHub repository settings:

```bash
# AWS
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=eu-north-1

# Infrastructure
EC2_HOST=your-ec2-ip-or-domain
EC2_USER=ubuntu
EC2_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----...
S3_BUCKET_NAME=your-s3-bucket-name

# Database
RDS_ENDPOINT=your-rds-endpoint.amazonaws.com
RDS_USERNAME=admin
RDS_PASSWORD=your-secure-db-password
RDS_DATABASE=figma_app_prod

# Security
JWT_SECRET=your-production-jwt-secret-minimum-64-characters-long
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### 2. Automatic Deployment
Deployment is triggered automatically on push to `main` branch:

1. **Frontend**: Built with production environment variables
2. **Backend**: Built with `prod` Spring profile
3. **Environment Configuration**: Generated from GitHub Secrets
4. **Services**: Deployed with production-optimized settings

### 3. Manual Deployment
```bash
# Trigger manual deployment with environment selection
# Go to GitHub Actions → Deploy to AWS → Run workflow → Select environment
```

## Environment File Templates

### Backend `.env` Template
```bash
# Copy from .env.example and customize
SPRING_PROFILES_ACTIVE=dev
DB_PASSWORD=your-local-password
JWT_SECRET=your-dev-jwt-secret
# ... other variables as needed
```

### Frontend `.env.local` Template
```bash
# Copy from .env.example and customize
VITE_API_URL=http://localhost:5001/api
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG=true
```

## Security Considerations

### Development
- ✅ Use weak passwords for local development
- ✅ Enable verbose logging for debugging
- ✅ Use self-signed certificates
- ✅ Allow all CORS origins for convenience

### Production
- ⚠️ Use strong, unique passwords (minimum 32 characters)
- ⚠️ Restrict logging to prevent sensitive data exposure
- ⚠️ Use proper SSL certificates (Let's Encrypt recommended)
- ⚠️ Restrict CORS origins to your actual domains
- ⚠️ Enable all Spring Security features
- ⚠️ Use environment-specific database names
- ⚠️ Set appropriate JWT expiration times

## Troubleshooting

### Backend Issues
```bash
# Check active profile
curl http://localhost:5001/api/actuator/env | grep "activeProfiles"

# Check environment variables
curl http://localhost:5001/api/actuator/env

# View logs
tail -f logs/figma-app-dev.log  # Development
tail -f /var/log/figma-app/application.log  # Production

# Check configuration
curl http://localhost:5001/api/actuator/configprops
```

### Frontend Issues
```bash
# Check build environment
npm run build -- --debug

# View environment variables in browser console
console.log(import.meta.env)

# Check API connectivity
curl https://your-domain.com/api/health
```

### Database Issues
```bash
# Test database connection
mysql -h localhost -u root -p -e "SHOW DATABASES;"  # Development
mysql -h your-rds-endpoint -u admin -p -e "SHOW DATABASES;"  # Production

# Check application database connection
curl http://localhost:5001/api/actuator/health
```

## Migration from Hardcoded Configuration

### Before (Hardcoded Values)
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/figma_app
    username: root
    password: hardcoded-password
```

### After (Environment-Based)
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:figma_app}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD}
```

```bash
# .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=figma_app_dev
DB_USERNAME=root
DB_PASSWORD=your-secure-password
```

## Best Practices

1. **Never commit actual environment files** (`.env`, `.env.local`)
2. **Always use `.env.example` templates** for documentation
3. **Use different database names** for each environment
4. **Set appropriate log levels** for each environment
5. **Use strong secrets** in production
6. **Validate environment variables** on application startup
7. **Document all configuration options**
8. **Use environment-specific defaults** where appropriate
9. **Test configuration** in staging before production
10. **Monitor configuration drift** between environments
