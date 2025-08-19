#!/bin/bash

# Simple Domain Helper - Basic AWS Console Preparation
# This script creates basic AWS resources that you can then configure via AWS Console
# Follow DOMAIN_SETUP_GUIDE.md for complete AWS Console instructions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Simple Domain Setup Helper${NC}"
echo -e "${BLUE}=============================${NC}"
echo "This script creates basic AWS resources."
echo "Follow DOMAIN_SETUP_GUIDE.md for complete AWS Console setup."
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install it from: https://aws.amazon.com/cli/${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Run: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI ready${NC}"

# Get domain name
read -p "Enter your domain name (e.g., mydomain.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}❌ Domain name required${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Will create resources for: ${DOMAIN_NAME}${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo -e "${YELLOW}🔨 Creating basic resources...${NC}"

# Create main S3 bucket
echo "📦 Creating S3 bucket: $DOMAIN_NAME"
if aws s3 mb "s3://$DOMAIN_NAME" --region us-east-1 2>/dev/null; then
    echo -e "${GREEN}✅ Created bucket: $DOMAIN_NAME${NC}"
else
    echo -e "${YELLOW}⚠️ Bucket exists or error occurred${NC}"
fi

# Create www bucket
echo "📦 Creating S3 bucket: www.$DOMAIN_NAME"
if aws s3 mb "s3://www.$DOMAIN_NAME" --region us-east-1 2>/dev/null; then
    echo -e "${GREEN}✅ Created bucket: www.$DOMAIN_NAME${NC}"
else
    echo -e "${YELLOW}⚠️ WWW bucket exists or error occurred${NC}"
fi

# Allocate Elastic IP
echo "🌍 Allocating Elastic IP for backend..."
if ELASTIC_IP=$(aws ec2 allocate-address --domain vpc --query 'PublicIp' --output text 2>/dev/null); then
    ALLOCATION_ID=$(aws ec2 describe-addresses --public-ips "$ELASTIC_IP" --query 'Addresses[0].AllocationId' --output text)
    echo -e "${GREEN}✅ Elastic IP allocated: $ELASTIC_IP${NC}"
    echo -e "${BLUE}   Allocation ID: $ALLOCATION_ID${NC}"
else
    echo -e "${RED}❌ Failed to allocate Elastic IP${NC}"
fi

# Create simple deployment script
cat > deploy-frontend-simple.sh << EOF
#!/bin/bash
# Simple frontend deployment for $DOMAIN_NAME

echo "Building frontend..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://$DOMAIN_NAME --delete

echo "✅ Deployed to S3!"
echo "🌐 Test URL: http://$DOMAIN_NAME.s3-website-us-east-1.amazonaws.com"
EOF

chmod +x deploy-frontend-simple.sh

# Create checklist
cat > aws-console-checklist.md << EOF
# AWS Console Setup Checklist for $DOMAIN_NAME

## ✅ Completed by Script
- [x] S3 bucket: $DOMAIN_NAME
- [x] S3 bucket: www.$DOMAIN_NAME  
- [x] Elastic IP: $ELASTIC_IP (Allocation: $ALLOCATION_ID)
- [x] Simple deployment script: deploy-frontend-simple.sh

## 🔧 Complete in AWS Console

### 1. Certificate Manager (us-east-1 region)
- [ ] Request certificate for $DOMAIN_NAME and www.$DOMAIN_NAME
- [ ] Use DNS validation
- [ ] Add CNAME records to your DNS provider

### 2. S3 Configuration
- [ ] Enable static website hosting on $DOMAIN_NAME bucket
  - Index: index.html
  - Error: index.html
- [ ] Set bucket policy for public read access
- [ ] Configure www.$DOMAIN_NAME bucket to redirect to main domain

### 3. CloudFront Distribution  
- [ ] Create distribution with S3 website endpoint as origin
- [ ] Add custom domains: $DOMAIN_NAME, www.$DOMAIN_NAME
- [ ] Select your SSL certificate
- [ ] Set price class to North America & Europe only

### 4. EC2 Backend
- [ ] Associate Elastic IP ($ELASTIC_IP) with your EC2 instance
- [ ] Update security groups (allow HTTP/HTTPS)
- [ ] Install SSL certificate for api.$DOMAIN_NAME

### 5. DNS Records
Add these records at your DNS provider:

\`\`\`
Type: A or CNAME
Name: @
Value: [Your CloudFront domain]

Type: CNAME  
Name: www
Value: $DOMAIN_NAME

Type: A
Name: api
Value: $ELASTIC_IP
\`\`\`

### 6. Code Updates
Update your CORS configuration:
\`\`\`java
"https://$DOMAIN_NAME",
"https://www.$DOMAIN_NAME"
\`\`\`

Update your API URL:
\`\`\`javascript
production: {
  API_BASE_URL: 'https://api.$DOMAIN_NAME/api'
}
\`\`\`

## 🧪 Testing
- [ ] Visit https://$DOMAIN_NAME (should load with SSL)
- [ ] Visit https://www.$DOMAIN_NAME (should redirect)
- [ ] Test API: https://api.$DOMAIN_NAME/api/health
- [ ] Check browser console for CORS errors

## 📚 Resources  
- Full guide: DOMAIN_SETUP_GUIDE.md
- AWS Console: https://console.aws.amazon.com/
- Certificate Manager: https://console.aws.amazon.com/acm/
- S3: https://console.aws.amazon.com/s3/
- CloudFront: https://console.aws.amazon.com/cloudfront/
EOF

echo ""
echo -e "${GREEN}🎉 Basic setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Created:${NC}"
echo "   ✅ S3 buckets for $DOMAIN_NAME"
echo "   ✅ Elastic IP: $ELASTIC_IP"
echo "   ✅ deploy-frontend-simple.sh"
echo "   ✅ aws-console-checklist.md"
echo ""
echo -e "${YELLOW}📖 Next Steps:${NC}"
echo "1. Follow aws-console-checklist.md"
echo "2. Read DOMAIN_SETUP_GUIDE.md for detailed instructions"
echo "3. Complete setup in AWS Console"
echo ""
echo -e "${BLUE}💡 Tip: Start with Certificate Manager in us-east-1 region${NC}"
