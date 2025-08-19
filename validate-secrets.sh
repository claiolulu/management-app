#!/bin/bash

# ===========================================
# GitHub Secrets Validation Script
# ===========================================
# Run this locally to validate your secrets are properly configured
# This script checks the deployment workflow for secret references

echo "🔍 GitHub Secrets Validation for Figma Web App"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d ".github/workflows" ]; then
    echo -e "${RED}❌ Error: Run this script from the root of your repository${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking workflow files for required secrets...${NC}"
echo ""

# Extract all secrets from workflow files
SECRETS=$(grep -r "secrets\." .github/workflows/ | grep -o 'secrets\.[A-Z_][A-Z0-9_]*' | sort | uniq | sed 's/secrets\.//')

# Critical secrets that cause deployment failures
CRITICAL_SECRETS=(
    "JWT_SECRET"
    "ADMIN_PASSWORD" 
    "RDS_PASSWORD"
    "RDS_ENDPOINT"
    "RDS_USERNAME"
    "EC2_HOST"
    "EC2_SSH_KEY"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
)

# Optional secrets
OPTIONAL_SECRETS=(
    "AWS_REGION"
    "S3_BUCKET_NAME"
    "RDS_DATABASE"
    "EC2_USER"
    "ADMIN_USERNAME"
    "MAIL_HOST"
    "MAIL_PORT"
    "MAIL_USERNAME"
    "MAIL_PASSWORD"
)

echo -e "${RED}🚨 CRITICAL SECRETS (Deployment will fail if missing/empty):${NC}"
echo "================================================================"
for secret in "${CRITICAL_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "^$secret$"; then
        echo -e "${YELLOW}⚠️  $secret${NC} - Required for deployment"
    else
        echo -e "${GREEN}ℹ️  $secret${NC} - Not found in workflows (may not be needed)"
    fi
done

echo ""
echo -e "${BLUE}📋 CONFIGURATION SECRETS (Important for proper functionality):${NC}"
echo "=============================================================="
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "^$secret$"; then
        echo -e "${GREEN}✅ $secret${NC} - Used in workflows"
    else
        echo -e "${YELLOW}➖ $secret${NC} - Not found in workflows"
    fi
done

echo ""
echo -e "${BLUE}📊 ALL SECRETS FOUND IN WORKFLOWS:${NC}"
echo "================================="
while IFS= read -r secret; do
    if [[ " ${CRITICAL_SECRETS[@]} " =~ " ${secret} " ]]; then
        echo -e "${RED}🚨 $secret${NC} (CRITICAL)"
    elif [[ " ${OPTIONAL_SECRETS[@]} " =~ " ${secret} " ]]; then
        echo -e "${GREEN}📋 $secret${NC} (Configuration)"
    else
        echo -e "${YELLOW}❓ $secret${NC} (Unknown - check if needed)"
    fi
done <<< "$SECRETS"

echo ""
echo -e "${BLUE}🔧 HOW TO ADD SECRETS:${NC}"
echo "====================="
echo "1. Go to: https://github.com/claiolulu/management-app/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret name and value"
echo ""
echo -e "${YELLOW}📖 For detailed setup instructions, see:${NC}"
echo "   GITHUB_SECRETS_SETUP.md"
echo ""
echo -e "${BLUE}⚡ QUICK FIX for current deployment failure:${NC}"
echo "=============================================="
echo -e "${RED}The deployment is failing because ADMIN_PASSWORD is missing or empty.${NC}"
echo ""
echo "Add this secret immediately:"
echo -e "${YELLOW}Secret Name:${NC} ADMIN_PASSWORD"
echo -e "${YELLOW}Secret Value:${NC} [Strong password like: AdminPass123!Secure]"
echo ""
echo "Then re-run your deployment in GitHub Actions."
echo ""
echo -e "${GREEN}✅ After adding all secrets, your deployment should succeed!${NC}"
