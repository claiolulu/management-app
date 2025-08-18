# Complete EC2 Environment Setup Guide

## Prerequisites
- EC2 instance (Ubuntu 20.04 LTS, t3.small recommended)
- Domain name configured
- RDS MySQL database created
- Security groups configured (ports 22, 80, 443)

## Step 1: Initial Server Setup

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Download and run setup script
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh
```

## Step 2: Configure Environment

```bash
# Run environment configuration helper
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/configure-environment.sh
chmod +x configure-environment.sh
sudo ./configure-environment.sh
```

**You'll be prompted for:**
- RDS database endpoint
- Database username/password
- Your domain name
- Email configuration

## Step 3: Deploy Application

```bash
# Download and run deployment script
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/deploy-backend.sh
chmod +x deploy-backend.sh
./deploy-backend.sh
```

## Step 4: Setup SSL Certificate

```bash
# Download and run SSL setup script
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/setup-ssl.sh
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh your-domain.com
```

## Step 5: Verify Deployment

```bash
# Check application status
sudo systemctl status figma-app

# Check logs
sudo journalctl -u figma-app -f

# Test API endpoints
curl https://api.your-domain.com/health
curl https://api.your-domain.com/api/actuator/health
```

## Environment Variables Reference

Your `/home/figma-app/.env` file should contain:

```bash
# Database
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=figma_app
DB_USERNAME=admin
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_64_character_secure_jwt_secret
ADMIN_PASSWORD=your_admin_password

# URLs
FRONTEND_URL=https://your-domain.com
UPLOAD_PATH=/var/uploads/profiles

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=liuprope@gmail.com
MAIL_PASSWORD=svlhrmvrgbirwegl
```

## DNS Configuration

Configure these DNS records in Route 53 (or your DNS provider):

```
A Record: api.your-domain.com -> Your EC2 Public IP
```

## Security Groups

**EC2 Security Group:**
- Port 22 (SSH): Your IP only
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0

**RDS Security Group:**
- Port 3306 (MySQL): EC2 Security Group only

## Troubleshooting

### Application Won't Start
```bash
# Check logs
sudo journalctl -u figma-app -f

# Check environment file
cat /home/figma-app/.env

# Test database connection
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD -e "SELECT 1;"
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test domain accessibility
curl -I http://api.your-domain.com

# Check DNS
dig api.your-domain.com
```

### Database Connection Issues
```bash
# Test from EC2
mysql -h your-rds-endpoint -u admin -p

# Check security groups
# Ensure RDS allows connections from EC2 security group
```

## Maintenance Commands

```bash
# Restart application
sudo systemctl restart figma-app

# Update application
cd /home/figma-app/app
sudo -u figma-app git pull
sudo -u figma-app ./mvnw clean package -DskipTests
sudo -u figma-app cp target/*.jar /home/figma-app/figma-web-app.jar
sudo systemctl restart figma-app

# View logs
sudo journalctl -u figma-app -f
sudo tail -f /var/log/nginx/access.log

# SSL certificate renewal (automatic)
sudo systemctl status certbot.timer
```

## Cost Optimization

- Use t3.micro for testing (covered by free tier)
- Use t3.small for production (30 users)
- Enable detailed monitoring only when needed
- Set up CloudWatch alarms for cost control

## Security Hardening

```bash
# Update packages regularly
sudo apt update && sudo apt upgrade -y

# Check for security updates
sudo apt list --upgradable

# Monitor logs
sudo tail -f /var/log/auth.log

# Check active connections
sudo netstat -tulpn
```
