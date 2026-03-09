#!/bin/bash

# 1. Navigate to the project directory
cd ~/covaciu-andrei-portofolio/

# 2. Pull the latest changes from GitHub
echo "Fetching latest updates from GitHub..."
git pull origin main

# 3. Install new dependencies if any
echo "Installing dependencies..."
npm install

# 4. Create the production build
echo "Building the project..."
npm run build

# 5. Clean the old site files from Nginx directory
echo "Cleaning up /var/www/html/..."
sudo rm -rf /var/www/html/*

# 6. Copy the new build files to Nginx web root
echo "Deploying new files to Nginx..."
if [ -d "dist" ]; then
    sudo cp -r dist/* /var/www/html/
else
    echo "❌ Error: 'dist' folder was not found!"
    exit 1
fi

# 7. Restart Nginx to apply changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "🚀 Site updated successfully!"
