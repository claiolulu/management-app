# Quick Setup for Your RDS Database

## 🎯 Your RDS Database: `gcgcm-mgt-db`

### Step 1: Get Your RDS Endpoint

1. **Go to AWS RDS Console** (eu-north-1 region)
2. **Click on "Databases"**
3. **Find your database**: `gcgcm-mgt-db`
4. **Copy the endpoint**: It looks like `gcgcm-mgt-db.XXXXXXXXX.eu-north-1.rds.amazonaws.com`

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**, and add:

```
RDS_ENDPOINT
gcgcm-mgt-db.XXXXXXXXX.eu-north-1.rds.amazonaws.com

RDS_DATABASE  
gcgcm_mgt_db

RDS_USERNAME
admin

RDS_PASSWORD
Your-Master-Password-Here
```

### Step 3: Update Security Group

1. **Go to EC2 Console** → **Security Groups**
2. **Find your RDS security group** (created with the database)
3. **Add Inbound Rule**:
   - Type: MySQL/Aurora (3306)
   - Source: Your EC2 security group OR your EC2 instance's private IP

### Step 4: Test Connection

SSH into your EC2 and test:
```bash
# Install MySQL client if not already installed
sudo apt install mysql-client -y

# Test connection (replace with your actual endpoint)
mysql -h gcgcm-mgt-db.XXXXXXXXX.eu-north-1.rds.amazonaws.com -u admin -p

# If successful, you should see MySQL prompt
# Type 'exit' to quit
```

### Step 5: Deploy

Once GitHub Secrets are configured, push to trigger deployment:

```bash
git add .
git commit -m "Configure RDS database connection"
git push origin main
```

## 🔍 Troubleshooting

**If connection fails:**

1. **Check Security Group**: Make sure port 3306 is open from your EC2
2. **Check VPC**: RDS and EC2 should be in the same VPC
3. **Check Public Access**: If RDS is not publicly accessible, ensure it's in the same subnet group as EC2
4. **Check Credentials**: Verify username/password are correct

**Common Connection String Issues:**
- Make sure database name uses underscores: `gcgcm_mgt_db` (not dashes)
- Verify the endpoint URL is exactly as shown in AWS Console
- Check that the master password matches what you set during RDS creation

## ✅ Expected Result

After successful deployment:
- Your Spring Boot app will connect to RDS
- Database tables will be created automatically (thanks to `ddl-auto: update`)
- Backend API will be available at `http://your-ec2-ip:5001/api`
