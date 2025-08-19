#!/bin/bash
# setup-domain.sh - Interactive script to configure your domain with AWS

set -e

echo "🌐 Domain Setup for S3 + EC2 Configuration"
echo "=========================================="

# Get user input
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME
read -p "Enter your AWS region (e.g., us-east-1): " AWS_REGION
read -p "Enter your EC2 instance ID: " EC2_INSTANCE_ID
read -p "Use Route 53 for DNS? (y/n): " USE_ROUTE53

# Validate inputs
if [[ -z "$DOMAIN_NAME" || -z "$AWS_REGION" || -z "$EC2_INSTANCE_ID" ]]; then
    echo "❌ Error: All fields are required"
    exit 1
fi

echo "📋 Configuration:"
echo "Domain: $DOMAIN_NAME"
echo "Region: $AWS_REGION"
echo "EC2 Instance: $EC2_INSTANCE_ID"
echo "Route 53: $USE_ROUTE53"
echo ""

read -p "Continue with this configuration? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
    echo "Setup cancelled"
    exit 0
fi

echo "🚀 Starting domain setup..."

# Step 1: Create S3 bucket for static website
echo "📦 Creating S3 bucket: $DOMAIN_NAME"
aws s3 mb "s3://$DOMAIN_NAME" --region "$AWS_REGION" || echo "Bucket already exists"

# Configure static website hosting
echo "🌐 Configuring static website hosting"
aws s3 website "s3://$DOMAIN_NAME" --index-document index.html --error-document index.html

# Set bucket policy for public read
echo "🔓 Setting bucket policy for public read"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$DOMAIN_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$DOMAIN_NAME" --policy file:///tmp/bucket-policy.json

# Step 2: Create www redirect bucket (optional)
echo "📦 Creating www redirect bucket"
aws s3 mb "s3://www.$DOMAIN_NAME" --region "$AWS_REGION" || echo "WWW bucket already exists"
aws s3 website "s3://www.$DOMAIN_NAME" --redirect-all-requests-to "$DOMAIN_NAME"

# Step 3: Get/Create Elastic IP for EC2
echo "🖥️  Setting up Elastic IP for EC2"
ELASTIC_IP=$(aws ec2 describe-addresses --filters "Name=instance-id,Values=$EC2_INSTANCE_ID" --query 'Addresses[0].PublicIp' --output text)

if [[ "$ELASTIC_IP" == "None" ]]; then
    echo "Creating new Elastic IP"
    ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
    aws ec2 associate-address --instance-id "$EC2_INSTANCE_ID" --allocation-id "$ALLOCATION_ID"
    ELASTIC_IP=$(aws ec2 describe-addresses --allocation-ids "$ALLOCATION_ID" --query 'Addresses[0].PublicIp' --output text)
fi

echo "✅ EC2 Elastic IP: $ELASTIC_IP"

# Step 4: Request SSL certificates
echo "🔒 Requesting SSL certificates from ACM"
CERT_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN_NAME" \
    --subject-alternative-names "www.$DOMAIN_NAME" "api.$DOMAIN_NAME" \
    --validation-method DNS \
    --region us-east-1 \
    --query 'CertificateArn' --output text)

echo "✅ Certificate requested: $CERT_ARN"

# Step 5: Create CloudFront distribution
echo "☁️  Creating CloudFront distribution"
S3_WEBSITE_ENDPOINT="$DOMAIN_NAME.s3-website-$AWS_REGION.amazonaws.com"

cat > /tmp/cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "Frontend distribution for $DOMAIN_NAME",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$DOMAIN_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {"Forward": "none"}
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "SmoothStreaming": false,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$DOMAIN_NAME",
                "DomainName": "$S3_WEBSITE_ENDPOINT",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only",
                    "OriginSslProtocols": {
                        "Quantity": 1,
                        "Items": ["TLSv1.2"]
                    }
                }
            }
        ]
    },
    "Enabled": true,
    "Aliases": {
        "Quantity": 2,
        "Items": ["$DOMAIN_NAME", "www.$DOMAIN_NAME"]
    },
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json --query 'Distribution.Id' --output text)
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)

echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
echo "✅ CloudFront domain: $CLOUDFRONT_DOMAIN"

