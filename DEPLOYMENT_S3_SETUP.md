# S3 Frontend + EC2 Backend Deployment Setup

This guide will help you set up **cost-effective** automated deployment using S3 for frontend hosting and EC2 for your backend API.

## ✅ Benefits of This Approach

- **💰 Low Cost** - S3 hosting is extremely cheap (~$1-5/month)
- **⚡ Fast Performance** - S3 + CloudFront CDN for global distribution
- **📈 Scalable** - S3 handles unlimited frontend traffic
- **🔒 Secure** - Separate frontend/backend concerns
- **🌍 Global** - CloudFront distributes your app worldwide
- **📊 Detailed logging** - Color-coded deployment status

---

## 🛠️ Setup Steps

### Step 1: Create S3 Bucket for Frontend

1. **Go to AWS S3 Console**:
   - Create new bucket: `your-app-name-frontend` (must be globally unique)
   - Region: Choose same as your EC2 instance
   - **Uncheck "Block all public access"** (we need public read for website hosting)
   - Create bucket

2. **Enable Static Website Hosting**:
   - Go to bucket → Properties → Static website hosting
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html` (for React Router)
   - Save changes

3. **Set Bucket Policy** (make it publicly readable):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::your-app-name-frontend/*"
           }
       ]
   }
   ```

4. **Get S3 Website URL**:
   - Format: `http://your-bucket-name.s3-website-region.amazonaws.com`
   - Example: `http://my-app-frontend.s3-website-us-east-1.amazonaws.com`

### Step 2: (Optional) Setup CloudFront CDN

1. **Create CloudFront Distribution**:
   - Origin Domain: Your S3 website endpoint (not the bucket name)
   - Origin Path: Leave empty
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: `index.html`
   - Create distribution

2. **Configure Error Pages** (for React Router):
   - Go to Error Pages tab
   - Create error page:
     - HTTP Error Code: 404
     - Response Page Path: /index.html
     - HTTP Response Code: 200

3. **Get CloudFront Domain**:
   - Example: `d123456789.cloudfront.net`

### Step 3: Create IAM User for GitHub Actions

1. **Navigate to IAM Console**:
   - Go to AWS Console → Search "IAM" → Click IAM service
   - Click "Users" in the left sidebar
   - Click "Create user" button

2. **Step 1: User Details**:
   - User name: `github-actions-deploy`
   - ✅ Check "Provide user access to the AWS Management Console" - **OPTIONAL**
   - Click "Next"

3. **Step 2: Set Permissions**:
   - Select "Attach policies directly"
   - Click "Create policy" (opens new tab)
   
   **In the new tab (Create Policy):**
   - Click "JSON" tab
   - Replace the content with the policy below
   - Click "Next: Tags" → "Next: Review"
   - Policy name: `GitHubActionsS3Deploy`
   - Click "Create policy"
   
   **Back to Create User tab:**
   - Refresh the policy list
   - Search and select `GitHubActionsS3Deploy`
   - Click "Next"

4. **Step 3: Review and Create**:
   - Review the user details
   - Click "Create user"

5. **Step 4: Create Access Keys**:
   - After user is created, click on the user name
   - Go to "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - ✅ Check the confirmation checkbox
   - Click "Next"
   - Add description: "GitHub Actions deployment"
   - Click "Create access key"
   - **IMPORTANT**: Copy and save both keys immediately!

