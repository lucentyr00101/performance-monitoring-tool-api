# Copilot Instructions

## Build & Test Commands

**This project uses bun as the package manager and task runner.**

```bash
# Install dependencies (uses bun workspaces)
bun install

# Build all services
bun run build

# Run tests for a specific service
cd services/auth && bun test
cd services/employees && bun test
cd services/goals && bun test
cd services/reviews && bun test
cd services/analytics && bun test

# Run a single test file
cd services/auth && bun run vitest run src/__tests__/services/auth.service.test.ts

# Run tests in watch mode
cd services/auth && bun run test:watch

# Development (single service with hot reload)
cd services/auth && bun run dev

# Docker
bun run docker:up       # Start all services
bun run docker:down     # Stop all services
bun run docker:build    # Rebuild images
bun run docker:logs     # View logs
```

## Architecture

This is a **microservices monorepo** using bun workspaces with 6 services:

| Service | Port | Path Alias | Purpose |
|---------|------|------------|---------|
| Gateway | 4000 | - | API routing, rate limiting |
| Auth | 4001 | `@auth/*` | JWT auth, password reset |
| Employees | 4002 | `@employees/*` | Employee & department CRUD |
| Goals | 4003 | `@goals/*` | OKRs with key results |
| Reviews | 4004 | `@reviews/*` | Review cycles, forms, ad-hoc |
| Analytics | 4005 | `@analytics/*` | Dashboards, reports, exports |

**Shared package** (`shared/`): Contains types, middleware, validators, utils, and constants used by all services. Import via `@pmt/shared`.

**Inter-service communication**: Services call each other via HTTP using `*_SERVICE_URL` environment variables (e.g., `EMPLOYEE_SERVICE_URL`).

**Database**: Each service has its own MongoDB database (e.g., `auth_db`, `employee_db`).

## Key Conventions

### Service Structure
Each service follows this pattern:
```
services/{name}/src/
├── controllers/     # Request handlers, validation
├── services/        # Business logic
├── models/          # Mongoose schemas
├── routes/          # Hono route definitions
├── validators/      # Service-specific Zod schemas
└── __tests__/       # Vitest tests
    └── setup.ts     # MongoDB memory server setup
```

### TypeScript Path Aliases
Each service has its own alias in `tsconfig.json`:
```typescript
// In auth service
import { authService } from '@auth/services/index.js';

// Shared package (available in all services)
import { AppError, successResponse } from '@pmt/shared';
```

**Important**: Always use `.js` extension in imports (ESM requirement).

### API Response Format
All endpoints return this structure:
```typescript
{
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: [...] };
  meta: { timestamp: string; pagination?: {...} };
}
```

Use utilities from shared:
```typescript
import { successResponse, errorResponse, AppError } from '@pmt/shared';

return c.json(successResponse(data), 200);
throw new AppError('NOT_FOUND', 'Resource not found', 404);
```

### Mongoose Models
Use this pattern to prevent "Cannot overwrite model" errors in tests:
```typescript
export const ModelName = 
  (mongoose.models.ModelName as mongoose.Model<DocType>) || 
  mongoose.model<DocType>('ModelName', schema);
```

### Testing
- Framework: Vitest with `mongodb-memory-server`
- **No mocking** - tests use actual services, models, and controllers
- Test setup in `src/__tests__/setup.ts` handles DB lifecycle
- Vitest config requires `pool: 'forks'` with `singleFork: true`

### Validation
Zod schemas in `shared/src/validators/` define the API contract. Query params use snake_case (`per_page`), model fields use camelCase (`perPage`).

### Authentication
JWT with access tokens (1h) and refresh tokens (7d). Middleware in `shared/src/middleware/`:
```typescript
import { authMiddleware, requireRoles } from '@pmt/shared';

routes.get('/protected', authMiddleware, handler);
routes.delete('/admin-only', authMiddleware, requireRoles('admin', 'hr'), handler);
```

JWT payload contains `sub` (user ID), `email`, `role`, and optionally `employeeId`.

## Docker Setup

**Single MongoDB for all services**, separate databases per service.

### Development Workflow
```bash
# First time setup
cp .env.example .env
# Edit .env with your JWT_SECRET (min 32 chars) and SMTP credentials

# Start everything
bun run docker:up

# Check health
curl http://localhost:4000/health  # Gateway
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # Employees
# etc...

# View logs for a specific service
docker-compose logs -f auth

# Rebuild after code changes
bun run docker:build
bun run docker:up
```

### Service Dependencies
Services depend on MongoDB and each other:
- **Gateway** depends on all 5 microservices
- **Auth** depends on MongoDB + calls Employees service
- **Employees** depends on MongoDB + calls Goals/Reviews
- **Goals** depends on MongoDB + calls Employees
- **Reviews** depends on MongoDB + calls Employees/Goals
- **Analytics** depends on MongoDB + calls all services

All services have health checks that run every 30s.

## Environment Variables

Required variables in `.env`:
```bash
# JWT (REQUIRED - min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# SMTP for password reset (get from https://ethereal.email/)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user@ethereal.email
SMTP_PASS=your-ethereal-password
```

Service URLs are automatically configured in Docker Compose:
- Inside Docker: `http://auth:4001`, `http://employees:4002`, etc.
- Local development: `http://localhost:4001`, `http://localhost:4002`, etc.

Each service gets its own database (e.g., `auth_db`, `employee_db`).

## Inter-Service Communication

Services make HTTP calls to each other using the Hono client or fetch:

```typescript
// Example: Auth service calling Employees service
const employeeUrl = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002';
const response = await fetch(`${employeeUrl}/api/v1/employees/${employeeId}`, {
  headers: {
    'Authorization': `Bearer ${internalToken}`,
  },
});
```

**Important patterns**:
- Use environment variables for service URLs (`*_SERVICE_URL`)
- Pass JWT tokens in headers for authentication
- Handle network errors gracefully (service may be unavailable)
- In Docker, services use internal network (e.g., `http://auth:4001`)
- Locally, use `http://localhost:PORT`

**Population in tests**: Services may populate references to models in other services (e.g., Goals populates `ownerId` from Employees). Tests must register minimal mock models:

```typescript
// In services/goals/src/__tests__/setup.ts
beforeAll(async () => {
  // Register Employee model for population
  if (!mongoose.models.Employee) {
    mongoose.model('Employee', new Schema({
      firstName: String,
      lastName: String,
    }));
  }
});
```

## Documentation Reference

API specs are in `docs/api/*.md`. The UI is built based on these docs, so any API changes must match the documented contracts. Key files:
- `docs/api/README.md` - Conventions, error codes
- `docs/TSD.md` - Technical specification, database schemas
- `docs/API_IMPLEMENTATION_GUIDE.md` - UI integration guide
