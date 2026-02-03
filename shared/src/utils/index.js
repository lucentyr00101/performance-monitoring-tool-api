import { ERROR_CODES, PAGINATION } from '../constants/index.js';
/**
 * Create a success response
 */
export function successResponse(data, meta) {
    const response = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
    return response;
}
/**
 * Create an error response
 */
export function errorResponse(code, message, details) {
    const error = { code, message };
    if (details && details.length > 0) {
        error.details = details;
    }
    return {
        success: false,
        error,
        meta: {
            timestamp: new Date().toISOString(),
        },
    };
}
/**
 * Parse pagination parameters from query
 */
export function parsePagination(query) {
    const page = Math.max(1, parseInt(String(query.page || PAGINATION.DEFAULT_PAGE), 10));
    const perPage = Math.min(PAGINATION.MAX_PER_PAGE, Math.max(1, parseInt(String(query.per_page || PAGINATION.DEFAULT_PER_PAGE), 10)));
    const skip = (page - 1) * perPage;
    const sortBy = query.sort_by || 'createdAt';
    const sortOrder = query.sort_order === 'asc' ? 'asc' : 'desc';
    return { page, perPage, skip, sortBy, sortOrder };
}
/**
 * Create pagination metadata
 */
export function createPaginationMeta(page, perPage, totalItems) {
    return {
        page,
        per_page: perPage,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / perPage),
    };
}
/**
 * Application Error class with error code
 */
export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Pre-defined error creators
 */
export const createError = {
    validation: (message, details) => new AppError(ERROR_CODES.VALIDATION_ERROR, message, 422, details),
    authentication: (message = 'Authentication required') => new AppError(ERROR_CODES.AUTHENTICATION_ERROR, message, 401),
    authorization: (message = 'Access denied') => new AppError(ERROR_CODES.AUTHORIZATION_ERROR, message, 403),
    notFound: (resource = 'Resource') => new AppError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404),
    conflict: (message) => new AppError(ERROR_CODES.CONFLICT, message, 409),
    rateLimitExceeded: () => new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests', 429),
    internal: (message = 'Internal server error') => new AppError(ERROR_CODES.INTERNAL_ERROR, message, 500),
};
/**
 * Generate a random token
 */
export function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
/**
 * Generate employee code
 */
export function generateEmployeeCode(sequence) {
    return `EMP-${String(sequence).padStart(3, '0')}`;
}
/**
 * Calculate progress percentage
 */
export function calculateProgress(current, target) {
    if (target === 0)
        return 0;
    const progress = (current / target) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
}
/**
 * Check if date is overdue
 */
export function isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}
/**
 * Get days remaining until date
 */
export function getDaysRemaining(date) {
    const now = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * Sanitize object for response (remove sensitive fields)
 */
export function sanitizeUser(user) {
    const { passwordHash, passwordResetToken, passwordResetExpires, ...sanitized } = user;
    return sanitized;
}
/**
 * Convert MongoDB _id to id in object
 */
export function normalizeId(obj) {
    const { _id, ...rest } = obj;
    return {
        ...rest,
        id: String(_id),
    };
}
/**
 * Normalize array of documents
 */
export function normalizeIds(arr) {
    return arr.map(normalizeId);
}
/**
 * Sleep utility for testing
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Check if object ID is valid MongoDB ObjectId format
 */
export function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
//# sourceMappingURL=index.js.map