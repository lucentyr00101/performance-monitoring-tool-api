FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy workspace config files
COPY package.json bun.lock ./
COPY tsconfig.base.json ./

# Copy shared module
COPY shared/ ./shared/

# Copy service files
COPY services/employees/ ./services/employees/

# Install dependencies
RUN bun install

# Build shared module
WORKDIR /app/shared
RUN bun run build

# Build service
WORKDIR /app/services/employees
RUN bun run build

# Production stage
FROM oven/bun:1.2.12-slim

WORKDIR /app

# Copy package files only (no lockfile - let bun generate it)
COPY package.json ./
COPY shared/package.json ./shared/
COPY services/employees/package.json ./services/employees/

# Install production dependencies only
RUN bun install --production

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/employees/dist ./services/employees/dist

WORKDIR /app/services/employees

EXPOSE 4002

CMD ["bun", "run", "dist/index.js"]
