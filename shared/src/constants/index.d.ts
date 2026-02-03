export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly HR: "hr";
    readonly MANAGER: "manager";
    readonly EMPLOYEE: "employee";
    readonly CSUITE: "csuite";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const USER_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly SUSPENDED: "suspended";
};
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export declare const EMPLOYEE_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly TERMINATED: "terminated";
};
export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export declare const EMPLOYMENT_TYPES: {
    readonly FULL_TIME: "full-time";
    readonly PART_TIME: "part-time";
    readonly CONTRACT: "contract";
};
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];
export declare const GOAL_TYPES: {
    readonly INDIVIDUAL: "individual";
    readonly TEAM: "team";
    readonly DEPARTMENT: "department";
    readonly COMPANY: "company";
};
export type GoalType = (typeof GOAL_TYPES)[keyof typeof GOAL_TYPES];
export declare const GOAL_STATUS: {
    readonly DRAFT: "draft";
    readonly ACTIVE: "active";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];
export declare const KEY_RESULT_STATUS: {
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export type KeyResultStatus = (typeof KEY_RESULT_STATUS)[keyof typeof KEY_RESULT_STATUS];
export declare const REVIEW_CYCLE_TYPES: {
    readonly ANNUAL: "annual";
    readonly SEMI_ANNUAL: "semi-annual";
    readonly QUARTERLY: "quarterly";
    readonly MONTHLY: "monthly";
};
export type ReviewCycleType = (typeof REVIEW_CYCLE_TYPES)[keyof typeof REVIEW_CYCLE_TYPES];
export declare const REVIEW_CYCLE_STATUS: {
    readonly DRAFT: "draft";
    readonly ACTIVE: "active";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export type ReviewCycleStatus = (typeof REVIEW_CYCLE_STATUS)[keyof typeof REVIEW_CYCLE_STATUS];
export declare const REVIEW_TYPES: {
    readonly SELF: "self";
    readonly MANAGER: "manager";
    readonly PEER: "peer";
};
export type ReviewType = (typeof REVIEW_TYPES)[keyof typeof REVIEW_TYPES];
export declare const REVIEW_STATUS: {
    readonly PENDING: "pending";
    readonly IN_PROGRESS: "in_progress";
    readonly SUBMITTED: "submitted";
    readonly ACKNOWLEDGED: "acknowledged";
};
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
export declare const ADHOC_REVIEW_STATUS: {
    readonly INITIATED: "initiated";
    readonly PENDING_ACKNOWLEDGMENT: "pending_acknowledgment";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export type AdhocReviewStatus = (typeof ADHOC_REVIEW_STATUS)[keyof typeof ADHOC_REVIEW_STATUS];
export declare const REVIEW_FORM_STATUS: {
    readonly DRAFT: "draft";
    readonly PUBLISHED: "published";
    readonly ARCHIVED: "archived";
};
export type ReviewFormStatus = (typeof REVIEW_FORM_STATUS)[keyof typeof REVIEW_FORM_STATUS];
export declare const QUESTION_TYPES: {
    readonly RATING_SCALE: "rating_scale";
    readonly TEXT_SHORT: "text_short";
    readonly TEXT_LONG: "text_long";
    readonly MULTIPLE_CHOICE: "multiple_choice";
    readonly CHECKBOX: "checkbox";
    readonly YES_NO: "yes_no";
    readonly GOAL_RATING: "goal_rating";
    readonly NUMBER: "number";
};
export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];
export declare const FOR_REVIEWER: {
    readonly SELF: "self";
    readonly MANAGER: "manager";
    readonly BOTH: "both";
};
export type ForReviewer = (typeof FOR_REVIEWER)[keyof typeof FOR_REVIEWER];
export declare const DEPARTMENT_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
};
export type DepartmentStatus = (typeof DEPARTMENT_STATUS)[keyof typeof DEPARTMENT_STATUS];
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_PER_PAGE: 20;
    readonly MAX_PER_PAGE: 100;
};
export declare const JWT_EXPIRY: {
    readonly ACCESS_TOKEN: 3600;
    readonly REFRESH_TOKEN: 604800;
    readonly PASSWORD_RESET: 3600;
};
export declare const RATE_LIMITS: {
    readonly GENERAL: {
        readonly windowMs: 60000;
        readonly max: 100;
    };
    readonly LOGIN: {
        readonly windowMs: 60000;
        readonly max: 5;
    };
    readonly EXPORT: {
        readonly windowMs: 3600000;
        readonly max: 10;
    };
};
export declare const PERFORMANCE_STATUS: {
    readonly ON_TRACK: "on_track";
    readonly AT_RISK: "at_risk";
    readonly NEEDS_ATTENTION: "needs_attention";
};
export type PerformanceStatus = (typeof PERFORMANCE_STATUS)[keyof typeof PERFORMANCE_STATUS];
export declare const EXPORT_FORMATS: {
    readonly CSV: "csv";
    readonly XLSX: "xlsx";
    readonly PDF: "pdf";
};
export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];
//# sourceMappingURL=index.d.ts.map