# Step 6: Setup Route 53 (if chosen)
if [[ "$USE_ROUTE53" == "y" ]]; then
    echo "🌐 Setting up Route 53 hosted zone"
    
    # Create hosted zone
    HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
        --name "$DOMAIN_NAME" \
        --caller-reference "$(date +%s)" \
        --query 'HostedZone.Id' --output text | cut -d'/' -f3)
    
    # Get nameservers
    NAMESERVERS=$(aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" --query 'DelegationSet.NameServers' --output text)
    
    echo "✅ Hosted zone created: $HOSTED_ZONE_ID"
    echo "📝 Update these nameservers at your domain registrar:"
    echo "$NAMESERVERS" | tr '\t' '\n'
    echo ""
    
    # Wait for user to update nameservers
    read -p "Press Enter after you've updated the nameservers at your registrar..."
    
    # Create DNS records
    echo "📝 Creating DNS records"
    
    # A record for main domain (CloudFront alias)
    aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "{
        \"Changes\": [{
            \"Action\": \"CREATE\",
            \"ResourceRecordSet\": {
                \"Name\": \"$DOMAIN_NAME\",
                \"Type\": \"A\",
                \"AliasTarget\": {
                    \"DNSName\": \"$CLOUDFRONT_DOMAIN\",
                    \"EvaluateTargetHealth\": false,
                    \"HostedZoneId\": \"Z2FDTNDATAQYW2\"
                }
            }
        }]
    }"
    
    # CNAME for www
    aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "{
        \"Changes\": [{
            \"Action\": \"CREATE\",
            \"ResourceRecordSet\": {
                \"Name\": \"www.$DOMAIN_NAME\",
                \"Type\": \"A\",
                \"AliasTarget\": {
                    \"DNSName\": \"$CLOUDFRONT_DOMAIN\",
                    \"EvaluateTargetHealth\": false,
                    \"HostedZoneId\": \"Z2FDTNDATAQYW2\"
                }
            }
        }]
    }"
    
    # A record for API subdomain
    aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "{
        \"Changes\": [{
            \"Action\": \"CREATE\",
            \"ResourceRecordSet\": {
                \"Name\": \"api.$DOMAIN_NAME\",
                \"Type\": \"A\",
                \"TTL\": 300,
                \"ResourceRecords\": [{\"Value\": \"$ELASTIC_IP\"}]
            }
        }]
    }"
    
    echo "✅ DNS records created"
else
    echo "📝 Manual DNS setup required:"
    echo "Create these records with your DNS provider:"
    echo ""
    echo "Type: A"
    echo "Name: @ (root domain)"
    echo "Value: $CLOUDFRONT_DOMAIN (or use CNAME)"
    echo ""
    echo "Type: CNAME"
    echo "Name: www"
    echo "Value: $DOMAIN_NAME"
    echo ""
    echo "Type: A"
    echo "Name: api"
    echo "Value: $ELASTIC_IP"
fi

# Step 7: Generate configuration files
echo "📄 Generating configuration files"

# Frontend config
mkdir -p frontend/src/config
cat > frontend/src/config/api.js << EOF
// Auto-generated API configuration for $DOMAIN_NAME

const API_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api'
  },
  production: {
    API_BASE_URL: 'https://api.$DOMAIN_NAME/api'
  }
};

export const API_BASE_URL = API_CONFIG[process.env.NODE_ENV || 'development'].API_BASE_URL;
EOF

# Backend CORS config
cat > backend-cors-update.java << EOF
// Update your CorsConstants.java with these values:

public static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    "https://$DOMAIN_NAME",
    "https://www.$DOMAIN_NAME",
    "http://localhost:3000",
    "http://localhost:5173"
);
EOF

# Deployment script
cat > deploy-frontend.sh << EOF
#!/bin/bash
# Frontend deployment script for $DOMAIN_NAME

set -e

echo "🚀 Deploying frontend to $DOMAIN_NAME"

# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://$DOMAIN_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Frontend deployed successfully!"
EOF

chmod +x deploy-frontend.sh

echo ""
echo "🎉 Domain setup completed!"
echo "=========================="
echo "Frontend URL: https://$DOMAIN_NAME"
echo "API URL: https://api.$DOMAIN_NAME"
echo "CloudFront Distribution: $DISTRIBUTION_ID"
echo "EC2 Elastic IP: $ELASTIC_IP"
echo ""
echo "📋 Next steps:"
echo "1. Wait for SSL certificate validation (check AWS Console)"
echo "2. Update CloudFront distribution with SSL certificate"
echo "3. Update your backend CORS configuration (see backend-cors-update.java)"
echo "4. Deploy your frontend using: ./deploy-frontend.sh"
echo "5. Test your setup!"
echo ""
echo "💰 Estimated monthly cost: $2-5 USD"

# Cleanup temp files
rm -f /tmp/bucket-policy.json /tmp/cloudfront-config.json
