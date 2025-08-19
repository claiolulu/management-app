# Domain Setup Guide - AWS Console Step-by-Step

## Overview
This guide shows how to use your own domain with S3 (frontend) and EC2 (backend) using the AWS Console UI while minimizing costs.

## Architecture
```
Your Domain (yourdomain.com)
├── Frontend: yourdomain.com → S3 Static Website → CloudFront
├── API: api.yourdomain.com → EC2 Backend
└── SSL: Free SSL certificates via AWS Certificate Manager
```

## Cost-Effective Setup Options

### Option 1: Route 53 + CloudFront (Recommended - Easy Setup)
**Monthly Cost: ~$2-5**
- Route 53 Hosted Zone: $0.50/month
- CloudFront: Free tier (1TB/month), then $0.085/GB
- SSL Certificates: FREE via AWS Certificate Manager
- Data Transfer: Minimal for small apps

### Option 2: External DNS + CloudFront (Cheapest)
**Monthly Cost: ~$1-3**
- Keep your domain registrar's DNS (Namecheap, GoDaddy, etc.)
- Only use CloudFront for SSL and caching

## Regional Requirements Explained

### What MUST be in US East (N. Virginia):
- ✅ **SSL Certificates for CloudFront** - AWS requirement
- ✅ **CloudFront Distribution creation** - Can be created from any region but managed globally

### What CAN be in ANY region:
- ✅ **S3 Buckets** - Choose region close to your users for better performance
- ✅ **EC2 Instances** - Choose based on your location/users
- ✅ **Application Load Balancers** - Same region as your EC2
- ✅ **SSL Certificates for ALB/EC2** - Must be in same region as your resources

### Regional Strategy for Cost & Performance:
- **S3**: Choose a region near your main user base (e.g., Europe users → eu-west-1)
- **EC2**: Same region as S3 for lower data transfer costs
- **SSL for CloudFront**: Must be us-east-1 (AWS limitation)
- **CloudFront**: Global CDN, so region doesn't matter

## Step-by-Step AWS Console Implementation

### Step 1: Choose Your DNS Strategy

#### Option A: Using Route 53 (Easier, slightly more expensive)

**1. Create Route 53 Hosted Zone:**
- Go to AWS Console → Route 53 → Hosted zones
- Click "Create hosted zone"
- Enter your domain name (e.g., `yourdomain.com`)
- Choose "Public hosted zone"
- Click "Create hosted zone"
- **Important**: Copy the 4 nameserver (NS) records shown

**2. Update Your Domain Registrar:**
- Login to your domain registrar (GoDaddy, Namecheap, etc.)
- Find "DNS Management" or "Nameservers" section
- Replace the current nameservers with the 4 NS records from Route 53
- Save changes (can take 24-48 hours to propagate)

#### Option B: Using External DNS (Cheaper)
- Keep your current DNS provider
- Skip Route 53 setup
- You'll create DNS records directly at your registrar later

### Step 2: Request SSL Certificate (Do This FIRST!)

**⚠️ IMPORTANT: Only SSL certificates for CloudFront must be in US East (N. Virginia)**

1. **Switch to US East (N. Virginia) for SSL Certificate:**
   - Click region dropdown (top-right corner)
   - Select "US East (N. Virginia) us-east-1"

2. **Request Certificate:**
   - Go to AWS Console → Certificate Manager
   - Click "Request a certificate"
   - Choose "Request a public certificate" → Next
   - **Domain names**: Add both:
     - `yourdomain.com`
     - `www.yourdomain.com`
   - Validation method: Choose "DNS validation"
   - Click "Request"

3. **Validate Certificate:**
   - Click on the certificate (Status: Pending validation)
   - Click "Create records in Route 53" (if using Route 53)
   - OR copy the CNAME records and add them to your external DNS
   - Wait for status to change to "Issued" (can take 5-30 minutes)

### Step 3: S3 Frontend Setup

#### 1. Create S3 Bucket for Static Website

