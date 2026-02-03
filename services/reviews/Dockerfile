FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy workspace config files
COPY package.json bun.lock ./
COPY tsconfig.base.json ./

# Copy shared module
COPY shared/ ./shared/

# Copy service files
COPY services/reviews/ ./services/reviews/

# Install dependencies
RUN bun install

# Build shared module
WORKDIR /app/shared
RUN bun run build

# Build service
WORKDIR /app/services/reviews
RUN bun run build

# Production stage
FROM oven/bun:1.2.12-slim

WORKDIR /app

# Copy package files only (no lockfile - let bun generate it)
COPY package.json ./
COPY shared/package.json ./shared/
COPY services/reviews/package.json ./services/reviews/

# Install production dependencies only
RUN bun install --production

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/reviews/dist ./services/reviews/dist

WORKDIR /app/services/reviews

EXPOSE 4004

CMD ["bun", "run", "dist/index.js"]
