#!/bin/bash
# Frontend Deployment Script

echo "🎨 Building and deploying frontend to S3..."

# Configuration
BUCKET_NAME="your-domain.com"
DISTRIBUTION_ID="your-cloudfront-distribution-id"

# Build the application
cd /Users/claio/Desktop/Code/figma-web-app/frontend
npm run build

# Upload to S3
echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete --cache-control "no-cache" --exclude "*.map"

# Set cache headers for static assets
aws s3 cp s3://$BUCKET_NAME/assets/ s3://$BUCKET_NAME/assets/ --recursive --metadata-directive REPLACE --cache-control "max-age=31536000"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Frontend deployment complete!"
echo "🌐 Visit: https://$BUCKET_NAME"
