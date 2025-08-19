# GitHub Secrets Configuration Guide

## 🚨 **CRITICAL ISSUE RESOLUTION**

Your deployment is failing because required GitHub Secrets are missing or empty. This guide shows you exactly what secrets to configure.

## 🔧 **How to Add GitHub Secrets**

### **Step 1: Access Repository Settings**
1. Go to your GitHub repository: `https://github.com/claiolulu/management-app`
2. Click **Settings** tab (at the top of the repository)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"** for each secret below

### **Step 2: Required Secrets**

Copy and paste these exact secret names (case-sensitive) and provide appropriate values:

## 📋 **CRITICAL SECRETS** (Deployment will fail without these)

### **🔐 Security & Authentication**
```
Secret Name: JWT_SECRET
Value: [64+ character random string]
Example: mySecretKey123456789012345678901234567890abcdefghijk
```

```
Secret Name: ADMIN_USERNAME
Value: admin
```

```
Secret Name: ADMIN_PASSWORD
Value: [Strong password for admin login]
Example: AdminPass123!Secure
```

### **🗄️ Database Configuration**
```
Secret Name: RDS_ENDPOINT
Value: [Your RDS database endpoint]
Example: figma-db.abcdef123456.eu-north-1.rds.amazonaws.com
```

```
Secret Name: RDS_USERNAME
Value: admin
```

```
Secret Name: RDS_PASSWORD
Value: [Your RDS database password]
Example: DatabasePass123!
```

```
Secret Name: RDS_DATABASE
Value: figma_app_prod
```

### **☁️ AWS Configuration**
```
Secret Name: AWS_ACCESS_KEY_ID
Value: [Your AWS access key ID]
Example: AKIAIOSFODNN7EXAMPLE
```

```
Secret Name: AWS_SECRET_ACCESS_KEY
Value: [Your AWS secret access key]
Example: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

```
Secret Name: AWS_REGION
Value: eu-north-1
```

```
Secret Name: S3_BUCKET_NAME
Value: [Your S3 bucket name]
Example: figma-web-app-frontend
```

### **🖥️ EC2 Configuration**
```
Secret Name: EC2_HOST
Value: [Your EC2 instance IP or domain]
Example: 13.48.123.456 or your-domain.com
```

```
Secret Name: EC2_USER
Value: ubuntu
```

```
Secret Name: EC2_SSH_KEY
Value: [Your EC2 private SSH key - ENTIRE key content]
Example:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQ...
[entire key content]
...AAAAB3NzaC1yc2EAAAADAQABAAABAQC7vYNI...
-----END OPENSSH PRIVATE KEY-----
```

## 📧 **OPTIONAL SECRETS** (Email functionality)

```
Secret Name: MAIL_HOST
Value: smtp.gmail.com
```

```
Secret Name: MAIL_PORT
Value: 587
```

```
Secret Name: MAIL_USERNAME
Value: [Your email address]
Example: your-email@gmail.com
```

```
Secret Name: MAIL_PASSWORD
Value: [Your email app password]
Example: abcd efgh ijkl mnop
```

## ✅ **Validation Checklist**

After adding all secrets, verify each one:

### **Critical Validation** (These MUST be set or deployment fails):
- [ ] `JWT_SECRET` - At least 64 characters
- [ ] `ADMIN_PASSWORD` - Strong password (not empty!)
- [ ] `RDS_PASSWORD` - Database password (not empty!)
- [ ] `RDS_ENDPOINT` - Valid RDS endpoint
- [ ] `EC2_HOST` - Valid EC2 IP or domain
- [ ] `EC2_SSH_KEY` - Complete SSH private key
- [ ] `AWS_ACCESS_KEY_ID` - Valid AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Valid AWS secret key

### **Configuration Validation**:
- [ ] `RDS_USERNAME` - Usually "admin"
- [ ] `RDS_DATABASE` - Database name
- [ ] `EC2_USER` - Usually "ubuntu"
- [ ] `S3_BUCKET_NAME` - Your S3 bucket name
- [ ] `AWS_REGION` - Your AWS region

## 🔍 **How to Check Your Current Secrets**

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all the secret names listed (values are hidden for security)
3. If any critical secrets are missing, click **"New repository secret"** to add them

## 🚀 **After Adding Secrets**

1. **Verify all critical secrets are set** (especially `ADMIN_PASSWORD`)
2. **Go to Actions tab** in your repository
3. **Re-run the failed deployment**:
   - Click on the failed workflow run
   - Click **"Re-run jobs"** → **"Re-run all jobs"**

Or trigger a new deployment:
   - Go to **Actions** → **Deploy Frontend** (or Backend/Full Stack)
   - Click **"Run workflow"** → **"Run workflow"**

## 🔧 **Troubleshooting**

### **If deployment still fails:**

1. **Check the workflow logs**:
   ```
   Actions → [Your workflow] → [Failed job] → [Expand failed step]
   ```

2. **Common issues**:
   - `ADMIN_PASSWORD` is empty → Set a strong password
   - `JWT_SECRET` too short → Use 64+ characters
   - `RDS_PASSWORD` empty → Set your database password
   - `EC2_SSH_KEY` incomplete → Copy the entire SSH key including headers/footers

3. **Secret validation in workflow**:
   The deployment script checks these and will fail if empty:
   ```bash
   if [ -z "${{ secrets.JWT_SECRET }}" ]; then
     echo "❌ ERROR: JWT_SECRET is empty"
     exit 1
   fi
   
   if [ -z "${{ secrets.RDS_PASSWORD }}" ]; then
     echo "❌ ERROR: RDS_PASSWORD is empty"
     exit 1
   fi
   
   if [ -z "${{ secrets.ADMIN_PASSWORD }}" ]; then
     echo "❌ ERROR: ADMIN_PASSWORD is empty"
     exit 1
   fi
   ```

## 📝 **Example Values for Testing**

If you need example values for testing (⚠️ **DO NOT use in production**):

```bash
# FOR TESTING ONLY - Use strong values in production!
JWT_SECRET=mySecretKey123456789012345678901234567890TestingOnly
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!Test
RDS_DATABASE=figma_app_prod
EC2_USER=ubuntu
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

## ✨ **Success Indicators**

When all secrets are properly configured, you'll see:
- ✅ All environment variables validated
- ✅ Database connection successful  
- ✅ Backend service starts successfully
- ✅ Frontend deployment completes
- ✅ Application accessible at your domain

---

**🎯 Quick Fix:** The main issue is `ADMIN_PASSWORD` is missing or empty. Add this secret with a strong password value, then re-run your deployment!
