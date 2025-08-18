# Test RDS Connection

## Quick RDS Connection Test

### Option 1: Test from your local machine (if RDS is publicly accessible)
```bash
# Install MySQL client (if you don't have it)
brew install mysql-client

# Test connection (replace with your actual endpoint)
mysql -h gcgcm-mgt-db.YOUR-ID.eu-north-1.rds.amazonaws.com -u admin -p
```

### Option 2: Test from EC2 instance
```bash
# SSH into your EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install MySQL client
sudo apt update && sudo apt install mysql-client -y

# Test connection
mysql -h gcgcm-mgt-db.YOUR-ID.eu-north-1.rds.amazonaws.com -u admin -p
```

## If Connection Fails, Check:

1. **Security Group**: RDS security group must allow inbound on port 3306 from:
   - Your EC2 security group, OR
   - Your EC2 instance's private IP, OR 
   - 0.0.0.0/0 (if publicly accessible - less secure)

2. **VPC/Subnet**: RDS should be in same VPC as EC2

3. **Public Access**: 
   - If RDS has "Publicly Accessible: No" → Must be same VPC as EC2
   - If RDS has "Publicly Accessible: Yes" → Can connect from anywhere (with proper security group)

## Common Issues:
- Wrong security group configuration (most common)
- Incorrect endpoint URL
- Wrong username/password
- VPC networking issues
