import { z } from 'zod';

// Common field validators
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z.string().optional();

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const optionalDateSchema = dateSchema.optional();

// Pagination query schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Common status schemas
export const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export const employeeStatusSchema = z.enum(['active', 'inactive', 'terminated']);
export const departmentStatusSchema = z.enum(['active', 'inactive']);
export const goalStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled']);
export const goalTypeSchema = z.enum(['individual', 'team', 'department', 'company']);
export const reviewStatusSchema = z.enum(['pending', 'in_progress', 'submitted', 'acknowledged']);
export const reviewCycleStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled']);
export const reviewCycleTypeSchema = z.enum(['annual', 'semi-annual', 'quarterly', 'monthly']);
export const employmentTypeSchema = z.enum(['full-time', 'part-time', 'contract']);
export const reviewTypeSchema = z.enum(['self', 'manager', 'peer']);
export const userRoleSchema = z.enum(['admin', 'hr', 'manager', 'employee', 'csuite']);

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

// Employee schemas
export const createEmployeeSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: emailSchema,
  phone: phoneSchema,
  job_title: z.string().max(100).optional(),
  department_id: objectIdSchema.optional(),
  manager_id: objectIdSchema.optional(),
  hire_date: optionalDateSchema,
  employment_type: employmentTypeSchema.default('full-time'),
  avatar_url: z.string().url().optional(),
  create_user_account: z.boolean().default(true),
  user_role: userRoleSchema.default('employee'),
});

export const updateEmployeeSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  job_title: z.string().max(100).optional(),
  department_id: objectIdSchema.nullable().optional(),
  manager_id: objectIdSchema.nullable().optional(),
  employment_type: employmentTypeSchema.optional(),
  status: employeeStatusSchema.optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export const employeeQuerySchema = paginationQuerySchema.extend({
  status: employeeStatusSchema.optional(),
  department_id: objectIdSchema.optional(),
  manager_id: objectIdSchema.optional(),
  search: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  hire_date: optionalDateSchema,
  department: z.string().optional(), // Department name filter
});

// Department schemas
export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  parent_id: objectIdSchema.optional(),
  manager_id: objectIdSchema.optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  parent_id: objectIdSchema.nullable().optional(),
  manager_id: objectIdSchema.nullable().optional(),
  status: departmentStatusSchema.optional(),
});

export const departmentQuerySchema = z.object({
  status: departmentStatusSchema.optional(),
  parent_id: objectIdSchema.optional(),
  search: z.string().optional(),
});

// Goal schemas
export const keyResultSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  target_value: z.number(),
  unit: z.string().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: goalTypeSchema,
  owner_id: objectIdSchema,
  parent_goal_id: objectIdSchema.optional(),
  start_date: optionalDateSchema,
  due_date: optionalDateSchema,
  key_results: z.array(keyResultSchema).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: goalTypeSchema.optional(),
  status: goalStatusSchema.optional(),
  owner_id: objectIdSchema.optional(),
  parent_goal_id: objectIdSchema.nullable().optional(),
  start_date: optionalDateSchema,
  due_date: optionalDateSchema,
});

export const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
  note: z.string().optional(),
});

export const goalQuerySchema = paginationQuerySchema.extend({
  type: goalTypeSchema.optional(),
  status: goalStatusSchema.optional(),
  owner_id: objectIdSchema.optional(),
  department_id: objectIdSchema.optional(),
  parent_goal_id: objectIdSchema.optional(),
  due_before: optionalDateSchema,
  due_after: optionalDateSchema,
  search: z.string().optional(),
});

export const updateKeyResultSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  target_value: z.number().optional(),
  current_value: z.number().optional(),
  unit: z.string().optional(),
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
});

// Review Cycle schemas
export const reviewCycleSettingsSchema = z.object({
  include_self_assessment: z.boolean().default(true),
  include_manager_review: z.boolean().default(true),
  include_peer_review: z.boolean().default(false),
  rating_scale: z.object({
    min: z.number().default(1),
    max: z.number().default(5),
  }).optional(),
});

export const createReviewCycleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: reviewCycleTypeSchema,
  start_date: dateSchema,
  end_date: dateSchema,
  settings: reviewCycleSettingsSchema.optional(),
  departments: z.array(objectIdSchema).optional(),
});

export const updateReviewCycleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: reviewCycleTypeSchema.optional(),
  start_date: optionalDateSchema,
  end_date: optionalDateSchema,
  settings: reviewCycleSettingsSchema.optional(),
  departments: z.array(objectIdSchema).optional(),
});

export const reviewCycleQuerySchema = paginationQuerySchema.extend({
  status: reviewCycleStatusSchema.optional(),
  type: reviewCycleTypeSchema.optional(),
  year: z.coerce.number().int().optional(),
});

// Review schemas
export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  ratings_breakdown: z.record(z.number()).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  comments: z.string().optional(),
  status: z.enum(['in_progress', 'submitted']).optional(),
});

export const acknowledgeReviewSchema = z.object({
  employee_comments: z.string().optional(),
});

export const reviewQuerySchema = paginationQuerySchema.extend({
  cycle_id: objectIdSchema.optional(),
  employee_id: objectIdSchema.optional(),
  reviewer_id: objectIdSchema.optional(),
  type: reviewTypeSchema.optional(),
  status: reviewStatusSchema.optional(),
});

