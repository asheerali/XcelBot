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


  set -e  # Exit on any failure
  cd "$BACKEND_DIR"

  echo "Checking out branch: $BRANCH_NAME"
  git fetch origin
  git checkout $BRANCH_NAME || git checkout -b $BRANCH_NAME origin/$BRANCH_NAME
  git pull origin $BRANCH_NAME || {
    echo "Merge conflict detected. Attempting to keep remote (theirs) changes..."
    git reset --hard origin/$BRANCH_NAME
  }

  echo "removing old containers and images..."
  CONTAINER_ID=\$(docker ps -q)

  echo "container id: \$CONTAINER_ID"
  CONTAINER_NAME=\$(docker ps --format "{{.Names}}")

  echo "container name: \$CONTAINER_NAME"
  
  # this will be removed after the docker build is done
  IMAGE_ID=\$(docker inspect --format='{{.Image}}' \$CONTAINER_ID | cut -c8-19)
  echo "image id: \$IMAGE_ID"


  if [ -n "\$CONTAINER_ID" ]; then
    echo "Stopping existing container \$CONTAINER_ID..."
    docker stop \$CONTAINER_ID || echo "Failed to stop container \$CONTAINER_ID"
    docker rm \$CONTAINER_NAME || echo "Failed to remove container"
  fi



  echo "running docker build and running the container with name myapp-container..."
  docker build -t xcelbol_be:v1 .
  docker run -d   --name myapp-container   -p 8000:8000   -v /home/admin/XcelBot/backend:/app   -v /home/admin/XcelBot/backend/data:/app/backend/data   xcelbol_be:v1

  if [ -n "\$IMAGE_ID" ]; then
    docker rmi \$IMAGE_ID || echo "Image \$IMAGE_ID is in use or failed to remove"
  fi

  echo "Adding a directory..."
  sudo mkdir -p demo
  
EOF

echo "All done."
