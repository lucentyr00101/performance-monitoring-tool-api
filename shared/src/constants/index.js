// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    HR: 'hr',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    CSUITE: 'csuite',
};
// User status
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
};
// Employee status
export const EMPLOYEE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated',
};
// Employment types
export const EMPLOYMENT_TYPES = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
};
// Goal types
export const GOAL_TYPES = {
    INDIVIDUAL: 'individual',
    TEAM: 'team',
    DEPARTMENT: 'department',
    COMPANY: 'company',
};
// Goal status
export const GOAL_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
// Key result status
export const KEY_RESULT_STATUS = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
// Review cycle types
export const REVIEW_CYCLE_TYPES = {
    ANNUAL: 'annual',
    SEMI_ANNUAL: 'semi-annual',
    QUARTERLY: 'quarterly',
    MONTHLY: 'monthly',
};
// Review cycle status
export const REVIEW_CYCLE_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
// Review types
export const REVIEW_TYPES = {
    SELF: 'self',
    MANAGER: 'manager',
    PEER: 'peer',
};
// Review status
export const REVIEW_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    ACKNOWLEDGED: 'acknowledged',
};
// Ad-hoc review status
export const ADHOC_REVIEW_STATUS = {
    INITIATED: 'initiated',
    PENDING_ACKNOWLEDGMENT: 'pending_acknowledgment',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
// Review form status
export const REVIEW_FORM_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
};
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
};
// For reviewer
export const FOR_REVIEWER = {
    SELF: 'self',
    MANAGER: 'manager',
    BOTH: 'both',
};
// Department status
export const DEPARTMENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};
// Error codes
export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PER_PAGE: 20,
    MAX_PER_PAGE: 100,
};
// JWT expiry in seconds
export const JWT_EXPIRY = {
    ACCESS_TOKEN: 3600, // 1 hour
    REFRESH_TOKEN: 604800, // 7 days
    PASSWORD_RESET: 3600, // 1 hour
};
// Rate limiting
export const RATE_LIMITS = {
    GENERAL: { windowMs: 60000, max: 100 },
    LOGIN: { windowMs: 60000, max: 5 },
    EXPORT: { windowMs: 3600000, max: 10 },
};
// Performance status
export const PERFORMANCE_STATUS = {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    NEEDS_ATTENTION: 'needs_attention',
};
// Export formats
export const EXPORT_FORMATS = {
    CSV: 'csv',
    XLSX: 'xlsx',
    PDF: 'pdf',
};
//# sourceMappingURL=index.js.map