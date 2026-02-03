import type { Types } from 'mongoose';
export interface BaseDocument {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUser extends BaseDocument {
    email: string;
    passwordHash: string;
    role: 'admin' | 'hr' | 'manager' | 'employee' | 'csuite';
    status: 'active' | 'inactive' | 'suspended';
    employeeId?: Types.ObjectId;
    lastLoginAt?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}
export interface IRefreshToken extends BaseDocument {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
}
export interface IEmployee extends BaseDocument {
    userId?: Types.ObjectId;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    departmentId?: Types.ObjectId;
    managerId?: Types.ObjectId;
    hireDate?: Date;
    employmentType: 'full-time' | 'part-time' | 'contract';
    avatarUrl?: string;
    status: 'active' | 'inactive' | 'terminated';
}
export interface IDepartment extends BaseDocument {
    name: string;
    description?: string;
    parentId?: Types.ObjectId;
    managerId?: Types.ObjectId;
    status: 'active' | 'inactive';
}
export interface IKeyResult {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    unit?: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface IGoal extends BaseDocument {
    title: string;
    description?: string;
    type: 'individual' | 'team' | 'department' | 'company';
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    progress: number;
    ownerId: Types.ObjectId;
    parentGoalId?: Types.ObjectId;
    startDate?: Date;
    dueDate?: Date;
    completedAt?: Date;
    keyResults: IKeyResult[];
}
export interface IReviewCycleSettings {
    includeSelfAssessment: boolean;
    includeManagerReview: boolean;
    includePeerReview: boolean;
    ratingScale: {
        min: number;
        max: number;
        labels?: Record<string, string>;
    };
}
export interface IReviewCycle extends BaseDocument {
    name: string;
    description?: string;
    type: 'annual' | 'semi-annual' | 'quarterly' | 'monthly';
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    settings: IReviewCycleSettings;
    createdBy: Types.ObjectId;
    departments?: Types.ObjectId[];
}
export interface IReview extends BaseDocument {
    cycleId?: Types.ObjectId;
    adhocReviewId?: Types.ObjectId;
    employeeId: Types.ObjectId;
    reviewerId: Types.ObjectId;
    type: 'self' | 'manager' | 'peer';
    status: 'pending' | 'in_progress' | 'submitted' | 'acknowledged';
    isAdhoc: boolean;
    formId?: Types.ObjectId;
    formVersion?: string;
    formSnapshot?: object;
    rating?: number;
    ratingsBreakdown?: Record<string, number>;
    strengths?: string;
    improvements?: string;
    comments?: string;
    employeeComments?: string;
    submittedAt?: Date;
    acknowledgedAt?: Date;
}
export interface IAdhocReviewSettings {
    selfReviewRequired: boolean;
    managerReviewRequired: boolean;
    includeGoals: boolean;
}
export interface IAdhocReview extends BaseDocument {
    employeeId: Types.ObjectId;
    managerId: Types.ObjectId;
    triggeredBy: Types.ObjectId;
    reason?: string;
    dueDate: Date;
    reviewFormId?: Types.ObjectId;
    selfReviewId?: Types.ObjectId;
    managerReviewId?: Types.ObjectId;
    status: 'initiated' | 'pending_acknowledgment' | 'completed' | 'cancelled';
    settings: IAdhocReviewSettings;
    triggeredAt: Date;
    completedAt?: Date;
}
export interface IQuestionConfig {
    scaleType?: 'numeric';
    min?: number;
    max?: number;
    labels?: Record<string, string>;
    minLength?: number;
    maxLength?: number;
    options?: string[];
    includeActiveGoals?: boolean;
    includeCompletedGoals?: boolean;
}
export interface IQuestion {
    _id: Types.ObjectId;
    text: string;
    helpText?: string;
    type: 'rating_scale' | 'text_short' | 'text_long' | 'multiple_choice' | 'checkbox' | 'yes_no' | 'goal_rating' | 'number';
    required: boolean;
    forReviewer: 'self' | 'manager' | 'both';
    weight: number;
    config?: IQuestionConfig;
}
export interface ISection {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    order: number;
    collapsible: boolean;
    forReviewer: 'self' | 'manager' | 'both';
    questions: IQuestion[];
}
export interface IReviewFormSettings {
    ratingScale: {
        min: number;
        max: number;
        labels?: Record<string, string>;
    };
}
export interface IReviewForm extends BaseDocument {
    name: string;
    description?: string;
    instructions?: string;
    version: string;
    status: 'draft' | 'published' | 'archived';
    isDefault: boolean;
    sections: ISection[];
    settings: IReviewFormSettings;
    createdBy: Types.ObjectId;
    publishedAt?: Date;
}
export interface IDepartmentFormAssignment extends BaseDocument {
    departmentId: Types.ObjectId;
    reviewFormId: Types.ObjectId;
    formType: 'self' | 'manager' | 'both';
    effectiveDate: Date;
    assignedBy: Types.ObjectId;
    status: 'active' | 'inactive';
}
export interface IFormVersionHistory extends BaseDocument {
    reviewFormId: Types.ObjectId;
    version: string;
    sections: object;
    changedBy: Types.ObjectId;
    changeSummary?: string;
}
export interface INotification extends BaseDocument {
    userId: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta: ApiMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: ValidationDetail[];
}
export interface ValidationDetail {
    field: string;
    message: string;
}
export interface ApiMeta {
    timestamp: string;
    pagination?: PaginationMeta;
}
export interface PaginationMeta {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
}
export interface PaginationQuery {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    employeeId?: string;
    iat?: number;
    exp?: number;
}
export interface ServiceContext {
    user?: JwtPayload;
    requestId?: string;
}
//# sourceMappingURL=index.d.ts.map