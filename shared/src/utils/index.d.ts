import type { ApiResponse, PaginationMeta, ValidationDetail, ApiMeta } from '../types/index.js';
/**
 * Create a success response
 */
export declare function successResponse<T>(data: T, meta?: Omit<ApiMeta, 'timestamp'> | {
    pagination?: PaginationMeta;
} | Record<string, unknown>): ApiResponse<T>;
/**
 * Create an error response
 */
export declare function errorResponse(code: string, message: string, details?: ValidationDetail[]): ApiResponse<never>;
/**
 * Parse pagination parameters from query
 */
export declare function parsePagination(query: {
    page?: string | number;
    per_page?: string | number;
    sort_by?: string;
    sort_order?: string;
}): {
    page: number;
    perPage: number;
    skip: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
};
/**
 * Create pagination metadata
 */
export declare function createPaginationMeta(page: number, perPage: number, totalItems: number): PaginationMeta;
/**
 * Application Error class with error code
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: ValidationDetail[];
    constructor(code: string, message: string, statusCode?: number, details?: ValidationDetail[]);
}
/**
 * Pre-defined error creators
 */
export declare const createError: {
    validation: (message: string, details?: ValidationDetail[]) => AppError;
    authentication: (message?: string) => AppError;
    authorization: (message?: string) => AppError;
    notFound: (resource?: string) => AppError;
    conflict: (message: string) => AppError;
    rateLimitExceeded: () => AppError;
    internal: (message?: string) => AppError;
};
/**
 * Generate a random token
 */
export declare function generateToken(length?: number): string;
/**
 * Generate employee code
 */
export declare function generateEmployeeCode(sequence: number): string;
/**
 * Calculate progress percentage
 */
export declare function calculateProgress(current: number, target: number): number;
/**
 * Check if date is overdue
 */
export declare function isOverdue(dueDate: Date): boolean;
/**
 * Get days remaining until date
 */
export declare function getDaysRemaining(date: Date): number;
/**
 * Sanitize object for response (remove sensitive fields)
 */
export declare function sanitizeUser(user: Record<string, unknown>): Record<string, unknown>;
/**
 * Convert MongoDB _id to id in object
 */
export declare function normalizeId<T extends {
    _id?: unknown;
}>(obj: T): Omit<T, '_id'> & {
    id: string;
};
/**
 * Normalize array of documents
 */
export declare function normalizeIds<T extends {
    _id?: unknown;
}>(arr: T[]): Array<Omit<T, '_id'> & {
    id: string;
}>;
/**
 * Sleep utility for testing
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Check if object ID is valid MongoDB ObjectId format
 */
export declare function isValidObjectId(id: string): boolean;
//# sourceMappingURL=index.d.ts.map