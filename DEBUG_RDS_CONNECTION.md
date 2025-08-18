# RDS Connection Debugging Guide

## 🔍 Debug Steps for RDS Connection Issues

### Step 1: Verify GitHub Secrets Are Actually Set
Go to: https://github.com/claiolulu/management-app/settings/secrets/actions

**Confirm these secrets exist and have values:**
- `RDS_ENDPOINT` 
- `RDS_DATABASE` = `gcgcm_mgt_db`
- `RDS_USERNAME` = `admin`
- `RDS_PASSWORD` = (your master password)
- `JWT_SECRET` = (long random string)

### Step 2: Check RDS Connectivity from EC2
SSH into your EC2 and manually test the connection:

```bash
# SSH to your EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Test basic connectivity to RDS port
telnet YOUR_RDS_ENDPOINT 3306

# OR test with timeout (if telnet not available)
timeout 5 bash -c "</dev/tcp/YOUR_RDS_ENDPOINT/3306" && echo "Connection successful" || echo "Connection failed"

# Try MySQL client connection
mysql -h YOUR_RDS_ENDPOINT -u admin -p
```

### Step 3: Check What Configuration Was Actually Created
On your EC2, check what config file was generated:

```bash
sudo cat /opt/figma-web-app/backend/config/application-production.yml
```

Look for:
- Is the RDS endpoint correctly filled in?
- Are there placeholder strings still there?
- Is the database name correct (`gcgcm_mgt_db`)?

### Step 4: Check Security Group Settings
In AWS Console:

1. **RDS Security Group**:
   - Go to EC2 → Security Groups
   - Find the security group attached to your RDS instance
   - Check Inbound Rules: Should allow MySQL/Aurora (port 3306)
   - Source should be either:
     - Your EC2's security group ID, OR
     - Your EC2's private IP (172.31.x.x), OR
     - 0.0.0.0/0 (less secure but works for testing)

2. **EC2 Security Group**:
   - Should allow outbound connections on port 3306

### Step 5: Check RDS Settings
1. **Public Accessibility**: 
   - If "No" → Must be same VPC as EC2
   - If "Yes" → Should be accessible if security groups allow

2. **VPC and Subnet Groups**:
   - RDS should be in same VPC as your EC2
   - Subnet group should have multiple subnets for availability

## 🚨 Common Issues:

1. **Wrong Security Group**: Most common cause - port 3306 not open
2. **Placeholder Not Replaced**: Config still has `RDS_ENDPOINT_PLACEHOLDER`
3. **Wrong Database Name**: Using `gcgcm-mgt-db` instead of `gcgcm_mgt_db`
4. **Network Issues**: VPC/subnet misconfiguration
5. **Wrong Endpoint**: Using cluster endpoint instead of instance endpoint

## 🔧 Quick Fix Test:
Try this on your EC2 to test if it's a config issue:

```bash
# Check if RDS endpoint resolves
nslookup YOUR_RDS_ENDPOINT

# Check if port is reachable
nc -zv YOUR_RDS_ENDPOINT 3306
```
