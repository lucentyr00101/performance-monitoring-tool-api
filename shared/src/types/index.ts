import type { Types } from 'mongoose';

// Base types
export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User types (Auth Service)
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

// Employee types (Employee Service)
export interface IEmployee extends BaseDocument {
  userId?: Types.ObjectId;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  rank?: 'junior' | 'mid' | 'senior' | 'manager' | 'lead' | 'ceo';
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

// Goal types (Goals Service)
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

// Review types (Reviews Service)
export interface IReviewCycleSettings {
  selfReviewEnabled?: boolean;
  peerReviewEnabled?: boolean;
  includeGoalReview?: boolean;
  requireCalibration?: boolean;
  allowEmployeeViewBeforeRelease?: boolean;
}

export interface IReviewCycle extends BaseDocument {
  name: string;
  description?: string;
  type: 'annual' | 'semi_annual' | 'quarterly' | 'monthly' | 'probation' | 'project' | 'ad_hoc';
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  settings?: IReviewCycleSettings;
  createdBy?: Types.ObjectId;
  departments?: Types.ObjectId[];
  launchedAt?: Date;
  completedAt?: Date;
}

export interface IReview extends BaseDocument {
  reviewCycleId?: Types.ObjectId;
  adhocReviewId?: Types.ObjectId;
  employeeId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  reviewerType: 'self' | 'manager' | 'peer' | 'hr';
  status: 'pending' | 'in_progress' | 'submitted' | 'acknowledged' | 'disputed' | 'finalized';
  responses?: Array<{
    questionId: Types.ObjectId;
    questionText?: string;
    responseType?: string;
    response?: unknown;
    rating?: number;
    comment?: string;
  }>;
  goalReviews?: Array<{
    goalId: Types.ObjectId;
    selfRating?: number;
    managerRating?: number;
    selfComment?: string;
    managerComment?: string;
    achievement?: number;
  }>;
  overallRating?: number;
  ratingsBreakdown?: Record<string, number>;
  overallComment?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  developmentGoals?: string[];
  privateNotes?: string;
  submittedAt?: Date;
  acknowledgedAt?: Date;
  employeeComments?: string;
  calibratedRating?: number;
  calibratedBy?: Types.ObjectId;
  calibratedAt?: Date;
  releasedAt?: Date;
}

export interface IAdhocReviewSettings {
  selfReviewRequired: boolean;
  managerReviewRequired: boolean;
  includeGoals: boolean;
}

export interface IAdhocReviewAnswer {
  questionId: Types.ObjectId;
  value: string | number | boolean | string[];
}

export interface IAdhocReviewSubmission {
  status: 'pending' | 'in_progress' | 'submitted';
  submittedAt?: Date;
  answers: IAdhocReviewAnswer[];
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
  selfReview?: IAdhocReviewSubmission;
  managerReview?: IAdhocReviewSubmission;
  status:
    | 'initiated'
    | 'self_review_pending'
    | 'self_review_submitted'
    | 'manager_review_pending'
    | 'manager_review_submitted'
    | 'pending_acknowledgment'
    | 'acknowledged'
    | 'completed'
    | 'cancelled';
  settings: IAdhocReviewSettings;
  triggeredAt: Date;
  completedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgmentComments?: string;
}

// Review Form types
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

// Notification types
export type NotificationType =
  | 'review_assigned'
  | 'review_completed'
  | 'review_reminder'
  | 'goal_updated'
  | 'goal_due'
  | 'system'
  | 'announcement';

export type NotificationStatus = 'unread' | 'read';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface INotification extends BaseDocument {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  readAt?: Date;
}

// KPI / Analytics types
export interface IKpiTrends {
  performanceScore: number[];
  goalsCompletion: number[];
}

export interface IKpiData {
  averagePerformanceScore: number;
  goalsCompletionRate: number;
  reviewCompletionRate: number;
  employeeCount: number;
  activeReviewCycles: number;
  trends: IKpiTrends;
}

// API Response types
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

// Query types
export interface PaginationQuery {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  employeeId?: string;
  iat?: number;
  exp?: number;
}

// Service context
export interface ServiceContext {
  user?: JwtPayload;
  requestId?: string;
}
