#!/bin/bash

# Variables
PEM_PATH="../../SecretiQ.pem"
SERVER_USER="admin"
SERVER_IP="3.149.94.190"
SERVER_DOMAIN="ec2-3-149-94-190.us-east-2.compute.amazonaws.com"
REMOTE_BUILD_DIR="/home/admin/dist"
NGINX_HTML_DIR="/var/www/html/"
CONSTANTS_FILE="frontend/src/constants.tsx"
BACKEND_DIR="XcelBot/backend"

# Get branch name from argument, default to "main"
BRANCH_NAME="${1:-main}"

cd backend

echo "creating a folder on AWS backend first..."
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_DOMAIN" 'bash -s' << EOF
  cd "$BACKEND_DIR"
  echo "Checking out branch: $BRANCH_NAME"
  git fetch origin
  git checkout $BRANCH_NAME || git checkout -b $BRANCH_NAME origin/$BRANCH_NAME
  git pull origin $BRANCH_NAME
  echo "Adding a directory..."
  sudo mkdir -p demo
  
EOF

echo "All done."
