# AWS HTTPS Deployment Guide for Figma Web App

## Prerequisites
1. AWS Account with proper permissions
2. Domain name (e.g., your-domain.com)
3. AWS CLI configured
4. Node.js and npm installed locally

## Architecture
```
Frontend: S3 + CloudFront (HTTPS) → your-domain.com
Backend: EC2 + Nginx + Let's Encrypt (HTTPS) → api.your-domain.com
Database: RDS MySQL
```

## Step-by-Step Deployment

### 1. Domain and DNS Setup
1. **Purchase domain** or use existing one
2. **Create Route 53 hosted zone** for your domain
3. **Update domain nameservers** to point to Route 53
4. **Create DNS records**:
   - A record: `your-domain.com` → CloudFront distribution
   - CNAME: `www.your-domain.com` → `your-domain.com`
   - A record: `api.your-domain.com` → EC2 public IP

### 2. RDS Database Setup
```bash
# Run the RDS setup script
chmod +x aws-deployment/setup-rds.sh
./aws-deployment/setup-rds.sh
```

### 3. EC2 Backend Deployment
```bash
# 1. Launch EC2 instance (t3.small, Ubuntu 20.04)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Run setup script
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# 4. Deploy application
wget https://raw.githubusercontent.com/claiolulu/management-app/main/aws-deployment/deploy-backend.sh
chmod +x deploy-backend.sh
./deploy-backend.sh

# 5. Configure environment variables
sudo nano /home/figma-app/.env
# Update with your RDS endpoint, passwords, etc.

# 6. Install systemd service
sudo cp /home/figma-app/app/aws-deployment/figma-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable figma-app
sudo systemctl start figma-app

# 7. Configure Nginx
sudo cp /home/figma-app/app/aws-deployment/nginx-backend.conf /etc/nginx/sites-available/figma-app
sudo ln -s /etc/nginx/sites-available/figma-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 8. Get SSL certificate
sudo certbot --nginx -d api.your-domain.com

# 9. Start services
sudo systemctl reload nginx
sudo systemctl status figma-app
```

### 4. S3 + CloudFront Frontend Setup

#### 4.1 Create S3 Bucket
```bash
# Create bucket for website hosting
aws s3 mb s3://your-domain.com

# Configure for static website hosting
aws s3 website s3://your-domain.com --index-document index.html --error-document index.html

# Set bucket policy for public read access
```

#### 4.2 Create CloudFront Distribution
1. **Origin Domain**: your-domain.com.s3-website-region.amazonaws.com
2. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
3. **Alternate Domain Names**: your-domain.com, www.your-domain.com
4. **SSL Certificate**: Request/use ACM certificate for your-domain.com
5. **Default Root Object**: index.html
6. **Error Pages**: 404 → /index.html (for SPA routing)

#### 4.3 Deploy Frontend
```bash
# Update API URLs in your frontend code
# Edit frontend/src/config/api.js with your actual API domain

# Build and deploy
cd frontend
npm install
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-domain.com --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 5. Security Configuration

#### 5.1 EC2 Security Group
- **Port 22**: SSH (your IP only)
- **Port 80**: HTTP (0.0.0.0/0)
- **Port 443**: HTTPS (0.0.0.0/0)

#### 5.2 RDS Security Group
- **Port 3306**: MySQL (EC2 security group only)

#### 5.3 Environment Variables
Update `/home/figma-app/.env`:
```bash
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PASSWORD=your_secure_password
JWT_SECRET=your_64_character_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### 6. Monitoring and Maintenance

#### 6.1 CloudWatch Logs
- EC2 application logs: `/var/log/figma-app/figma-app.log`
- Nginx logs: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

#### 6.2 Health Checks
- Backend health: `https://api.your-domain.com/health`
- Frontend: `https://your-domain.com`

#### 6.3 Auto-renewal SSL
```bash
# Test renewal
sudo certbot renew --dry-run

# Cron job is automatically set up
```

### 7. Cost Estimation (Monthly)
- **EC2 t3.small**: ~$16
- **RDS db.t3.micro**: ~$13  
- **S3 storage**: ~$1
- **CloudFront**: ~$1-5
- **Route 53**: ~$0.50
- **Total**: ~$30-35/month

### 8. Final URLs
- **Frontend**: https://your-domain.com
- **Backend API**: https://api.your-domain.com/api
- **Health Check**: https://api.your-domain.com/health

## Troubleshooting
1. **Backend not starting**: Check logs with `sudo journalctl -u figma-app -f`
2. **Database connection issues**: Verify RDS security groups and endpoint
3. **SSL certificate issues**: Check DNS records and try `sudo certbot --nginx`
4. **Frontend not loading**: Check CloudFront distribution and S3 bucket policy

## Updates and Maintenance
```bash
# Backend updates
cd /home/figma-app/app
sudo -u figma-app git pull
sudo -u figma-app ./mvnw clean package -DskipTests
sudo systemctl restart figma-app

# Frontend updates
npm run build
aws s3 sync dist/ s3://your-domain.com --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```
