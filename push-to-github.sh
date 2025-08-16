#!/bin/bash

# GitHub Setup Script for Figma Web App
# Replace YOUR_USERNAME with your actual GitHub username

echo "Setting up GitHub repository for Figma Web App..."

# Set git user info (optional, only if not set globally)
# git config user.name "Your Name"
# git config user.email "your.email@example.com"

# Add remote origin (REPLACE YOUR_USERNAME!)
echo "Adding GitHub remote..."
git remote add origin https://github.com/YOUR_USERNAME/figma-web-app.git

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "✅ Repository successfully pushed to GitHub!"
echo "🌐 View your repository at: https://github.com/YOUR_USERNAME/figma-web-app"

# Display current status
echo ""
echo "Repository status:"
git log --oneline -5
