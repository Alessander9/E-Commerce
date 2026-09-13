# ==========================================
# 🐳 Dockerfile — Cleo Platform API
# ==========================================
# Multi-stage build for optimized production image

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY prisma ./prisma/
COPY src ./src/
COPY tsconfig.json nest-cli.json jest.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# ── Stage 2: Production ──
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S cleo && \
    adduser -S cleo -u 1001 -G cleo

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Copy Prisma schema for runtime migrations
COPY prisma ./prisma/

# Set ownership
RUN chown -R cleo:cleo /app

USER cleo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/docs || exit 1

# Start with dumb-init for proper PID 1 signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
