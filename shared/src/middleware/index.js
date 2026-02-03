import { verify } from 'jsonwebtoken';
import { errorResponse, AppError } from '../utils/index.js';
import { ERROR_CODES, USER_ROLES } from '../constants/index.js';
/**
 * Get JWT secret from environment
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
}
/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
        return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Authorization header required'), 401);
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid authorization format'), 401);
    }
    const token = parts[1];
    if (!token) {
        return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Token required'), 401);
    }
    try {
        const decoded = verify(token, getJwtSecret());
        c.set('user', decoded);
        await next();
    }
    catch {
        return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid or expired token'), 401);
    }
}
/**
 * Optional authentication middleware - sets user if token present, continues otherwise
 */
export async function optionalAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
            try {
                const decoded = verify(parts[1], getJwtSecret());
                c.set('user', decoded);
            }
            catch {
                // Token invalid but optional, continue without user
            }
        }
    }
    await next();
}
/**
 * Role-based authorization middleware
 */
export function requireRoles(...allowedRoles) {
    return async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json(errorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 'Authentication required'), 401);
        }
        if (!allowedRoles.includes(user.role)) {
            return c.json(errorResponse(ERROR_CODES.AUTHORIZATION_ERROR, 'You do not have permission to access this resource'), 403);
        }
        await next();
    };
}
/**
 * Check if user has any of the specified roles
 */
export function hasRole(user, ...roles) {
    if (!user)
        return false;
    return roles.includes(user.role);
}
/**
 * Check if user is admin or HR
 */
export function isAdminOrHR(user) {
    return hasRole(user, USER_ROLES.ADMIN, USER_ROLES.HR);
}
/**
 * Check if user is manager or above
 */
export function isManagerOrAbove(user) {
    return hasRole(user, USER_ROLES.ADMIN, USER_ROLES.HR, USER_ROLES.MANAGER, USER_ROLES.CSUITE);
}
/**
 * Error handling middleware
 */
export async function errorHandler(c, next) {
    try {
        await next();
    }
    catch (err) {
        console.error('Error:', err);
        if (err instanceof AppError) {
            return c.json(errorResponse(err.code, err.message, err.details), err.statusCode);
        }
        if (err instanceof Error) {
            // Handle Mongoose validation errors
            if (err.name === 'ValidationError') {
                return c.json(errorResponse(ERROR_CODES.VALIDATION_ERROR, err.message), 422);
            }
            // Handle duplicate key errors
            if (err.name === 'MongoServerError' && err.code === 11000) {
                return c.json(errorResponse(ERROR_CODES.CONFLICT, 'Resource already exists'), 409);
            }
            // Handle cast errors (invalid ObjectId)
            if (err.name === 'CastError') {
                return c.json(errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Invalid ID format'), 400);
            }
        }
        return c.json(errorResponse(ERROR_CODES.INTERNAL_ERROR, 'Internal server error'), 500);
    }
}
/**
 * Request ID middleware
 */
export async function requestIdMiddleware(c, next) {
    const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);
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
    windowMs;
    maxRequests;
    requests = new Map();
    constructor(windowMs = 60000, maxRequests = 100) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }
    isRateLimited(key) {
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
        return async (c, next) => {
            const key = c.req.header('X-Forwarded-For') || 'unknown';
            const result = this.isRateLimited(key);
            c.header('X-RateLimit-Limit', String(this.maxRequests));
            c.header('X-RateLimit-Remaining', String(result.remaining));
            c.header('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
            if (result.limited) {
                return c.json(errorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests'), 429);
            }
            await next();
        };
    }
}
/**
 * Request logging middleware
 */
export async function loggerMiddleware(c, next) {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    const requestId = c.get('requestId') || 'unknown';
    await next();
    const duration = Date.now() - start;
    const status = c.res.status;
    console.log(`[${new Date().toISOString()}] ${requestId} ${method} ${path} ${status} ${duration}ms`);
}
//# sourceMappingURL=index.js.map