2. **IAM Policy JSON** (use this in the policy creation step above):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:PutObjectAcl",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::your-app-name-frontend",
                   "arn:aws:s3:::your-app-name-frontend/*"
               ]
           },
           {
               "Effect": "Allow",
               "Action": [
                   "cloudfront:CreateInvalidation"
               ],
               "Resource": "*"
           }
       ]
   }
   ```
   **⚠️ Important**: Replace `your-app-name-frontend` with your actual S3 bucket name!

3. **Save Your Access Keys**:
   ```
   Access Key ID: AKIA... (copy this)
   Secret Access Key: xyz... (copy this - you won't see it again!)
   ```
   
   **Security Tips**:
   - ✅ Save keys in a secure password manager
   - ✅ Never commit keys to your repository
   - ✅ Only use these keys in GitHub Secrets
   - ❌ Don't share keys in chat/email

### Step 4: Setup Amazon RDS MySQL Database

#### 4.1: Create RDS Database

1. **Go to AWS RDS Console** (eu-north-1 region):
   - Click "Create database"
   - Choose "Standard create"
   - Engine: **MySQL** (latest version)

2. **Configure Database**:
   ```
   DB Instance Class: db.t3.micro (Free tier eligible)
   Multi-AZ: No (for cost saving)
   Storage: 20 GB GP2 (Free tier)
   Database name: gcgcm_mgt_db
   Master username: admin
   Master password: Your-Secure-Password
   ```

3. **Connectivity Settings**:
   - VPC: Default VPC
   - Subnet group: Default
   - Public access: **Yes** (for initial setup)
   - Security group: Create new → Name: `figma-db-sg`

4. **Additional Configuration**:
   - Initial database name: `gcgcm_mgt_db`
   - Enable automated backups: Yes (7 days)
   - Backup window: 03:00-04:00 UTC
   - Maintenance window: Sun 04:00-05:00 UTC

5. **Create Database** (takes 10-15 minutes)

#### 4.2: Configure Security Group

1. **Edit `figma-db-sg` Security Group**:
   - Go to EC2 → Security Groups
   - Find `figma-db-sg` 
   - Add inbound rule:
     - Type: MySQL/Aurora
     - Protocol: TCP
     - Port: 3306
     - Source: Your EC2 security group ID

#### 4.3: Setup EC2 Backend

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system and install required software
sudo apt update && sudo apt upgrade -y
sudo apt install openjdk-17-jdk git mysql-client -y

# Create application directory
sudo mkdir -p /opt/figma-web-app
sudo chown ubuntu:ubuntu /opt/figma-web-app

# Test RDS connection (replace with your RDS endpoint)
mysql -h gcgcm-mgt-db.YOUR-RANDOM-ID.eu-north-1.rds.amazonaws.com -u admin -p

# Create application.yml with RDS configuration
sudo mkdir -p /opt/figma-web-app/backend/config
sudo tee /opt/figma-web-app/backend/config/application-production.yml > /dev/null <<EOF
spring:
  datasource:
    url: jdbc:mysql://gcgcm-mgt-db.YOUR-RANDOM-ID.eu-north-1.rds.amazonaws.com:3306/gcgcm_mgt_db?useSSL=true&requireSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: admin
    password: Your-RDS-Master-Password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        jdbc:
          time_zone: UTC

server:
  port: 5001
  
logging:
  level:
    com.figma: INFO
    org.hibernate.SQL: DEBUG
EOF

# Create systemd service file
sudo tee /etc/systemd/system/figma-app.service > /dev/null <<EOF
[Unit]
Description=Figma Web App Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/figma-web-app/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production -Dspring.config.location=file:config/application-production.yml /opt/figma-web-app/backend/target/figma-web-app-backend-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable figma-app
```

### Step 5: Configure GitHub Repository Secrets

Add these secrets in **GitHub → Settings → Secrets and variables → Actions**:

**AWS Credentials:**
```
AWS_ACCESS_KEY_ID
your-iam-access-key-id

AWS_SECRET_ACCESS_KEY
your-iam-secret-access-key

AWS_REGION
eu-north-1
```
**✅ Perfect for your setup**: Your EC2 is in `eu-north-1` (Stockholm, Sweden)

**S3 Website URL for your region:**
- `http://your-bucket-name.s3-website-eu-north-1.amazonaws.com`

**Benefits of eu-north-1:**
- 🌱 **100% Renewable Energy** - Most environmentally friendly AWS region
- 💰 **Competitive Pricing** - Often cheaper than us-east-1
- 🇸🇪 **GDPR Compliant** - EU data stays in EU
- 🚀 **Great Performance** for European users

**S3 Configuration:**
```
S3_BUCKET_NAME
your-app-name-frontend

CLOUDFRONT_DISTRIBUTION_ID
E123456789ABCD (optional, for cache invalidation)

CLOUDFRONT_DOMAIN
d123456789.cloudfront.net (optional, for display)
```

**EC2 Configuration:**
```
EC2_HOST
your-ec2-public-ip

EC2_USER
ubuntu

EC2_SSH_KEY
# Paste your entire .pem file content here
# Make sure to include -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----
```

**RDS Database Configuration:**
```
RDS_ENDPOINT
gcgcm-mgt-db.YOUR-RANDOM-ID.eu-north-1.rds.amazonaws.com

RDS_DATABASE
gcgcm_mgt_db

RDS_USERNAME
admin

RDS_PASSWORD
Your-RDS-Master-Password
```

**⚠️ Important**: 
- Replace `YOUR-RANDOM-ID` with your actual RDS endpoint from AWS Console
- Use the exact master password you set when creating the RDS instance

### Step 6: Configure Frontend to Connect to EC2 Backend

You have **two options** to configure your frontend to use the EC2 backend in production:

#### Option A: Environment Variable Approach (Recommended)

1. **Create the production environment file**:
   ```bash
   cd /Users/claio/Desktop/Code/figma-web-app/frontend
   touch .env.production
   ```

2. **Add your EC2 IP to the file**:
   ```bash
   echo "VITE_API_URL=http://your-actual-ec2-ip:5001/api" > .env.production
   ```
   
   **Example with real IP**:
   ```env
   VITE_API_URL=http://13.48.45.123:5001/api
   ```

3. **Update your API config to use the environment variable**:
   
   Edit `frontend/src/config/api.js`:
   ```javascript
   // Use environment variable with fallback
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
   
   console.log('API Base URL:', API_BASE_URL); // For debugging
   
   export { API_BASE_URL };
   ```

#### Option B: Direct Code Configuration

**Edit `frontend/src/config/api.js`**:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://your-actual-ec2-ip:5001/api'  // ← Replace with real IP
  : 'http://localhost:5001/api';

console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

export { API_BASE_URL };
```

**Example with real EC2 IP**:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://13.48.45.123:5001/api'  // Production EC2 backend
  : 'http://localhost:5001/api';    // Development backend

export { API_BASE_URL };
```

#### How to Find Your EC2 IP:

1. **AWS Console Method**:
   - Go to EC2 Dashboard → Instances
   - Find your instance → Look for "Public IPv4 address"
   - Copy the IP (e.g., `13.48.45.123`)

2. **Command Line Method**:
   ```bash
   # SSH into your EC2 and run:
   curl ifconfig.me
   # This returns your public IP
   ```

3. **From Terminal** (if you have AWS CLI):
   ```bash
   aws ec2 describe-instances --region eu-north-1 \
     --query 'Reservations[].Instances[].PublicIpAddress' \
     --output text
   ```

#### Testing Your Configuration:

1. **Build and test locally**:
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Check browser console** for API URL logs

3. **Verify API calls** in Network tab point to your EC2 IP

#### Security Note for Production:

**⚠️ HTTP vs HTTPS**: Currently using HTTP for simplicity, but for production you should:
- Set up SSL certificate on EC2
- Use HTTPS URLs
- Configure proper CORS headers

### Step 7: Test the Deployment

1. **Push to trigger deployment**:
   ```bash
   git add .
   git commit -m "Setup S3 + EC2 deployment"
   git push origin main
   ```

2. **Watch GitHub Actions**:
   - Go to Actions tab in your repository
   - Watch the deployment process

3. **Verify deployment**:
   - **Frontend**: `https://your-bucket-name.s3-website-region.amazonaws.com`
   - **CloudFront**: `https://your-cloudfront-domain.cloudfront.net`
   - **Backend**: `http://your-ec2-ip/api/auth/health`

---

## 💰 Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| S3 Storage (1GB) | ~$0.023 |
| S3 Requests (10K) | ~$0.004 |
| CloudFront (optional) | $0.50 + data transfer |
| EC2 t2.micro | **FREE** (750 hours/month) |
| RDS db.t3.micro | **FREE** (750 hours/month) |
| RDS Storage (20GB) | ~$2.30 |
| Data Transfer | **FREE** (1GB/month) |
| **Total** | **$2.83/month** |

**After Free Tier (12 months):**
- EC2 t2.micro: ~$8.50/month
- RDS db.t3.micro: ~$12.50/month  
- **Total: ~$24/month**

---

## 🔧 How It Works

### Deployment Process:

1. **Frontend Deployment**:
   - ✅ Build React app with production API URL
   - ✅ Upload to S3 bucket
   - ✅ Invalidate CloudFront cache (optional)

2. **Backend Deployment**:
   - ✅ SSH into EC2 instance
   - ✅ Update code from GitHub
   - ✅ Build Spring Boot application
   - ✅ Restart backend service
   - ✅ Update CORS to allow S3 domain

### Architecture:
```
Users → CloudFront (CDN) → S3 (Frontend)
Users → EC2 (Backend API) ← Frontend (API calls)
```

---

## 🚨 Troubleshooting

### Frontend Issues:

**1. S3 Website Not Working**
```bash
# Check bucket policy allows public read
# Verify static website hosting is enabled
# Check if index.html is in bucket root
```

**2. CORS Errors**
```bash
# Make sure backend CORS includes your S3 domain
# Check browser network tab for exact error
```

**3. CloudFront Issues**
```bash
# Wait 5-15 minutes for distribution to deploy
# Check if error pages are configured for React Router
```

### Backend Issues:

**4. Backend Service Won't Start - RDS Connection**
```bash
# Check RDS connectivity from EC2
mysql -h your-rds-endpoint.eu-north-1.rds.amazonaws.com -u admin -p

# If connection fails, check:
# 1. RDS Security Group allows EC2 access
# 2. RDS is in same VPC as EC2 (or publicly accessible)
# 3. RDS endpoint is correct

# Test with telnet
telnet your-rds-endpoint.eu-north-1.rds.amazonaws.com 3306
```

**5. Backend Service Won't Start - General**
```bash
# SSH into EC2 and check logs
sudo journalctl -u figma-app -f
sudo systemctl status figma-app

# Check application logs for database errors
sudo journalctl -u figma-app --no-pager | grep -i "database\|mysql\|connection"
```

**6. API Not Accessible**
```bash
# Check EC2 security group allows port 5001
# Verify service is running on correct port
curl http://localhost:5001/api/auth/health
```

**7. RDS Performance Issues**
```bash
# Monitor RDS in AWS Console:
# - CPU utilization
# - Database connections
# - Read/Write latency
# - Free storage space
```

---

## 🎯 Production Enhancements

### Security:
- **Custom Domain**: Route53 + SSL certificate
- **API Domain**: Use Application Load Balancer for HTTPS
- **WAF**: Web Application Firewall protection

### Performance:
- **Gzip Compression**: Enable on CloudFront
- **HTTP/2**: Automatic with CloudFront
- **API Caching**: CloudFront + API Gateway

### Monitoring:
- **CloudWatch**: Monitor S3, CloudFront, EC2
- **Alerts**: Set up deployment failure notifications
- **Logs**: Centralized logging with CloudWatch Logs

---

## 🌟 Benefits Summary

✅ **Scalable**: S3 handles any traffic volume  
✅ **Fast**: Global CDN distribution  
✅ **Cheap**: Pay only for what you use  
✅ **Reliable**: AWS 99.9%+ uptime  
✅ **Secure**: Separate concerns, proper CORS  
✅ **Automated**: Push to deploy  

This setup gives you production-ready hosting that can scale to millions of users! 🚀
