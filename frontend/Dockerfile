# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:18-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx using full config
# ============================================
FROM nginx:alpine

# Copy the full-featured nginx.conf with gzip, caching, security headers, and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
