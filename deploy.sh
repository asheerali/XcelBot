#!/bin/bash

# Variables
PEM_PATH="../../SecretiQ.pem"
SERVER_USER="admin"
SERVER_IP="3.149.94.190"
SERVER_DOMAIN="ec2-3-149-94-190.us-east-2.compute.amazonaws.com"
# REMOTE_BUILD_DIR="/home/admin/builds"
REMOTE_BUILD_DIR="/home/admin/dist"
NGINX_HTML_DIR="/var/www/html/"
CONSTANTS_FILE="frontend/src/constants.tsx"

# 1. Update constants.txt to point to server API
echo "Updating API URL in constants.txt..."
sed -i 's|^export const API_URL_Local = "http://localhost:8000";|// export const API_URL_Local = "http://localhost:8000";|' $CONSTANTS_FILE
sed -i 's|^// export const API_URL_Local = "http://3.149.94.190:8000";|export const API_URL_Local = "http://3.149.94.190:8000";|' $CONSTANTS_FILE

echo "Removing old dist folder if it exists..."
rm -rf frontend/dist

# 2. Build the frontend
echo "Building frontend..."
cd frontend
npm run build || { echo "Build failed"; exit 1; }

echo "Deleting folders on AWS server first..."
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_DOMAIN" << EOF

  echo "Removing old files..."
  sudo rm -rf $REMOTE_BUILD_DIR/

  echo "Removing old Nginx HTML files..."
  sudo rm -rf $NGINX_HTML_DIR/*

EOF

# 3. Copy build to server
echo "Copying build to AWS server..."
scp -i "$PEM_PATH" -r dist "$SERVER_USER@$SERVER_IP:$REMOTE_BUILD_DIR" || { echo "SCP failed"; exit 1; }

# 4. SSH and deploy on server
echo "Deploying on AWS server..."
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_DOMAIN" << EOF
  echo "Removing old files..."
  sudo rm -rf $NGINX_HTML_DIR/*
  
  echo "Restarting Nginx..."
  sudo systemctl restart nginx
  
  echo ls 
  ls -l ~/

  echo "Copying new build files..."
  sudo cp -r $REMOTE_BUILD_DIR/* $NGINX_HTML_DIR/

  echo "Restarting Nginx again..."
  sudo systemctl restart nginx

  echo "Deployment complete."
EOF


# Revert changes to constants.txt
echo "Reverting changes in constants.txt..."
cd ..
sed -i 's|^// export const API_URL_Local = "http://localhost:8000";|export const API_URL_Local = "http://localhost:8000";|' $CONSTANTS_FILE
sed -i 's|^export const API_URL_Local = "http://3.149.94.190:8000";|// export const API_URL_Local = "http://3.149.94.190:8000";|' $CONSTANTS_FILE


echo "All done."
