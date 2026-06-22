# ============================================
# Stage 1: Install production dependencies only
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ============================================
# Stage 2: Runtime image (minimal, non-root)
# ============================================
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=5000

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production node_modules from deps stage
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=appuser:appgroup . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown -R appuser:appgroup uploads

EXPOSE 5000

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
