# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Employee Performance Monitoring Tool** built as a microservices architecture using **Bun** runtime, **TypeScript**, **Hono** web framework, and **MongoDB**.

### Architecture

The project is structured as a **monorepo** with **npm/bun workspaces**:

- **Gateway Service** (`services/gateway`) - API gateway that proxies requests to microservices with rate limiting
- **Auth Service** (`services/auth`) - JWT-based authentication, user management, password reset
- **Employees Service** (`services/employees`) - Employee records and department management
- **Goals Service** (`services/goals`) - Performance goal tracking
- **Reviews Service** (`services/reviews`) - Performance review cycles, forms, and individual reviews
- **Analytics Service** (`services/analytics`) - Performance metrics and aggregated analytics
- **Notifications Service** (`services/notifications`) - Notification management
- **Shared Library** (`shared`) - Common types, middleware, validators, error handling utilities

Each microservice:
- Runs independently with its own MongoDB database
- Uses Hono for HTTP routing
- Exports a standardized API structure (models, services, controllers, routes)
- Includes vitest for testing (except gateway which uses jest)

### Key Architectural Patterns

**API Response Format**: All API responses use a standardized format from `@pmt/shared`:
```typescript
{ success: true, data: {...}, meta: { timestamp, pagination?, ... } }
{ success: false, error: { code, message, details? }, meta: { timestamp } }
```

**Error Handling**: Use `AppError` class for structured errors. The `errorHandler` middleware catches all errors and formats them consistently. Common error creators are available in `createError` from `@pmt/shared`.

**Authentication Flow**:
- JWT tokens stored in Authorization header as `Bearer <token>`
- `authMiddleware` validates JWT and sets `user` in Hono context
- `requireRoles()` middleware for role-based authorization
- User roles: EMPLOYEE, MANAGER, HR, CSUITE, ADMIN

**Inter-service Communication**: Services call each other via HTTP using environment variables (e.g., `EMPLOYEE_SERVICE_URL`). The gateway proxies external requests to microservices.

**Database**: Each service connects to MongoDB with credentials from `MONGODB_URI` env var. Connection string is built with `authSource=admin` for Docker deployments.

**Shared Library**: All services depend on `@pmt/shared` which provides:
- Type definitions (`ApiResponse`, `JwtPayload`, `UserRole`, etc.)
- Middleware (`authMiddleware`, `errorHandler`, `requestIdMiddleware`, `RateLimiter`)
- Utilities (`successResponse`, `errorResponse`, `AppError`, `createError`, pagination helpers)
- Constants (`ERROR_CODES`, `USER_ROLES`, `PAGINATION`)
- Validators (Zod schemas)

## Development Commands

**Root-level commands** (run from project root):
```bash
# Start all services in dev mode
bun run dev

# Build all services
bun run build

# Run tests across all services
bun run test

# Run tests with coverage
bun run test:coverage

# Lint all services
bun run lint
```

**Service-level commands** (run from individual service directory like `services/auth`):
```bash
# Dev mode with hot reload
bun run dev

# Build TypeScript
bun run build

# Run tests
bun run test

# Watch tests
bun run test:watch

# Clean build artifacts
bun run clean
```

**Docker commands** (from project root):
```bash
# Start all services and MongoDB
bun run docker:up

# Stop all services
bun run docker:down

# Build Docker images
bun run docker:build

# View logs
bun run docker:logs
```

## Code Quality Checks

**IMPORTANT**: Before finalizing any work, ALWAYS run the following commands to ensure code quality:

```bash
# 1. TypeScript compilation check
# For modified services, run tsc in each service directory:
cd services/<service-name> && bunx tsc --noEmit
cd shared && bunx tsc --noEmit  # if shared was modified

# 2. Format code (from project root, if biome is installed)
bunx @biomejs/biome format --write .

# 3. Lint code (from project root, if biome is installed)
bunx @biomejs/biome lint --apply .
```

These checks are mandatory:
- **TypeScript check (`tsc --noEmit`)** ensures type safety and catches compilation errors - MUST RUN
- **Format (`biome format`)** ensures consistent code formatting - run if biome is available
- **Lint (`biome lint`)** catches common issues and enforces code standards - run if biome is available
- Fix all errors and warnings before considering work complete

**Notes**:
- `tsc --noEmit` must always run successfully before finalizing
- If biome is not installed, formatting/linting is optional but recommended
- Alternative: Run `bun run build` from root to check TypeScript compilation across all services

## Testing

- **Test framework**: Vitest (most services) or Jest (gateway)
- **Test location**: `src/__tests__/` in each service
- **Setup file**: `src/__tests__/setup.ts` (initializes mongodb-memory-server for integration tests)
- **Run single test**: `cd services/auth && bun run test src/__tests__/models/user.model.test.ts`
- **Coverage**: `bun run test:coverage`

## Service Ports

- Gateway: 4000
- Auth: 4001
- Employees: 4002
- Goals: 4003
- Reviews: 4004
- Analytics: 4005
- Notifications: 4006
- MongoDB: 27017

## Path Aliases

Each service uses TypeScript path aliases:
- `@auth/*` → `services/auth/src/*`
- `@pmt/shared` → `shared/src/*`

Path aliases are resolved at build time with `tsc-alias`.

## Environment Variables

Required variables are defined in `.env.example`. Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `*_SERVICE_URL` - URLs for inter-service communication (e.g., `EMPLOYEE_SERVICE_URL`)
- Port variables for each service

## Working with the Codebase

**Adding a new endpoint**:
1. Define route in `services/<service>/src/routes/<resource>.routes.ts`
2. Implement controller in `services/<service>/src/controllers/<resource>.controller.ts`
3. Add business logic in `services/<service>/src/services/<resource>.service.ts`
4. Update model if needed in `services/<service>/src/models/<resource>.model.ts`
5. Register route in `services/<service>/src/routes/index.ts`

**Adding shared utilities**: Add to `shared/src/` and export from `shared/src/index.ts`.

**Field Naming Convention**: API endpoints use `snake_case` for query parameters (e.g., `sort_by`, `sort_order`, `per_page`) but TypeScript code uses `camelCase`. The `parsePagination` utility handles conversion. Backend models use `camelCase`, but API responses may use snake_case for consistency with REST conventions.

**TypeScript Compilation**: Services use ES modules (`"type": "module"` in package.json). Import statements must include `.js` extensions even for `.ts` files (TypeScript requirement for ES modules).

## Common Issues

**Import errors with shared package**: After modifying `@pmt/shared`, rebuild it: `cd shared && bun run build`

**MongoDB connection issues**: Ensure `authSource=admin` is in connection string when using Docker. Check `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` env vars.

**Port conflicts**: Check if ports 4000-4006 are already in use before starting services.

**Test failures**: Ensure mongodb-memory-server is properly initialized in `src/__tests__/setup.ts`.
