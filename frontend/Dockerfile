# docker for the frontend
# ✅ Use a slimmer official Node.js image for Alpine-based builds
# FROM node:13.12.0-alpine
FROM node:20-alpine

# ✅ Set the working directory in the container
WORKDIR /app

# ✅ Add node_modules/.bin to PATH for using local binaries
ENV PATH /app/node_modules/.bin:$PATH

# ✅ Copy only the files needed for installing dependencies first (optimizes caching)
COPY package.json ./
COPY package-lock.json ./

# ✅ Install dependencies silently
RUN npm install --silent

# ✅ Now copy everything else (so Docker rebuilds only if src changes)
COPY . ./   
VOLUME /app

# ✅ Expose the port React dev server runs on
EXPOSE 5173

# ✅ Start the app using the npm script
CMD ["npm", "run", "dev"]