# # Use Node.js as base image - using a specific version known to work well with Vite
# FROM node:16-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies with legacy peer deps
# RUN npm install --legacy-peer-deps

# # Copy all frontend files
# COPY . .

# # Create a modified tsconfig that disables type checking
# RUN sed -i 's/"strict": true/"strict": false/g' tsconfig.json && \
#     sed -i 's/"noImplicitAny": true/"noImplicitAny": false/g' tsconfig.json && \
#     sed -i 's/"strictNullChecks": true/"strictNullChecks": false/g' tsconfig.json

# # Set environment variable to skip type checking in Vite
# ENV TSC_COMPILE_ON_ERROR=true
# ENV VITE_SKIP_TYPESCRIPT_CHECK=true

# # Create a simple vite.config.js specifically for Docker
# # RUN echo 'import { defineConfig } from "vite";\n\
# # import react from "@vitejs/plugin-react";\n\
# # \n\
# # export default defineConfig({\n\
# #   plugins: [react()],\n\
# #   server: {\n\
# #     hmr: {\n\
# #       overlay: false\n\
# #     }\n\
# #   }\n\
# # });' > vite.config.js

# # RUN cat <<EOF > vite.config.js
# # import { defineConfig } from "vite";
# # import react from "@vitejs/plugin-react";

# # export default defineConfig({
# #   plugins: [react()],
# #   server: {
# #     hmr: {
# #       overlay: false
# #     }
# #   }
# # });
# # EOF


# # Expose port for development server
# EXPOSE 5173

# # Command to run the development server in --force mode to bypass errors
# # CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--force"]
# CMD ["npm", "run", "dev"]


# # part 2
# # Use Node.js 18+ instead of 16
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm install --legacy-peer-deps

# # Copy the rest of the app
# COPY . .

# # Optional: adjust tsconfig if needed
# RUN sed -i 's/"strict": true/"strict": false/g' tsconfig.json && \
#     sed -i 's/"noImplicitAny": true/"noImplicitAny": false/g' tsconfig.json && \
#     sed -i 's/"strictNullChecks": true/"strictNullChecks": false/g' tsconfig.json

# # Recreate vite.config.js cleanly
# RUN cat <<EOF > vite.config.js
# import { defineConfig } from "vite";
# import react from "@vitejs/plugin-react";

# export default defineConfig({
#   plugins: [react()],
#   server: {
#     hmr: {
#       overlay: false
#     },
#     host: true,
#     port: 5173
#   }
# });
# EOF

# # Expose Vite dev server port
# EXPOSE 5173

# # Run the app
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]




# part 3
# Use Node.js 18+ instead of 16
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Optional: adjust tsconfig if needed
RUN sed -i 's/"strict": true/"strict": false/g' tsconfig.json && \
    sed -i 's/"noImplicitAny": true/"noImplicitAny": false/g' tsconfig.json && \
    sed -i 's/"strictNullChecks": true/"strictNullChecks": false/g' tsconfig.json

# Recreate vite.config.js cleanly
# RUN sh -c 'cat > vite.config.js << "EOF"
# import { defineConfig } from "vite";
# import react from "@vitejs/plugin-react";

# export default defineConfig({
#   plugins: [react()],
#   server: {
#     hmr: {
#       overlay: false
#     },
#     host: true,
#     port: 5173
#   }
# });
# EOF'


# Expose Vite dev server port
EXPOSE 5173

# Run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
