FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy workspace config files
COPY package.json bun.lock ./
COPY tsconfig.base.json ./

# Copy shared module
COPY shared/ ./shared/

# Copy service files
COPY services/notifications/ ./services/notifications/

# Install dependencies
RUN bun install

# Build shared module
WORKDIR /app/shared
RUN bun run build

# Build service
WORKDIR /app/services/notifications
RUN bun run build

# Production stage
FROM oven/bun:1.2.12-slim

WORKDIR /app

# Copy package files only
COPY package.json ./
COPY shared/package.json ./shared/
COPY services/notifications/package.json ./services/notifications/

# Install production dependencies only
RUN bun install --production

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/notifications/dist ./services/notifications/dist

WORKDIR /app/services/notifications

EXPOSE 4006

CMD ["bun", "run", "dist/index.js"]