// Ad-hoc review schemas
export const createAdhocReviewSchema = z.object({
  employee_id: objectIdSchema,
  due_date: optionalDateSchema,
  reason: z.string().max(500).optional(),
  review_form_id: objectIdSchema.nullable().optional(),
  settings: z.object({
    self_review_required: z.boolean().default(true),
    manager_review_required: z.boolean().default(true),
    include_goals: z.boolean().default(true),
  }).optional(),
});

export const adhocReviewQuerySchema = paginationQuerySchema.extend({
  status: z.enum([
    'initiated', 'self_review_pending', 'self_review_submitted',
    'manager_review_pending', 'manager_review_submitted',
    'pending_acknowledgment', 'acknowledged', 'completed', 'cancelled',
  ]).optional(),
  employee_id: objectIdSchema.optional(),
  manager_id: objectIdSchema.optional(),
  triggered_by: objectIdSchema.optional(),
  due_before: optionalDateSchema,
  overdue: z.coerce.boolean().optional(),
});

// Review form schemas
export const questionConfigSchema = z.object({
  scale_type: z.enum(['numeric']).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  labels: z.record(z.string()).optional(),
  min_length: z.number().optional(),
  max_length: z.number().optional(),
  options: z.array(z.string()).optional(),
  include_active_goals: z.boolean().optional(),
  include_completed_goals: z.boolean().optional(),
});

export const questionSchema = z.object({
  text: z.string().min(1),
  help_text: z.string().optional(),
  type: z.enum(['rating_scale', 'text_short', 'text_long', 'multiple_choice', 'checkbox', 'yes_no', 'goal_rating', 'number']),
  required: z.boolean().default(false),
  for_reviewer: z.enum(['self', 'manager', 'both']).default('both'),
  weight: z.number().default(1),
  config: questionConfigSchema.optional(),
});

export const sectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
  collapsible: z.boolean().default(false),
  for_reviewer: z.enum(['self', 'manager', 'both']).default('both'),
  questions: z.array(questionSchema),
});

export const createReviewFormSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  instructions: z.string().optional(),
  sections: z.array(sectionSchema),
  settings: z.object({
    rating_scale: z.object({
      min: z.number().default(1),
      max: z.number().default(5),
    }).optional(),
  }).optional(),
});

export const updateReviewFormSchema = createReviewFormSchema.partial();

export const assignDepartmentsSchema = z.object({
  departments: z.array(z.object({
    department_id: objectIdSchema,
    form_type: z.enum(['self', 'manager', 'both']).default('both'),
    effective_date: optionalDateSchema,
  })),
});

export const cloneFormSchema = z.object({
  name: z.string().min(1).max(255),
});

export const reviewFormQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_default: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  period: z.enum(['month', 'quarter', 'year']).optional(),
  year: z.coerce.number().int().optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  department_id: objectIdSchema.optional(),
});

export const kpiQuerySchema = z.object({
  period: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
  department: objectIdSchema.optional(),
});

export const exportQuerySchema = z.object({
  type: z.enum(['goals', 'reviews', 'employees']),
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
  period: z.enum(['month', 'quarter', 'year']).optional(),
  year: z.coerce.number().int().optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  department_id: objectIdSchema.optional(),
});

// Notification schemas
export const notificationQuerySchema = paginationQuerySchema.extend({
  type: z.enum([
    'review_assigned', 'review_completed', 'review_reminder',
    'goal_updated', 'goal_due', 'system', 'announcement',
  ]).optional(),
  status: z.enum(['unread', 'read', 'all']).default('all'),
});

export const createNotificationSchema = z.object({
  user_id: objectIdSchema,
  type: z.enum([
    'review_assigned', 'review_completed', 'review_reminder',
    'goal_updated', 'goal_due', 'system', 'announcement',
  ]),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  action_url: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Adhoc review submission schemas
export const reviewAnswerSchema = z.object({
  questionId: objectIdSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
  ]),
});

export const submitAdhocReviewSchema = z.object({
  answers: z.array(reviewAnswerSchema).min(1, 'At least one answer is required'),
  status: z.enum(['submitted', 'in_progress']).default('submitted'),
});

export const acknowledgeAdhocReviewSchema = z.object({
  comments: z.string().max(2000).optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type KeyResultInput = z.infer<typeof keyResultSchema>;
export type UpdateKeyResultInput = z.infer<typeof updateKeyResultSchema>;
export type CreateReviewCycleInput = z.infer<typeof createReviewCycleSchema>;
export type UpdateReviewCycleInput = z.infer<typeof updateReviewCycleSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateAdhocReviewInput = z.infer<typeof createAdhocReviewSchema>;
export type CreateReviewFormInput = z.infer<typeof createReviewFormSchema>;
export type UpdateReviewFormInput = z.infer<typeof updateReviewFormSchema>;
export type KpiQueryInput = z.infer<typeof kpiQuerySchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type SubmitAdhocReviewInput = z.infer<typeof submitAdhocReviewSchema>;
export type AcknowledgeAdhocReviewInput = z.infer<typeof acknowledgeAdhocReviewSchema>;
