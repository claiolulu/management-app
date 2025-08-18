#!/bin/bash

# Quick fix for RDS configuration
# Run this script on your EC2 to manually create the correct config

echo "Creating correct RDS configuration..."

# Stop the service
sudo systemctl stop figma-app

# Create the correct configuration file
sudo tee /opt/figma-web-app/backend/config/application-production.yml > /dev/null << 'EOF'
spring:
  datasource:
    url: jdbc:mysql://gcgcm-mgt-db.c1448q0cqz8u.eu-north-1.rds.amazonaws.com:3306/gcgcm_mgt_db?useSSL=false&allowPublicKeyRetrieval=true
    username: admin
    password: YOUR_RDS_PASSWORD_HERE
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

  web:
    cors:
      allowed-origins: "*"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true

server:
  port: 5001

jwt:
  secret: your-jwt-secret-key-at-least-32-characters-long-random-string

logging:
  level:
    com.figma: INFO
    root: WARN
  file:
    name: /var/log/figma-app/figma-app.log
    max-size: 10MB
    max-history: 5
EOF

echo "✅ Configuration created. Now you need to:"
echo "1. Edit the file and replace YOUR_RDS_PASSWORD_HERE with your actual RDS password"
echo "2. Replace the JWT secret with a proper random string"
echo ""
echo "Commands:"
echo "sudo nano /opt/figma-web-app/backend/config/application-production.yml"
echo "# Edit the password and JWT secret, then save"
echo ""
echo "sudo systemctl start figma-app"
echo "sudo systemctl status figma-app"
