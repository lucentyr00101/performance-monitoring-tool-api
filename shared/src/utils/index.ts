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
 * Has isAppError property for reliable detection across module boundaries
 */
export class AppError extends Error {
  public readonly isAppError = true; // Marker for reliable instanceof check across module boundaries
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

  /**
   * Create error response object from this error
   */
  toResponse(): ApiResponse<never> {
    return errorResponse(this.code, this.message, this.details);
  }

  /**
   * Check if an error is an AppError (works across module boundaries)
   */
  static isAppError(err: unknown): err is AppError {
    return (
      err !== null &&
      typeof err === 'object' &&
      'isAppError' in err &&
      (err as { isAppError: boolean }).isAppError === true &&
      'code' in err &&
      'statusCode' in err &&
      'message' in err
    );
  }
}

/**
 * Throw helper - simplified error throwing
 * Usage: throw throwError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
 */
export function throwError(
  message: string,
  statusCode: number = 500,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: ValidationDetail[]
): never {
  throw new AppError(code, message, statusCode, details);
}

/**
 * Pre-defined error creators for common error scenarios
 */
export const createError = {
  // Validation errors
  validation: (message: string, details?: ValidationDetail[]) =>
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, 422, details),
  
  badRequest: (message: string, details?: ValidationDetail[]) =>
    new AppError(ERROR_CODES.BAD_REQUEST, message, 400, details),
  
  fieldRequired: (field: string) =>
    new AppError(ERROR_CODES.FIELD_REQUIRED, `${field} is required`, 400, [{ field, message: `${field} is required` }]),
  
  invalidFormat: (field: string, message?: string) =>
    new AppError(ERROR_CODES.INVALID_FORMAT, message || `Invalid ${field} format`, 400, [{ field, message: message || `Invalid ${field} format` }]),

  // Authentication errors
  authentication: (message: string = 'Authentication required') =>
    new AppError(ERROR_CODES.AUTHENTICATION_ERROR, message, 401),
  
  invalidCredentials: (message: string = 'Invalid email or password') =>
    new AppError(ERROR_CODES.INVALID_CREDENTIALS, message, 401),
  
  tokenExpired: (message: string = 'Token has expired') =>
    new AppError(ERROR_CODES.TOKEN_EXPIRED, message, 401),
  
  tokenInvalid: (message: string = 'Invalid token') =>
    new AppError(ERROR_CODES.TOKEN_INVALID, message, 401),
  
  accountLocked: (message: string = 'Account is temporarily locked. Please try again later.') =>
    new AppError(ERROR_CODES.ACCOUNT_LOCKED, message, 401),
  
  accountSuspended: (message: string = 'Account is suspended. Please contact support.') =>
    new AppError(ERROR_CODES.ACCOUNT_SUSPENDED, message, 401),

  // Authorization errors
  authorization: (message: string = 'Access denied') =>
    new AppError(ERROR_CODES.AUTHORIZATION_ERROR, message, 403),
  
  insufficientPermissions: (message: string = 'Insufficient permissions') =>
    new AppError(ERROR_CODES.INSUFFICIENT_PERMISSIONS, message, 403),

  // Resource errors
  notFound: (resource: string = 'Resource') =>
    new AppError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404),
  
  resourceNotFound: (resource: string, id?: string) =>
    new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, id ? `${resource} with ID '${id}' not found` : `${resource} not found`, 404),

  conflict: (message: string) =>
    new AppError(ERROR_CODES.CONFLICT, message, 409),
  
  alreadyExists: (resource: string, field?: string) =>
    new AppError(ERROR_CODES.ALREADY_EXISTS, field ? `${resource} with this ${field} already exists` : `${resource} already exists`, 409),
  
  emailTaken: (email?: string) =>
    new AppError(ERROR_CODES.EMAIL_TAKEN, email ? `Email '${email}' is already registered` : 'Email is already registered', 409),

  // Rate limiting
  rateLimitExceeded: (message: string = 'Too many requests. Please try again later.') =>
    new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, message, 429),

  // Internal errors
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
