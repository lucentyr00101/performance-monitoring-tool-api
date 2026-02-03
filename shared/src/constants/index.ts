// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CSUITE: 'csuite',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// Employee status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
} as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
} as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

// Goal types
export const GOAL_TYPES = {
  INDIVIDUAL: 'individual',
  TEAM: 'team',
  DEPARTMENT: 'department',
  COMPANY: 'company',
} as const;

export type GoalType = (typeof GOAL_TYPES)[keyof typeof GOAL_TYPES];

// Goal status
export const GOAL_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];

// Key result status
export const KEY_RESULT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type KeyResultStatus = (typeof KEY_RESULT_STATUS)[keyof typeof KEY_RESULT_STATUS];

// Review cycle types
export const REVIEW_CYCLE_TYPES = {
  ANNUAL: 'annual',
  SEMI_ANNUAL: 'semi-annual',
  QUARTERLY: 'quarterly',
  MONTHLY: 'monthly',
} as const;

export type ReviewCycleType = (typeof REVIEW_CYCLE_TYPES)[keyof typeof REVIEW_CYCLE_TYPES];

// Review cycle status
export const REVIEW_CYCLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ReviewCycleStatus = (typeof REVIEW_CYCLE_STATUS)[keyof typeof REVIEW_CYCLE_STATUS];

// Review types
export const REVIEW_TYPES = {
  SELF: 'self',
  MANAGER: 'manager',
  PEER: 'peer',
} as const;

export type ReviewType = (typeof REVIEW_TYPES)[keyof typeof REVIEW_TYPES];

// Review status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  ACKNOWLEDGED: 'acknowledged',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

// Ad-hoc review status
export const ADHOC_REVIEW_STATUS = {
  INITIATED: 'initiated',
  PENDING_ACKNOWLEDGMENT: 'pending_acknowledgment',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type AdhocReviewStatus = (typeof ADHOC_REVIEW_STATUS)[keyof typeof ADHOC_REVIEW_STATUS];

// Review form status
export const REVIEW_FORM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ReviewFormStatus = (typeof REVIEW_FORM_STATUS)[keyof typeof REVIEW_FORM_STATUS];

// Question types
export const QUESTION_TYPES = {
  RATING_SCALE: 'rating_scale',
  TEXT_SHORT: 'text_short',
  TEXT_LONG: 'text_long',
  MULTIPLE_CHOICE: 'multiple_choice',
  CHECKBOX: 'checkbox',
  YES_NO: 'yes_no',
  GOAL_RATING: 'goal_rating',
  NUMBER: 'number',
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

// For reviewer
export const FOR_REVIEWER = {
  SELF: 'self',
  MANAGER: 'manager',
  BOTH: 'both',
} as const;

export type ForReviewer = (typeof FOR_REVIEWER)[keyof typeof FOR_REVIEWER];

// Department status
export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type DepartmentStatus = (typeof DEPARTMENT_STATUS)[keyof typeof DEPARTMENT_STATUS];

// Error codes
export const ERROR_CODES = {
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  
  // Authentication errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // Authorization errors
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Field-specific errors
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

// JWT expiry in seconds
export const JWT_EXPIRY = {
  ACCESS_TOKEN: 3600, // 1 hour
  REFRESH_TOKEN: 604800, // 7 days
  PASSWORD_RESET: 3600, // 1 hour
} as const;

// Rate limiting
export const RATE_LIMITS = {
  GENERAL: { windowMs: 60000, max: 100 },
  LOGIN: { windowMs: 60000, max: 5 },
  EXPORT: { windowMs: 3600000, max: 10 },
} as const;

// Performance status
export const PERFORMANCE_STATUS = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  NEEDS_ATTENTION: 'needs_attention',
} as const;

export type PerformanceStatus = (typeof PERFORMANCE_STATUS)[keyof typeof PERFORMANCE_STATUS];

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  XLSX: 'xlsx',
  PDF: 'pdf',
} as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];
