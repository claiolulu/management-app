# Free GitHub Actions Deployment Setup

This guide will help you set up **100% FREE** automated deployment using GitHub Actions and your AWS Free Tier EC2 instance.

## ✅ Benefits of This Approach

- **🆓 Completely Free** - Uses only GitHub Actions free tier
- **🚫 No AWS charges** - No CodeDeploy, S3, or other paid AWS services
- **⚡ Fast deployment** - Direct SSH deployment
- **🔒 Secure** - Uses SSH key authentication
- **📊 Detailed logging** - Color-coded deployment status
- **🔄 Automatic rollback** - Keeps backups of previous versions

---

## 🛠️ Setup Steps

### Step 1: Prepare Your EC2 Instance

1. **Create an EC2 instance** (if you haven't already):
   - Use AWS Free Tier eligible instance (t2.micro)
   - Use Ubuntu 22.04 LTS
   - Create/use an existing key pair (.pem file)

2. **Configure security group**:
   ```
   Port 22 (SSH) - Your IP
   Port 80 (HTTP) - 0.0.0.0/0
   Port 443 (HTTPS) - 0.0.0.0/0
   Port 5001 (Backend) - 0.0.0.0/0 (for development)
   ```

3. **Install required software on EC2**:
   ```bash
   # SSH into your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Java 17
   sudo apt install openjdk-17-jdk -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs -y
   
   # Install Git
   sudo apt install git -y
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Create application directory
   sudo mkdir -p /opt/figma-web-app
   sudo chown ubuntu:ubuntu /opt/figma-web-app
   
   # Create systemd service file
   sudo tee /etc/systemd/system/figma-app.service > /dev/null <<EOF
   [Unit]
   Description=Figma Web App
   After=network.target
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/opt/figma-web-app
   ExecStart=/usr/bin/java -jar /opt/figma-web-app/backend/target/figma-web-app-0.0.1-SNAPSHOT.jar
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # Reload systemd
   sudo systemctl daemon-reload
   sudo systemctl enable figma-app
   
   # Configure Nginx
   sudo tee /etc/nginx/sites-available/figma-app > /dev/null <<EOF
   server {
       listen 80;
       server_name _;
       
       # Frontend
       location /figma-app/ {
           alias /var/www/html/figma-app/;
           try_files \$uri \$uri/ /figma-app/index.html;
       }
       
       # API proxy
       location /api/ {
           proxy_pass http://localhost:5001/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
           proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto \$scheme;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   # Enable the site
   sudo ln -sf /etc/nginx/sites-available/figma-app /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 2: Configure GitHub Repository Secrets

1. **Go to your GitHub repository**
2. **Click Settings → Secrets and variables → Actions**
3. **Add these Repository Secrets**:

   **EC2_HOST**
   ```
   your-ec2-public-ip-or-domain
   # Example: 3.15.123.45 or mydomain.com
   ```

   **EC2_USER**
   ```
   ubuntu
   # Default user for Ubuntu EC2 instances
   ```

   **EC2_SSH_KEY**
   ```
   # Paste the ENTIRE contents of your .pem file here
   # Including -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----
   # Make sure to copy ALL lines without any modifications
   ```

### Step 3: Test the Deployment

1. **Push code to main branch**:
   ```bash
   git add .
   git commit -m "Setup automated deployment"
   git push origin main
   ```

2. **Watch the deployment**:
   - Go to GitHub Actions tab in your repository
   - Click on the running workflow
   - Watch the deployment logs in real-time

3. **Verify deployment**:
   - Frontend: `http://your-ec2-ip/figma-app/`
   - Backend API: `http://your-ec2-ip/api/auth/health`

---

## 🔧 How It Works

### Deployment Process:
1. **Build Phase** (on GitHub servers):
   - ✅ Checkout code from repository
   - ✅ Build React frontend (`npm run build`)
   - ✅ Build Spring Boot backend (`mvn package`)

2. **Deploy Phase** (on your EC2):
   - 🛑 Stop running services
   - 📦 Create backup of current version
   - 🔄 Update code from GitHub
   - 🏗️ Rebuild application on server
   - 📋 Copy frontend to nginx directory
   - ▶️ Start services
   - ✅ Verify deployment success

### Security Features:
- 🔐 SSH key authentication (no passwords)
- 🔒 No AWS credentials needed
- 🚫 No files uploaded to GitHub (builds on server)
- 📝 Detailed logging for troubleshooting

---

## 🚨 Troubleshooting

### Common Issues:

**1. SSH Connection Failed**
```bash
# Check if you can manually SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Make sure security group allows SSH from GitHub Actions IPs
# You might need to allow SSH from 0.0.0.0/0 for GitHub Actions
```

**2. Permission Denied**
```bash
# Make sure SSH key is correct in GitHub secrets
# Ensure the key includes the full PEM format with headers
```

**3. Service Won't Start**
```bash
# SSH into EC2 and check logs
sudo journalctl -u figma-app -f
sudo systemctl status figma-app
```

**4. Frontend Not Loading**
```bash
# Check nginx configuration
sudo nginx -t
sudo systemctl status nginx
```

### Manual Deployment Test:
```bash
# SSH into your EC2 instance and run the deployment script manually
cd /opt/figma-web-app
git pull origin main
cd frontend && npm run build
cd ../backend && ./mvnw clean package -DskipTests
sudo systemctl restart figma-app nginx
```

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| GitHub Actions | **FREE** (2,000 minutes/month for private repos) |
| EC2 t2.micro | **FREE** (750 hours/month on free tier) |
| Data Transfer | **FREE** (1GB/month on free tier) |
| **Total Monthly Cost** | **$0.00** |

---

## 🎯 Next Steps

Once this is working, you can enhance it with:

1. **Environment Variables**:
   - Add database credentials as GitHub secrets
   - Configure different environments (staging/production)

2. **Health Checks**:
   - Add more comprehensive deployment verification
   - Set up monitoring and alerts

3. **SSL Certificate**:
   - Add Let's Encrypt SSL certificate
   - Configure HTTPS redirect

4. **Database Backup**:
   - Automated MySQL backups before deployment
   - Database migration scripts

5. **Rolling Deployments**:
   - Zero-downtime deployment strategies
   - Blue-green deployment setup

---

## 📞 Support

If you encounter any issues:

1. **Check GitHub Actions logs** for detailed error messages
2. **SSH into EC2** and check service logs
3. **Verify all secrets** are correctly configured
4. **Test manual deployment** first

This setup gives you enterprise-grade CI/CD completely free! 🚀