1. **Create Main Bucket:**
   - Go to AWS Console → S3
   - Click "Create bucket"
   - **Bucket name**: `yourdomain.com` (must exactly match your domain)
   - **Region**: Choose your preferred region (can be any region - NOT required to be us-east-1)
   - **Recommendation**: Choose a region close to your users for better performance
   - **Uncheck** "Block all public access"
   - Check the acknowledgment box
   - Click "Create bucket"

2. **Enable Static Website Hosting:**
   - Click on your bucket → Properties tab
   - Scroll to "Static website hosting"
   - Click "Edit"
   - Select "Enable"
   - **Index document**: `index.html`
   - **Error document**: `index.html` (for React Router)
   - Click "Save changes"
   - **Copy the endpoint URL** (you'll need it later)

3. **Set Bucket Policy for Public Access:**
   - Go to Permissions tab → Bucket policy
   - Click "Edit"
   - Paste this policy (replace `yourdomain.com` with your bucket name):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::yourdomain.com/*"
           }
       ]
   }
   ```
   - Click "Save changes"

#### 2. Create WWW Redirect Bucket (Optional but Recommended)

1. **Create WWW Bucket:**
   - Create another bucket named `www.yourdomain.com`
   - **Don't need to unblock public access** for this one

2. **Set Up Redirect:**
   - Click on www bucket → Properties → Static website hosting
   - Select "Redirect requests for an object"
   - **Host name**: `yourdomain.com`
   - **Protocol**: `https`
   - Click "Save changes"

### Step 4: CloudFront Distribution Setup

**⚠️ Make sure you're still in US East (N. Virginia) region for SSL certificate selection**

1. **Create CloudFront Distribution:**
   - Go to AWS Console → CloudFront → Distributions
   - Click "Create distribution"

2. **Origin Settings:**
   - **Origin domain**: Click in field, select your S3 bucket
   - **Origin path**: Leave empty
   - **Name**: Keep default
   - **Origin access**: Choose "Origin access control settings (recommended)"
   - Click "Create control setting"
     - Name: `yourdomain-oac`
     - Sign requests: Yes
     - Click "Create"

3. **Default Cache Behavior:**
   - **Viewer protocol policy**: "Redirect HTTP to HTTPS"
   - **Allowed HTTP methods**: "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE"
   - **Cache policy**: "CachingOptimized"
   - **Origin request policy**: "None"

4. **Settings:**
   - **Price class**: "Use only North America and Europe" (cheaper)
   - **Alternate domain names (CNAMEs)**: Add both:
     - `yourdomain.com`
     - `www.yourdomain.com`
   - **Custom SSL certificate**: Select your certificate from dropdown
   - **Default root object**: `index.html`

5. **Create Distribution:**
   - Click "Create distribution"
   - **Wait 5-15 minutes** for deployment
   - **Copy the distribution domain name** (e.g., `d123abc456.cloudfront.net`)

6. **Update S3 Bucket Policy (Important!):**
   - After CloudFront is deployed, you'll see a blue banner
   - Click "Copy policy" and update your S3 bucket policy
   - Go back to S3 → your bucket → Permissions → Bucket policy
   - Replace the policy with the new one provided by CloudFront

### Step 5: EC2 Backend Domain Setup

#### Option A: Direct EC2 with Elastic IP (Simple & Cost-Effective)

1. **Allocate Elastic IP:**
   - Go to AWS Console → EC2 → Elastic IPs
   - Click "Allocate Elastic IP address"
   - Click "Allocate"
   - **Copy the IP address**

2. **Associate with EC2 Instance:**
   - Select the Elastic IP
   - Click "Actions" → "Associate Elastic IP address"
   - **Instance**: Select your backend EC2 instance
   - Click "Associate"

3. **Configure Security Group:**
   - Go to EC2 → Security Groups
   - Select your instance's security group
   - **Inbound rules** should include:
     - Type: HTTP, Port: 80, Source: 0.0.0.0/0
     - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
     - Type: Custom TCP, Port: 8080, Source: 0.0.0.0/0 (your app port)

#### Option B: Application Load Balancer (Production-Ready)

1. **Create Application Load Balancer:**
   - Go to EC2 → Load Balancers
   - Click "Create Load Balancer" → "Application Load Balancer"
   - **Name**: `api-yourdomain`
   - **Internet-facing** scheme
   - **IP address type**: IPv4
   - **VPC**: Select your VPC
   - **Mappings**: Select at least 2 availability zones

2. **Create Target Group:**
   - **Target type**: Instances
   - **Protocol**: HTTP, Port: 8080
   - **Health check path**: `/api/health`
   - Register your EC2 instance
   - Click "Create target group"

3. **Complete Load Balancer Setup:**
   - **Security groups**: Create/select one that allows HTTP/HTTPS
   - **Listeners**: HTTP:80 → forward to your target group
   - Click "Create load balancer"

### Step 6: DNS Configuration

#### If Using Route 53:

1. **Main Domain (Frontend):**
   - Go to Route 53 → Hosted zones → your domain
   - Click "Create record"
   - **Record name**: Leave empty (for root domain)
   - **Record type**: A
   - **Alias**: Yes
   - **Route traffic to**: CloudFront distribution
   - Select your CloudFront distribution
   - Click "Create records"

2. **WWW Subdomain:**
   - Create another record
   - **Record name**: `www`
   - **Record type**: CNAME
   - **Value**: `yourdomain.com`
   - Click "Create records"

3. **API Subdomain (Backend):**
   - Create another record
   - **Record name**: `api`
   - **Record type**: A
   - **Value**: Your Elastic IP address (or Alias to Load Balancer)
   - Click "Create records"

#### If Using External DNS Provider:

Add these records at your domain registrar:

```
Type: A (or CNAME)
Name: @ (root)
Value: your-cloudfront-domain.cloudfront.net
TTL: 300

Type: CNAME
Name: www
Value: yourdomain.com
TTL: 300

Type: A
Name: api
Value: [Your EC2 Elastic IP]
TTL: 300
```

### Step 7: SSL Setup for Backend (EC2)

#### Option A: Let's Encrypt with Certbot (Recommended - FREE)

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@api.yourdomain.com
   ```

2. **Install Certbot:**
   ```bash
   sudo apt update
   sudo apt install snapd
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

3. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```
   - Follow the prompts
   - Choose to redirect HTTP to HTTPS

4. **Test Auto-Renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

#### Option B: AWS Certificate Manager (If using Load Balancer)

1. **Request Certificate for API:**
   - Go to Certificate Manager (in your region, not us-east-1)
   - Click "Request a certificate"
   - **Domain name**: `api.yourdomain.com`
   - Validation: DNS validation
   - Click "Request"

2. **Validate Certificate:**
   - Add the CNAME record to your DNS
   - Wait for "Issued" status

3. **Add HTTPS Listener to Load Balancer:**
   - Go to EC2 → Load Balancers → your ALB
   - Click "Listeners" tab → "Add listener"
   - **Protocol**: HTTPS, Port: 443
   - **Default actions**: Forward to your target group
   - **SSL certificate**: Select your certificate
   - Click "Add"

## AWS Console Navigation Quick Reference

### Key AWS Services Locations:
- **Route 53**: AWS Console → Route 53 → Hosted zones
- **Certificate Manager**: AWS Console → Certificate Manager (us-east-1 for CloudFront)
- **S3**: AWS Console → S3 → Buckets
- **CloudFront**: AWS Console → CloudFront → Distributions
- **EC2**: AWS Console → EC2 → Instances/Elastic IPs/Load Balancers

### Important Notes:
- **SSL certificates for CloudFront**: Must be in us-east-1 region
- **S3 buckets**: Can be in any region (choose one close to your users)
- **SSL certificates for ALB**: Must be in same region as your EC2
- **DNS propagation**: Can take up to 48 hours
- **CloudFront deployment**: Takes 5-15 minutes

## Cost Optimization Tips (AWS Console)

### 1. S3 Cost Reduction

1. **Enable Intelligent Tiering:**
   - Go to S3 → your bucket → Management tab
   - Click "Create lifecycle rule"
   - **Name**: `intelligent-tiering`
   - **Rule scope**: Apply to all objects
   - **Lifecycle rule actions**: Check "Transition current versions"
   - **Transition current versions**: 
     - Days after object creation: 0
     - Storage class: Intelligent-Tiering
   - Click "Create rule"

2. **Enable Compression:**
   - In your build process, compress files before upload
   - CloudFront will serve compressed files automatically

### 2. CloudFront Cost Reduction

1. **Set Cache Behaviors:**
   - Go to CloudFront → your distribution → Behaviors tab
   - Edit default behavior
   - **Cache policy**: Use "Managed-CachingOptimized"
   - **Compress objects automatically**: Yes

2. **Price Class:**
   - Edit distribution → General tab
   - **Price class**: "Use only North America and Europe"

### 3. EC2 Cost Reduction

1. **Instance Type:**
   - Use t3.micro (free tier) or t3.small
   - Consider t3.nano for very small apps

2. **Reserved Instances:**
   - Go to EC2 → Reserved Instances
   - Purchase 1-year term for 24/7 workloads

3. **Stop/Start Schedule:**
   - Use AWS Systems Manager to schedule stop/start for development environments

## Testing Your Setup (Browser-Based)

### 1. Test Frontend
- Visit `https://yourdomain.com` - should load your app with SSL
- Visit `https://www.yourdomain.com` - should redirect to main domain
- Check SSL certificate (click lock icon in browser)

### 2. Test Backend
- Visit `https://api.yourdomain.com/api/health` (or your health endpoint)
- Should return JSON response with SSL

### 3. Test CORS
- Open browser developer tools (F12)
- Load your frontend
- Check Network tab for API calls
- Should see successful API calls without CORS errors

## Frontend Configuration Updates

### 1. Update API Configuration in Your Code

**File**: `frontend/src/config/api.js` (or wherever your API config is)

```javascript
const API_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api'
  },
  production: {
    API_BASE_URL: 'https://api.yourdomain.com/api'
  }
};

export const API_BASE_URL = API_CONFIG[process.env.NODE_ENV || 'development'].API_BASE_URL;
```

### 2. Update CORS Configuration in Backend

**File**: `backend/src/main/java/com/figma/webapp/config/CorsConstants.java`

Replace the existing ALLOWED_ORIGINS with your domain:

```java
public static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    "https://yourdomain.com",
    "https://www.yourdomain.com", 
    "http://localhost:3000",
    "http://localhost:5173"
);
```

### 3. Build Configuration

**File**: `frontend/package.json`

Update your build script to set production environment:

```json
{
  "scripts": {
    "build": "NODE_ENV=production vite build",
    "build:staging": "NODE_ENV=staging vite build"
  }
}
```

## Easy Deployment Scripts (AWS Console + Scripts)

### Frontend Deployment Script

**File**: `deploy-frontend.sh`

```bash
#!/bin/bash

# Configuration - UPDATE THESE VALUES
BUCKET_NAME="yourdomain.com"
CLOUDFRONT_DISTRIBUTION_ID="E123456789ABCD"  # Get from CloudFront console

echo "Building frontend..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "✅ Frontend deployed successfully!"
echo "🌐 Visit: https://yourdomain.com"
```

### Backend Deployment (Update Your Existing)

**File**: Update your existing `deploy-backend.yml`

Add these environment variables:
```yaml
env:
  BACKEND_DOMAIN: api.yourdomain.com
  CORS_ALLOWED_ORIGINS: "https://yourdomain.com,https://www.yourdomain.com"
```

## Manual Deployment Steps (Using AWS Console)

### Deploy Frontend:

1. **Build Your Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3 (via Console):**
   - Go to S3 → your bucket
   - Click "Upload"
   - Drag & drop all files from `dist/` folder
   - Make sure to upload to root level (not in a subfolder)
   - Click "Upload"

3. **Invalidate CloudFront:**
   - Go to CloudFront → your distribution
   - Click "Invalidations" tab
   - Click "Create invalidation"
   - **Object paths**: `/*`
   - Click "Create invalidation"

### Deploy Backend:
- Use your existing GitHub Actions workflow
- Or manually deploy to EC2 as you currently do

## Monthly Cost Breakdown (Realistic Examples)

### Small App (< 1000 users/month):
- **Route 53 Hosted Zone**: $0.50/month
- **S3 Storage (5GB)**: $0.115/month
- **S3 Requests (50K)**: $0.02/month
- **CloudFront (10GB)**: FREE (within free tier)
- **EC2 t3.micro**: FREE (within free tier) or $8.76/month
- **Elastic IP**: $0 (free while attached)
- **SSL Certificates**: FREE
- **Total**: ~$0.64/month (with free tier) or ~$9.40/month

### Medium App (< 10000 users/month):
- **Route 53**: $0.50/month
- **S3 Storage (50GB)**: $1.15/month  
- **S3 Requests (500K)**: $0.20/month
- **CloudFront (100GB)**: $8.50/month
- **EC2 t3.small**: $16.79/month
- **Total**: ~$27/month

### Cost-Saving Tips:
1. **Use AWS Free Tier** (12 months for new accounts)
2. **External DNS instead of Route 53** (save $0.50/month)
3. **Reserved Instances** for EC2 (up to 72% savings)
4. **CloudFront only for SSL** (minimal caching to reduce data transfer costs)

## Troubleshooting Common Issues

### SSL Certificate Issues:
- **Problem**: Certificate shows "Pending validation"
- **Solution**: Check DNS records are created correctly, wait up to 30 minutes

### CloudFront Issues:
- **Problem**: Website shows S3 bucket content instead of website
- **Solution**: Use S3 website endpoint as origin, not bucket endpoint

### CORS Issues:
- **Problem**: API calls fail with CORS errors
- **Solution**: Update CorsConstants.java with your new domain, redeploy backend

### DNS Issues:
- **Problem**: Domain doesn't resolve
- **Solution**: Check nameservers at registrar match Route 53, wait up to 48 hours

## Security Best Practices (AWS Console Settings)

### 1. S3 Bucket Security:
- **Bucket policy**: Only allow CloudFront access (use OAC)
- **Block public access**: Enable after CloudFront setup
- **Versioning**: Enable for backup

### 2. CloudFront Security:
- **HTTPS only**: Redirect HTTP to HTTPS
- **Security headers**: Add via Lambda@Edge or response headers policies
- **Access logs**: Enable for monitoring

### 3. EC2 Security:
- **Security groups**: Only allow necessary ports (80, 443, 22)
- **SSH access**: Restrict to your IP only
- **Updates**: Keep OS and software updated

### 4. Route 53 Security:
- **DNSSEC**: Enable for domain security
- **Health checks**: Set up for monitoring

## Success Checklist

- [ ] SSL certificate issued for both domains
- [ ] CloudFront distribution deployed and working
- [ ] S3 bucket serving static files
- [ ] DNS records pointing to correct resources
- [ ] Backend accessible via api.yourdomain.com
- [ ] CORS working between frontend and backend
- [ ] Both domains redirect HTTP to HTTPS
- [ ] No console errors in browser developer tools

## Getting Help

### AWS Support Resources:
- **AWS Documentation**: docs.aws.amazon.com
- **AWS Forums**: forums.aws.amazon.com
- **AWS Support**: Create support case in AWS Console

### Useful AWS Console Links:
- **Cost Explorer**: Monitor your AWS costs
- **CloudWatch**: Monitor performance and logs  
- **IAM**: Manage access and permissions
- **Billing Dashboard**: Track usage and costs

This guide gives you a professional domain setup while keeping costs minimal! 🚀
