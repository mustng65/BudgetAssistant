ARG NODE_VERSION=24.12.0-alpine

# Stage 1: Build Angular 18 App
FROM node:${NODE_VERSION} AS builder

# Install Angular CLI globally
RUN npm install -g @angular/cli

WORKDIR /app

# Copy package files to install dependencies
COPY budgetAssistant.Web/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY budgetAssistant.Web/. .

# Build the Angular app for production
RUN ng build --configuration production

# Stage 2: Set up Node.js 21 backend
FROM node:${NODE_VERSION} AS server

WORKDIR /app

# Copy only the package files for the Node.js backend
COPY budgetAssistant.WebApi/package*.json ./

# Install server dependencies
RUN npm install

# Copy the backend source files
COPY budgetAssistant.WebApi/src/. .

# Expose the port your Node.js server will run on
EXPOSE 3000

# Command to run the Node.js server
CMD ["node", "server.js"]

# Stage 3: Combine Angular and Node.js with NGINX
FROM nginx:alpine as runner

ARG APP_VERSION

ENV ACTUAL_SERVER_URL=""
ENV ACTUAL_PASSWORD=""
ENV ACTUAL_SYNC_ID=""
ENV APP_VERSION=${APP_VERSION:-1.0.0}


# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the Angular build from the builder stage to NGINX
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

# Copy the Node.js server files from the server stage
COPY --from=server /app /usr/share/nginx/node-server

# Install Node.js in the final stage to support backend operations
RUN apk add --no-cache nodejs npm

# Expose the necessary ports
EXPOSE 8080  
EXPOSE 3000 

# Start both NGINX and the Node.js server concurrently
CMD nginx -g "daemon off;" & node /usr/share/nginx/node-server/server.js