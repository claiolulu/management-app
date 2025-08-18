# GitHub Actions Deployment

## Overview
This repository uses a single, unified GitHub Actions workflow for complete stack deployment to AWS infrastructure.

## Deployment Workflow (`deploy.yml`)

### Trigger
- **Automatic**: Every push to `main` branch
- **Manual**: Via GitHub Actions UI (workflow_dispatch)

### What Gets Deployed
1. **Frontend** → AWS S3 static hosting + EC2/Nginx
2. **Backend** → EC2 with Spring Boot application
3. **Database** → RDS MySQL (automatically configured)
4. **SSL/HTTPS** → Self-signed certificates with security headers

### Required GitHub Secrets
| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS programmatic access key | `AKIAXXXXXXXXXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `EC2_HOST` | EC2 instance IP or domain | `ec2-xx-xx-xx-xx.eu-north-1.compute.amazonaws.com` |
| `EC2_USER` | EC2 SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key for EC2 access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `S3_BUCKET_NAME` | S3 bucket name for frontend | `gcgcm-fe` |
| `RDS_ENDPOINT` | RDS database endpoint | `db-instance.xxxxxxxxxx.eu-north-1.rds.amazonaws.com` |
| `RDS_USERNAME` | RDS master username | `admin` |
| `RDS_PASSWORD` | RDS master password | `your-secure-password` |
| `RDS_DATABASE` | Database name to create/use | `gcgcm_mgt_db` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret-key` |

### Deployment Steps
1. **Build Phase**
   - Checkout code from repository
   - Setup Node.js 18 and Java 17
   - Build frontend with production configuration
   - Build backend JAR with Maven

2. **Frontend Deployment**
   - Deploy to S3 bucket with public read access
   - Configure S3 website hosting
   - Set up HTTPS-compatible frontend configuration

3. **Backend Deployment**
   - SSH into EC2 instance
   - Install required packages (MySQL client, Nginx, OpenJDK)
   - Test RDS connectivity
   - Create database if needed
   - Clone/update application code
   - Build backend on server
   - Create environment configuration file
   - Setup systemd service for backend
   - Configure SSL certificates (self-signed)
   - Setup Nginx reverse proxy with SSL
   - Start all services

4. **Health Checks**
   - Verify backend service is running
   - Verify Nginx is running
   - Test HTTP endpoints
   - Display deployment status

### Post-Deployment URLs
- **Primary Application**: `https://[EC2_HOST]` (SSL with browser warning)
- **S3 Backup**: `https://[S3_BUCKET_NAME].s3.eu-north-1.amazonaws.com`
- **Backend API**: `https://[EC2_HOST]/api`
- **Health Check**: `https://[EC2_HOST]/health`

### Security Features
- ✅ SSL/TLS encryption (HTTPS)
- ✅ HTTP to HTTPS redirect
- ✅ Security headers (HSTS, XSS protection, etc.)
- ✅ Self-signed certificates (browser warning expected)
- ✅ Secure proxy configuration

### Infrastructure Details
| Component | Technology | Port | Notes |
|-----------|------------|------|-------|
| Frontend | React + Vite → S3 + Nginx | 443 (HTTPS) | Static files with React Router support |
| Backend | Spring Boot | 5001 (internal) | Proxied through Nginx |
| Database | RDS MySQL | 3306 | Managed database service |
| Reverse Proxy | Nginx | 80→443 redirect | SSL termination + static serving |

### First-Time Setup Checklist
1. ✅ Configure all required GitHub Secrets
2. ✅ Ensure EC2 instance has proper security groups:
   - Port 22 (SSH) - for deployment
   - Port 80 (HTTP) - for redirect
   - Port 443 (HTTPS) - for application
3. ✅ Ensure RDS instance is accessible from EC2
4. ✅ Ensure S3 bucket exists and is configured for static hosting
5. ✅ Push to `main` branch to trigger deployment

### Troubleshooting

#### Deployment Fails
- Check GitHub Actions logs for specific error
- Verify all secrets are correctly configured
- Ensure EC2 instance is running and accessible

#### SSL Certificate Warnings
- Expected behavior with self-signed certificates
- Click "Advanced" → "Proceed to site" in browser
- Consider setting up Let's Encrypt for production

#### Backend Not Starting
- Check systemd logs: `sudo journalctl -u figma-app -f`
- Verify database connectivity from EC2
- Check environment variables in `/opt/figma-web-app/backend/.env`

#### Frontend Not Loading
- Check if S3 deployment succeeded
- Verify Nginx configuration
- Test direct S3 URL as fallback

### Previous Workflow Files
- ~~`deploy-rds.yml`~~ ← Consolidated into unified workflow
- ~~`deploy-rds-ssl.yml`~~ ← Consolidated into unified workflow

All functionality from the previous three separate workflows has been combined into the single `deploy.yml` file for easier maintenance and consistency.
