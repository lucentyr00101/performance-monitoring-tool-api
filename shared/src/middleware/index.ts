import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';
import { errorResponse, AppError } from '../utils/index.js';
import { ERROR_CODES, USER_ROLES, type UserRole } from '../constants/index.js';

const LOG_PREFIX = '[Middleware]';

// Extend Hono context with user
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
    requestId: string;
  }
}

/**
 * Get JWT secret from environment
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const requestId = c.get('requestId');

  if (!authHeader) {
    console.warn(`${LOG_PREFIX} Auth failed - no header`, { requestId, path: c.req.path });
    return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Authorization header required'), 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.warn(`${LOG_PREFIX} Auth failed - invalid format`, { requestId, path: c.req.path });
    return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid authorization format'), 401);
  }

  const token = parts[1];
  if (!token) {
    console.warn(`${LOG_PREFIX} Auth failed - no token`, { requestId, path: c.req.path });
    return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Token required'), 401);
  }

  try {
    const decoded = verify(token, getJwtSecret()) as JwtPayload;
    c.set('user', decoded);
    console.info(`${LOG_PREFIX} Auth successful`, { requestId, userId: decoded.sub, role: decoded.role });
    await next();
  } catch {
    console.warn(`${LOG_PREFIX} Auth failed - invalid token`, { requestId, path: c.req.path });
    return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid or expired token'), 401);
  }
}

/**
 * Optional authentication middleware - sets user if token present, continues otherwise
 */
export async function optionalAuthMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const requestId = c.get('requestId');

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
      try {
        const decoded = verify(parts[1], getJwtSecret()) as JwtPayload;
        c.set('user', decoded);
        console.info(`${LOG_PREFIX} Optional auth - token valid`, { requestId, userId: decoded.sub, role: decoded.role });
      } catch {
        console.info(`${LOG_PREFIX} Optional auth - token invalid, continuing without user`, { requestId, path: c.req.path });
      }
    } else {
      console.info(`${LOG_PREFIX} Optional auth - invalid format, continuing without user`, { requestId, path: c.req.path });
    }
  } else {
    console.info(`${LOG_PREFIX} Optional auth - no token present`, { requestId, path: c.req.path });
  }

  await next();
}

/**
 * Role-based authorization middleware
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const user = c.get('user');
    const requestId = c.get('requestId');

    if (!user) {
      console.warn(`${LOG_PREFIX} Role check failed - no user`, { requestId, path: c.req.path, requiredRoles: allowedRoles });
      return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Authentication required'), 401);
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      console.warn(`${LOG_PREFIX} Role check failed - insufficient permissions`, { 
        requestId, 
        userId: user.sub, 
        userRole: user.role, 
        requiredRoles: allowedRoles,
        path: c.req.path 
      });
      return c.json(
        errorResponse(ERROR_CODES.AUTHORIZATION_ERROR, 'You do not have permission to access this resource'),
        403
      );
    }

    console.info(`${LOG_PREFIX} Role check passed`, { requestId, userId: user.sub, userRole: user.role, requiredRoles: allowedRoles });
    await next();
  };
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: JwtPayload | undefined, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

/**
 * Check if user is admin or HR
 */
export function isAdminOrHR(user: JwtPayload | undefined): boolean {
  return hasRole(user, USER_ROLES.ADMIN, USER_ROLES.HR);
}

/**
 * Check if user is manager or above
 */
export function isManagerOrAbove(user: JwtPayload | undefined): boolean {
  return hasRole(user, USER_ROLES.ADMIN, USER_ROLES.HR, USER_ROLES.MANAGER, USER_ROLES.CSUITE);
}

/**
 * Error handling middleware
 */
export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (err) {
    const requestId = c.get('requestId');
    
    console.error(`${LOG_PREFIX} Error handled`, { 
      requestId, 
      path: c.req.path,
      method: c.req.method,
      error: err instanceof Error ? err.message : 'Unknown error',
      errorName: err instanceof Error ? err.name : undefined,
      stack: err instanceof Error ? err.stack : undefined
    });

    if (err instanceof AppError) {
      console.warn(`${LOG_PREFIX} AppError response`, { requestId, code: err.code, statusCode: err.statusCode });
      return c.json(errorResponse(err.code, err.message, err.details), err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500);
    }

    if (err instanceof Error) {
      // Handle Mongoose validation errors
      if (err.name === 'ValidationError') {
        console.warn(`${LOG_PREFIX} Validation error response`, { requestId, errorName: err.name });
        return c.json(errorResponse(ERROR_CODES.VALIDATION_ERROR, err.message), 422);
      }

      // Handle duplicate key errors
      if (err.name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
        console.warn(`${LOG_PREFIX} Duplicate key error response`, { requestId, errorName: err.name });
        return c.json(errorResponse(ERROR_CODES.CONFLICT, 'Resource already exists'), 409);
      }

      // Handle cast errors (invalid ObjectId)
      if (err.name === 'CastError') {
        console.warn(`${LOG_PREFIX} Cast error response`, { requestId, errorName: err.name });
        return c.json(errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Invalid ID format'), 400);
      }
    }

    console.error(`${LOG_PREFIX} Internal error response`, { requestId });
    return c.json(errorResponse(ERROR_CODES.INTERNAL_ERROR, 'Internal server error'), 500);
  }
}

/**
 * Request ID middleware
 */
export async function requestIdMiddleware(c: Context, next: Next): Promise<Response | void> {
  const existingId = c.req.header('X-Request-ID');
  const requestId = existingId || crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  console.info(`${LOG_PREFIX} Request ID assigned`, { 
    requestId, 
    source: existingId ? 'header' : 'generated',
    method: c.req.method,
    path: c.req.path 
  });
  await next();
}

/**
 * CORS middleware configuration
 */
export const corsConfig = {
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
};

/**
 * Simple in-memory rate limiter
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private windowMs: number = 60000,
    private maxRequests: number = 100
  ) {}

  isRateLimited(key: string): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return { limited: false, remaining: this.maxRequests - 1, resetTime };
    }

    entry.count++;
    if (entry.count > this.maxRequests) {
      return { limited: true, remaining: 0, resetTime: entry.resetTime };
    }

    return { limited: false, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  middleware() {
    return async (c: Context, next: Next): Promise<Response | void> => {
      const key = c.req.header('X-Forwarded-For') || 'unknown';
      const result = this.isRateLimited(key);
      const requestId = c.get('requestId');

      c.header('X-RateLimit-Limit', String(this.maxRequests));
      c.header('X-RateLimit-Remaining', String(result.remaining));
      c.header('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

      if (result.limited) {
        console.warn(`${LOG_PREFIX} Rate limit exceeded`, { 
          requestId, 
          clientKey: key, 
          limit: this.maxRequests,
          resetTime: new Date(result.resetTime).toISOString(),
          path: c.req.path 
        });
        return c.json(errorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests'), 429);
      }

      console.info(`${LOG_PREFIX} Rate limit check passed`, { 
        requestId, 
        clientKey: key, 
        remaining: result.remaining, 
        limit: this.maxRequests 
      });
      await next();
    };
  }
}

/**
 * Request logging middleware
 */
export async function loggerMiddleware(c: Context, next: Next): Promise<Response | void> {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get('requestId') || 'unknown';

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`[${new Date().toISOString()}] ${requestId} ${method} ${path} ${status} ${duration}ms`);
}
