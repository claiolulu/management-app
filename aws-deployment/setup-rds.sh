#!/bin/bash
# RDS MySQL Database Setup

echo "🗄️ Setting up RDS MySQL Database..."

# Create RDS MySQL instance (using AWS CLI)
aws rds create-db-instance \
    --db-instance-identifier figma-app-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-your-security-group-id \
    --db-subnet-group-name your-db-subnet-group \
    --backup-retention-period 7 \
    --multi-az false \
    --storage-encrypted true \
    --enable-performance-insights \
    --deletion-protection false \
    --db-name figma_app

echo "⏳ RDS instance is being created..."
echo "📝 Note down the endpoint when creation is complete!"

# Wait for RDS to be available
aws rds wait db-instance-available --db-instance-identifier figma-app-db

# Get the endpoint
ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier figma-app-db --query 'DBInstances[0].Endpoint.Address' --output text)

echo "✅ RDS MySQL Database is ready!"
echo "🔗 Endpoint: $ENDPOINT"
echo "👤 Username: admin"
echo "🔑 Password: YOUR_SECURE_PASSWORD"
