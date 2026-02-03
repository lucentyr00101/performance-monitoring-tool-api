# Stage 1: Build
FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./

# Copy shared package
COPY shared/package.json shared/
COPY shared/tsconfig.json shared/
COPY shared/src shared/src

# Copy gateway service
COPY services/gateway/package.json services/gateway/
COPY services/gateway/tsconfig.json services/gateway/
COPY services/gateway/src services/gateway/src

# Copy base tsconfig
COPY tsconfig.base.json ./

# Install dependencies
RUN bun install

# Build shared first, then gateway
RUN cd shared && bun run build
RUN cd services/gateway && bun run build

# Stage 2: Production
FROM oven/bun:1.2.12-slim

WORKDIR /app

# Copy package files only (no lockfile - let bun generate it)
COPY package.json ./
COPY shared/package.json shared/
COPY services/gateway/package.json services/gateway/

# Install production dependencies only
RUN bun install --production

# Copy built files
COPY --from=builder /app/shared/dist shared/dist
COPY --from=builder /app/services/gateway/dist services/gateway/dist

# Set working directory to the service
WORKDIR /app/services/gateway

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:4000/health || exit 1

# Start the service
CMD ["bun", "run", "dist/index.js"]
