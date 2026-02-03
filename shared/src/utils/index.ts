import type { ApiResponse, ApiError, PaginationMeta, ValidationDetail, ApiMeta } from '../types/index.js';
import { ERROR_CODES, PAGINATION } from '../constants/index.js';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, meta?: Omit<ApiMeta, 'timestamp'> | { pagination?: PaginationMeta } | Record<string, unknown>): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    } as ApiMeta,
  };

  return response;
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: ValidationDetail[]
): ApiResponse<never> {
  const error: ApiError = { code, message };
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
export function parsePagination(query: {
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
} {
  const page = Math.max(1, parseInt(String(query.page || PAGINATION.DEFAULT_PAGE), 10));
  const perPage = Math.min(
    PAGINATION.MAX_PER_PAGE,
    Math.max(1, parseInt(String(query.per_page || PAGINATION.DEFAULT_PER_PAGE), 10))
  );
  const skip = (page - 1) * perPage;
  const sortBy = query.sort_by || 'createdAt';
  const sortOrder = query.sort_order === 'asc' ? 'asc' : 'desc';

  return { page, perPage, skip, sortBy, sortOrder };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  perPage: number,
  totalItems: number
): PaginationMeta {
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
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ValidationDetail[];

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: ValidationDetail[]
  ) {
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
  validation: (message: string, details?: ValidationDetail[]) =>
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, 422, details),

  authentication: (message: string = 'Authentication required') =>
    new AppError(ERROR_CODES.AUTHENTICATION_ERROR, message, 401),

  authorization: (message: string = 'Access denied') =>
    new AppError(ERROR_CODES.AUTHORIZATION_ERROR, message, 403),

  notFound: (resource: string = 'Resource') =>
    new AppError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404),

  conflict: (message: string) =>
    new AppError(ERROR_CODES.CONFLICT, message, 409),

  rateLimitExceeded: () =>
    new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests', 429),

  internal: (message: string = 'Internal server error') =>
    new AppError(ERROR_CODES.INTERNAL_ERROR, message, 500),
};

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
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
export function generateEmployeeCode(sequence: number): string {
  return `EMP-${String(sequence).padStart(3, '0')}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: Date): boolean {
  return new Date(dueDate) < new Date();
}

/**
 * Get days remaining until date
 */
export function getDaysRemaining(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Sanitize object for response (remove sensitive fields)
 */
export function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash, passwordResetToken, passwordResetExpires, ...sanitized } = user;
  return sanitized;
}

/**
 * Convert MongoDB _id to id in object
 */
export function normalizeId<T extends { _id?: unknown }>(
  obj: T
): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = obj;
  return {
    ...rest,
    id: String(_id),
  } as Omit<T, '_id'> & { id: string };
}

/**
 * Normalize array of documents
 */
export function normalizeIds<T extends { _id?: unknown }>(
  arr: T[]
): Array<Omit<T, '_id'> & { id: string }> {
  return arr.map(normalizeId);
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if object ID is valid MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
