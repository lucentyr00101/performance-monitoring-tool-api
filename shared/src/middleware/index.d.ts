import { Context, Next } from 'hono';
import type { JwtPayload } from '../types/index.js';
import { type UserRole } from '../constants/index.js';
declare module 'hono' {
    interface ContextVariableMap {
        user: JwtPayload;
        requestId: string;
    }
}
/**
 * Authentication middleware - verifies JWT token
 */
export declare function authMiddleware(c: Context, next: Next): Promise<Response | void>;
/**
 * Optional authentication middleware - sets user if token present, continues otherwise
 */
export declare function optionalAuthMiddleware(c: Context, next: Next): Promise<Response | void>;
/**
 * Role-based authorization middleware
 */
export declare function requireRoles(...allowedRoles: UserRole[]): (c: Context, next: Next) => Promise<Response | void>;
/**
 * Check if user has any of the specified roles
 */
export declare function hasRole(user: JwtPayload | undefined, ...roles: UserRole[]): boolean;
/**
 * Check if user is admin or HR
 */
export declare function isAdminOrHR(user: JwtPayload | undefined): boolean;
/**
 * Check if user is manager or above
 */
export declare function isManagerOrAbove(user: JwtPayload | undefined): boolean;
/**
 * Error handling middleware
 */
export declare function errorHandler(c: Context, next: Next): Promise<Response | void>;
/**
 * Request ID middleware
 */
export declare function requestIdMiddleware(c: Context, next: Next): Promise<Response | void>;
/**
 * CORS middleware configuration
 */
export declare const corsConfig: {
    origin: string;
    allowMethods: string[];
    allowHeaders: string[];
    exposeHeaders: string[];
    maxAge: number;
};
/**
 * Simple in-memory rate limiter
 */
export declare class RateLimiter {
    private windowMs;
    private maxRequests;
    private requests;
    constructor(windowMs?: number, maxRequests?: number);
    isRateLimited(key: string): {
        limited: boolean;
        remaining: number;
        resetTime: number;
    };
    middleware(): (c: Context, next: Next) => Promise<Response | void>;
}
/**
 * Request logging middleware
 */
export declare function loggerMiddleware(c: Context, next: Next): Promise<Response | void>;
//# sourceMappingURL=index.d.ts.map