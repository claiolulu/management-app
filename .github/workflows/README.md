# GitHub Actions Deployment Workflows

This project uses separate GitHub Actions workflows for deploying different components of the application. This provides better control, faster deployments, and easier troubleshooting.

## 🚀 Available Workflows

### 1. **Frontend Deployment** (`deploy-frontend.yml`)
- **Triggers**: 
  - Push to `main` branch with changes in `frontend/` folder
  - Manual workflow dispatch
- **What it does**:
  - Builds React/Vite frontend with production configuration
  - Deploys to AWS S3 bucket
  - Configures S3 for static website hosting
- **Duration**: ~3-5 minutes

### 2. **Backend Deployment** (`deploy-backend.yml`)
- **Triggers**: 
  - Push to `main` branch with changes in `backend/` folder
  - Manual workflow dispatch
- **What it does**:
  - Builds Spring Boot JAR with production profile
  - Deploys to EC2 instance
  - Creates/updates systemd service
  - Sets up production environment configuration
- **Duration**: ~5-8 minutes

### 3. **Nginx Configuration** (`deploy-nginx.yml`)
- **Triggers**: 
  - Manual workflow dispatch only
- **What it does**:
  - Configures Nginx reverse proxy
  - Sets up SSL certificates
  - Configures frontend serving and API proxying
- **Duration**: ~2-3 minutes

### 4. **Full Stack Deployment** (`deploy-fullstack.yml`)
- **Triggers**: 
  - Manual workflow dispatch only
- **What it does**:
  - Orchestrates deployment of selected components
  - Can deploy all components or specific ones
  - Provides comprehensive deployment summary
- **Duration**: ~8-15 minutes (depending on components)

## 🎯 How to Use

### Automatic Deployments
- **Frontend**: Push changes to `frontend/` folder → auto-deploys
- **Backend**: Push changes to `backend/` folder → auto-deploys

### Manual Deployments
1. Go to **Actions** tab in GitHub repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Choose environment (production/staging)
5. For full stack: choose components to deploy

### Recommended Deployment Order
1. **First time setup**:
   ```
   1. Deploy Nginx (infrastructure)
   2. Deploy Backend (API services)
   3. Deploy Frontend (UI)
   ```

2. **Regular updates**:
   - Frontend changes → Use `deploy-frontend.yml`
   - Backend changes → Use `deploy-backend.yml`
   - Major updates → Use `deploy-fullstack.yml`

## 🔧 Configuration

### Required GitHub Secrets
All workflows require these secrets to be configured in repository settings:

#### AWS Configuration
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (default: eu-north-1)
- `S3_BUCKET_NAME` - S3 bucket for frontend

#### EC2 Configuration
- `EC2_HOST` - EC2 instance hostname/IP
- `EC2_USER` - EC2 username (usually ubuntu)
- `EC2_SSH_KEY` - Private SSH key for EC2 access

#### Database Configuration
- `RDS_ENDPOINT` - RDS database endpoint
- `RDS_USERNAME` - Database username
- `RDS_PASSWORD` - Database password
- `RDS_DATABASE` - Database name

#### Application Configuration
- `JWT_SECRET` - JWT signing secret (64+ characters)
- `ADMIN_USERNAME` - Admin user name
- `ADMIN_PASSWORD` - Admin user password

#### Email Configuration (Optional)
- `MAIL_HOST` - SMTP host
- `MAIL_PORT` - SMTP port
- `MAIL_USERNAME` - Email username
- `MAIL_PASSWORD` - Email password

### Environment-Specific Configuration
Each workflow supports multiple environments:
- **production** - Production environment
- **staging** - Staging environment (if configured)

## 🔍 Monitoring & Troubleshooting

### View Deployment Status
- **Actions tab** → Select workflow → View run details
- Each step shows detailed logs and status

### Common Issues
1. **Frontend deployment fails**:
   - Check S3 bucket permissions
   - Verify AWS credentials
   - Check build logs for errors

2. **Backend deployment fails**:
   - Check EC2 connectivity
   - Verify RDS connection
   - Check required secrets are set
   - Use diagnostic script: `sudo bash /opt/figma-web-app/backend/diagnose-service.sh`

3. **Nginx configuration fails**:
   - Check EC2 SSH access
   - Verify port 80/443 availability
   - Check SSL certificate generation

### Logs and Debugging
- **GitHub Actions**: Check workflow logs in Actions tab
- **Backend Service**: `sudo journalctl -u figma-app -f`
- **Nginx**: `sudo tail -f /var/log/nginx/error.log`
- **Application**: `/var/log/figma-app/application.log`

## 📊 Workflow Benefits

### Separated Deployments
✅ **Faster deployments** - Only deploy what changed  
✅ **Better control** - Deploy components independently  
✅ **Easier debugging** - Isolated failure domains  
✅ **Flexible scheduling** - Deploy when convenient  

### Path-Based Triggers
✅ **Smart triggers** - Only runs when relevant files change  
✅ **Efficient CI/CD** - No unnecessary deployments  
✅ **Resource optimization** - Saves build minutes  

### Environment Management
✅ **Multiple environments** - Production, staging support  
✅ **Configuration management** - Environment-specific settings  
✅ **Secret management** - Secure credential handling  

## 🚨 Important Notes

1. **First deployment**: Use `deploy-fullstack.yml` with "all" components
2. **SSL certificates**: Self-signed by default (browser warning expected)
3. **Database**: Automatically created if it doesn't exist
4. **Backups**: Original workflow saved as `deploy-original-backup.yml`
5. **Dependencies**: Backend deployment waits for frontend in full stack mode

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Run diagnostic script on EC2: `/opt/figma-web-app/backend/diagnose-service.sh`
3. Verify all required secrets are properly configured
4. Check individual component logs on the server
