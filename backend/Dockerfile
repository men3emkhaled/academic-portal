# Academic Portal Backend - Production Dockerfile
FROM node:18-alpine

# Use production environment
ENV NODE_ENV=production

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the port (Railway typically provides PORT env var)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
