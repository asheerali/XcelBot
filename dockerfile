# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend code
COPY frontend/ ./

# Expose the Vite dev server port
EXPOSE 5173

# Start the dev server
CMD ["npm", "run", "dev", "--", "--host"]
