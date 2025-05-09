# ###### Build #####
# FROM node:12-slim AS node
# LABEL author="Asher Ali"
# WORKDIR /
# COPY . .
# RUN npm install
# RUN npm run build


# ###### Run #####
# FROM nginx:alpine
# LABEL author="Asheer"
# WORKDIR /var/cache/nginx
# COPY --from=node /build /usr/share/nginx/html
# COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf


# #########################################################
# ## docker build . -t  rc-prd:2.0
# ## docker run --publish 8080:80  --name rc2 vc-prd:2.0


# docker for the frontend
# ✅ Use a slimmer official Node.js image for Alpine-based builds
FROM node:13.12.0-alpine

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
EXPOSE 5174

# ✅ Start the app using the npm script
CMD ["npm", "start"]
