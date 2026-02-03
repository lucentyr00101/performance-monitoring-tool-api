# Stage 1: Build
FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./

# Copy shared package
COPY shared/package.json shared/
COPY shared/tsconfig.json shared/
COPY shared/src shared/src

# Copy auth service
COPY services/auth/package.json services/auth/
COPY services/auth/tsconfig.json services/auth/
COPY services/auth/src services/auth/src

# Copy base tsconfig
COPY tsconfig.base.json ./

# Install dependencies
RUN bun install

# Build shared first, then auth
RUN cd shared && bun run build
RUN cd services/auth && bun run build

# Stage 2: Production
FROM oven/bun:1.2.12-slim

WORKDIR /app

# Copy package files only (no lockfile - let bun generate it)
COPY package.json ./
COPY shared/package.json shared/
COPY services/auth/package.json services/auth/

# Install production dependencies only
RUN bun install --production

# Copy built files
COPY --from=builder /app/shared/dist shared/dist
COPY --from=builder /app/services/auth/dist services/auth/dist

# Set working directory to the service
WORKDIR /app/services/auth

# Expose port
EXPOSE 4001

# Start the service
CMD ["bun", "run", "dist/index.js"]
