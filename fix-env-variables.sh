# Fix for environment variable issue

# Option 1: Create .env file (run on EC2)
sudo tee /opt/figma-web-app/backend/.env > /dev/null << 'EOF'
DB_PASSWORD=GCGCM3927
JWT_SECRET=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://gcgcm-fe.s3-website-eu-north-1.amazonaws.com
UPLOAD_PATH=/var/uploads/profiles
EOF

# Option 2: Update systemd service with environment variables
sudo tee /etc/systemd/system/figma-app.service > /dev/null << 'EOF'
[Unit]
Description=Figma Web App Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/figma-web-app/backend
Environment=DB_PASSWORD=GCGCM3927
Environment=JWT_SECRET=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2
Environment=ADMIN_PASSWORD=admin123
Environment=FRONTEND_URL=https://gcgcm-fe.s3-website-eu-north-1.amazonaws.com
Environment=UPLOAD_PATH=/var/uploads/profiles
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production -Dspring.config.location=file:config/application-production.yml /opt/figma-web-app/backend/target/figma-web-app-backend-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Then reload and restart
sudo systemctl daemon-reload
sudo systemctl restart figma-app
sudo systemctl status figma-app
