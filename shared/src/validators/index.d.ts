import { z } from 'zod';
export declare const objectIdSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const phoneSchema: z.ZodOptional<z.ZodString>;
export declare const dateSchema: z.ZodString;
export declare const optionalDateSchema: z.ZodOptional<z.ZodString>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    sort_by?: string | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const userStatusSchema: z.ZodEnum<["active", "inactive", "suspended"]>;
export declare const employeeStatusSchema: z.ZodEnum<["active", "inactive", "terminated"]>;
export declare const departmentStatusSchema: z.ZodEnum<["active", "inactive"]>;
export declare const goalStatusSchema: z.ZodEnum<["draft", "active", "completed", "cancelled"]>;
export declare const goalTypeSchema: z.ZodEnum<["individual", "team", "department", "company"]>;
export declare const reviewStatusSchema: z.ZodEnum<["pending", "in_progress", "submitted", "acknowledged"]>;
export declare const reviewCycleStatusSchema: z.ZodEnum<["draft", "active", "completed", "cancelled"]>;
export declare const reviewCycleTypeSchema: z.ZodEnum<["annual", "semi-annual", "quarterly", "monthly"]>;
export declare const employmentTypeSchema: z.ZodEnum<["full-time", "part-time", "contract"]>;
export declare const reviewTypeSchema: z.ZodEnum<["self", "manager", "peer"]>;
export declare const userRoleSchema: z.ZodEnum<["admin", "hr", "manager", "employee", "csuite"]>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
}, {
    refresh_token: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    password_confirmation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
    password_confirmation: string;
}, {
    password: string;
    token: string;
    password_confirmation: string;
}>, {
    password: string;
    token: string;
    password_confirmation: string;
}, {
    password: string;
    token: string;
    password_confirmation: string;
}>;
export declare const createEmployeeSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    job_title: z.ZodOptional<z.ZodString>;
    department_id: z.ZodOptional<z.ZodString>;
    manager_id: z.ZodOptional<z.ZodString>;
    hire_date: z.ZodOptional<z.ZodString>;
    employment_type: z.ZodDefault<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    avatar_url: z.ZodOptional<z.ZodString>;
    create_user_account: z.ZodDefault<z.ZodBoolean>;
    user_role: z.ZodDefault<z.ZodEnum<["admin", "hr", "manager", "employee", "csuite"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    employment_type: "full-time" | "part-time" | "contract";
    create_user_account: boolean;
    user_role: "admin" | "hr" | "manager" | "employee" | "csuite";
    phone?: string | undefined;
    job_title?: string | undefined;
    department_id?: string | undefined;
    manager_id?: string | undefined;
    hire_date?: string | undefined;
    avatar_url?: string | undefined;
}, {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | undefined;
    job_title?: string | undefined;
    department_id?: string | undefined;
    manager_id?: string | undefined;
    hire_date?: string | undefined;
    employment_type?: "full-time" | "part-time" | "contract" | undefined;
    avatar_url?: string | undefined;
    create_user_account?: boolean | undefined;
    user_role?: "admin" | "hr" | "manager" | "employee" | "csuite" | undefined;
}>;
export declare const updateEmployeeSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    job_title: z.ZodOptional<z.ZodString>;
    department_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    manager_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    employment_type: z.ZodOptional<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "terminated"]>>;
    avatar_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "terminated" | undefined;
    email?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    job_title?: string | undefined;
    department_id?: string | null | undefined;
    manager_id?: string | null | undefined;
    employment_type?: "full-time" | "part-time" | "contract" | undefined;
    avatar_url?: string | null | undefined;
}, {
    status?: "active" | "inactive" | "terminated" | undefined;
    email?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    job_title?: string | undefined;
    department_id?: string | null | undefined;
    manager_id?: string | null | undefined;
    employment_type?: "full-time" | "part-time" | "contract" | undefined;
    avatar_url?: string | null | undefined;
}>;
export declare const employeeQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "terminated"]>>;
    department_id: z.ZodOptional<z.ZodString>;
    manager_id: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    search?: string | undefined;
    sort_by?: string | undefined;
    status?: "active" | "inactive" | "terminated" | undefined;
    department_id?: string | undefined;
    manager_id?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    status?: "active" | "inactive" | "terminated" | undefined;
    department_id?: string | undefined;
    manager_id?: string | undefined;
}>;
export declare const createDepartmentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    parent_id: z.ZodOptional<z.ZodString>;
    manager_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    manager_id?: string | undefined;
    description?: string | undefined;
    parent_id?: string | undefined;
}, {
    name: string;
    manager_id?: string | undefined;
    description?: string | undefined;
    parent_id?: string | undefined;
}>;
export declare const updateDepartmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    manager_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | undefined;
    manager_id?: string | null | undefined;
    name?: string | undefined;
    description?: string | undefined;
    parent_id?: string | null | undefined;
}, {
    status?: "active" | "inactive" | undefined;
    manager_id?: string | null | undefined;
    name?: string | undefined;
    description?: string | undefined;
    parent_id?: string | null | undefined;
}>;
export declare const departmentQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    parent_id: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "active" | "inactive" | undefined;
    parent_id?: string | undefined;
}, {
    search?: string | undefined;
    status?: "active" | "inactive" | undefined;
    parent_id?: string | undefined;
}>;
export declare const keyResultSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    target_value: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    target_value: number;
    description?: string | undefined;
    unit?: string | undefined;
}, {
    title: string;
    target_value: number;
    description?: string | undefined;
    unit?: string | undefined;
}>;
export declare const createGoalSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["individual", "team", "department", "company"]>;
    owner_id: z.ZodString;
    parent_goal_id: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
    key_results: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        target_value: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        target_value: number;
        description?: string | undefined;
        unit?: string | undefined;
    }, {
        title: string;
        target_value: number;
        description?: string | undefined;
        unit?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "individual" | "team" | "department" | "company";
    title: string;
    owner_id: string;
    description?: string | undefined;
    parent_goal_id?: string | undefined;
    start_date?: string | undefined;
    due_date?: string | undefined;
    key_results?: {
        title: string;
        target_value: number;
        description?: string | undefined;
        unit?: string | undefined;
    }[] | undefined;
}, {
    type: "individual" | "team" | "department" | "company";
    title: string;
    owner_id: string;
    description?: string | undefined;
    parent_goal_id?: string | undefined;
    start_date?: string | undefined;
    due_date?: string | undefined;
    key_results?: {
        title: string;
        target_value: number;
        description?: string | undefined;
        unit?: string | undefined;
    }[] | undefined;
}>;
export declare const updateGoalSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["individual", "team", "department", "company"]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "active", "completed", "cancelled"]>>;
    owner_id: z.ZodOptional<z.ZodString>;
    parent_goal_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    start_date: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "individual" | "team" | "department" | "company" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    owner_id?: string | undefined;
    parent_goal_id?: string | null | undefined;
    start_date?: string | undefined;
    due_date?: string | undefined;
}, {
    type?: "individual" | "team" | "department" | "company" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    owner_id?: string | undefined;
    parent_goal_id?: string | null | undefined;
    start_date?: string | undefined;
    due_date?: string | undefined;
}>;
export declare const updateProgressSchema: z.ZodObject<{
    progress: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    progress: number;
    note?: string | undefined;
}, {
    progress: number;
    note?: string | undefined;
}>;
export declare const goalQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    type: z.ZodOptional<z.ZodEnum<["individual", "team", "department", "company"]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "active", "completed", "cancelled"]>>;
    owner_id: z.ZodOptional<z.ZodString>;
    department_id: z.ZodOptional<z.ZodString>;
    parent_goal_id: z.ZodOptional<z.ZodString>;
    due_before: z.ZodOptional<z.ZodString>;
    due_after: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    search?: string | undefined;
    sort_by?: string | undefined;
    type?: "individual" | "team" | "department" | "company" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    department_id?: string | undefined;
    owner_id?: string | undefined;
    parent_goal_id?: string | undefined;
    due_before?: string | undefined;
    due_after?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    type?: "individual" | "team" | "department" | "company" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    department_id?: string | undefined;
    owner_id?: string | undefined;
    parent_goal_id?: string | undefined;
    due_before?: string | undefined;
    due_after?: string | undefined;
}>;
export declare const updateKeyResultSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    target_value: z.ZodOptional<z.ZodNumber>;
    current_value: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["in_progress", "completed", "cancelled"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "in_progress" | "completed" | "cancelled" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    target_value?: number | undefined;
    unit?: string | undefined;
    current_value?: number | undefined;
}, {
    status?: "in_progress" | "completed" | "cancelled" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    target_value?: number | undefined;
    unit?: string | undefined;
    current_value?: number | undefined;
}>;
export declare const reviewCycleSettingsSchema: z.ZodObject<{
    include_self_assessment: z.ZodDefault<z.ZodBoolean>;
    include_manager_review: z.ZodDefault<z.ZodBoolean>;
    include_peer_review: z.ZodDefault<z.ZodBoolean>;
    rating_scale: z.ZodOptional<z.ZodObject<{
        min: z.ZodDefault<z.ZodNumber>;
        max: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    include_self_assessment: boolean;
    include_manager_review: boolean;
    include_peer_review: boolean;
    rating_scale?: {
        min: number;
        max: number;
    } | undefined;
}, {
    rating_scale?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    include_self_assessment?: boolean | undefined;
    include_manager_review?: boolean | undefined;
    include_peer_review?: boolean | undefined;
}>;
export declare const createReviewCycleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["annual", "semi-annual", "quarterly", "monthly"]>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    settings: z.ZodOptional<z.ZodObject<{
        include_self_assessment: z.ZodDefault<z.ZodBoolean>;
        include_manager_review: z.ZodDefault<z.ZodBoolean>;
        include_peer_review: z.ZodDefault<z.ZodBoolean>;
        rating_scale: z.ZodOptional<z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        include_self_assessment: boolean;
        include_manager_review: boolean;
        include_peer_review: boolean;
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        include_self_assessment?: boolean | undefined;
        include_manager_review?: boolean | undefined;
        include_peer_review?: boolean | undefined;
    }>>;
    departments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "annual" | "semi-annual" | "quarterly" | "monthly";
    name: string;
    start_date: string;
    end_date: string;
    description?: string | undefined;
    settings?: {
        include_self_assessment: boolean;
        include_manager_review: boolean;
        include_peer_review: boolean;
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
    departments?: string[] | undefined;
}, {
    type: "annual" | "semi-annual" | "quarterly" | "monthly";
    name: string;
    start_date: string;
    end_date: string;
    description?: string | undefined;
    settings?: {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        include_self_assessment?: boolean | undefined;
        include_manager_review?: boolean | undefined;
        include_peer_review?: boolean | undefined;
    } | undefined;
    departments?: string[] | undefined;
}>;
export declare const updateReviewCycleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["annual", "semi-annual", "quarterly", "monthly"]>>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        include_self_assessment: z.ZodDefault<z.ZodBoolean>;
        include_manager_review: z.ZodDefault<z.ZodBoolean>;
        include_peer_review: z.ZodDefault<z.ZodBoolean>;
        rating_scale: z.ZodOptional<z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        include_self_assessment: boolean;
        include_manager_review: boolean;
        include_peer_review: boolean;
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        include_self_assessment?: boolean | undefined;
        include_manager_review?: boolean | undefined;
        include_peer_review?: boolean | undefined;
    }>>;
    departments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type?: "annual" | "semi-annual" | "quarterly" | "monthly" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    settings?: {
        include_self_assessment: boolean;
        include_manager_review: boolean;
        include_peer_review: boolean;
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
    departments?: string[] | undefined;
}, {
    type?: "annual" | "semi-annual" | "quarterly" | "monthly" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    settings?: {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        include_self_assessment?: boolean | undefined;
        include_manager_review?: boolean | undefined;
        include_peer_review?: boolean | undefined;
    } | undefined;
    departments?: string[] | undefined;
}>;
export declare const reviewCycleQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "active", "completed", "cancelled"]>>;
    type: z.ZodOptional<z.ZodEnum<["annual", "semi-annual", "quarterly", "monthly"]>>;
    year: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    sort_by?: string | undefined;
    type?: "annual" | "semi-annual" | "quarterly" | "monthly" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    year?: number | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    type?: "annual" | "semi-annual" | "quarterly" | "monthly" | undefined;
    status?: "active" | "completed" | "cancelled" | "draft" | undefined;
    year?: number | undefined;
}>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    ratings_breakdown: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    strengths: z.ZodOptional<z.ZodString>;
    improvements: z.ZodOptional<z.ZodString>;
    comments: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["in_progress", "submitted"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "in_progress" | "submitted" | undefined;
    rating?: number | undefined;
    ratings_breakdown?: Record<string, number> | undefined;
    strengths?: string | undefined;
    improvements?: string | undefined;
    comments?: string | undefined;
}, {
    status?: "in_progress" | "submitted" | undefined;
    rating?: number | undefined;
    ratings_breakdown?: Record<string, number> | undefined;
    strengths?: string | undefined;
    improvements?: string | undefined;
    comments?: string | undefined;
}>;
export declare const acknowledgeReviewSchema: z.ZodObject<{
    employee_comments: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employee_comments?: string | undefined;
}, {
    employee_comments?: string | undefined;
}>;
export declare const reviewQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    cycle_id: z.ZodOptional<z.ZodString>;
    employee_id: z.ZodOptional<z.ZodString>;
    reviewer_id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["self", "manager", "peer"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "in_progress", "submitted", "acknowledged"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    sort_by?: string | undefined;
    type?: "manager" | "self" | "peer" | undefined;
    status?: "in_progress" | "pending" | "submitted" | "acknowledged" | undefined;
    cycle_id?: string | undefined;
    employee_id?: string | undefined;
    reviewer_id?: string | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    type?: "manager" | "self" | "peer" | undefined;
    status?: "in_progress" | "pending" | "submitted" | "acknowledged" | undefined;
    cycle_id?: string | undefined;
    employee_id?: string | undefined;
    reviewer_id?: string | undefined;
}>;
export declare const createAdhocReviewSchema: z.ZodObject<{
    employee_id: z.ZodString;
    due_date: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    review_form_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    settings: z.ZodOptional<z.ZodObject<{
        self_review_required: z.ZodDefault<z.ZodBoolean>;
        manager_review_required: z.ZodDefault<z.ZodBoolean>;
        include_goals: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        self_review_required: boolean;
        manager_review_required: boolean;
        include_goals: boolean;
    }, {
        self_review_required?: boolean | undefined;
        manager_review_required?: boolean | undefined;
        include_goals?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    employee_id: string;
    due_date?: string | undefined;
    settings?: {
        self_review_required: boolean;
        manager_review_required: boolean;
        include_goals: boolean;
    } | undefined;
    reason?: string | undefined;
    review_form_id?: string | null | undefined;
}, {
    employee_id: string;
    due_date?: string | undefined;
    settings?: {
        self_review_required?: boolean | undefined;
        manager_review_required?: boolean | undefined;
        include_goals?: boolean | undefined;
    } | undefined;
    reason?: string | undefined;
    review_form_id?: string | null | undefined;
}>;
export declare const adhocReviewQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["initiated", "pending_acknowledgment", "completed", "cancelled"]>>;
    employee_id: z.ZodOptional<z.ZodString>;
    manager_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
    due_before: z.ZodOptional<z.ZodString>;
    overdue: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    sort_by?: string | undefined;
    status?: "completed" | "cancelled" | "initiated" | "pending_acknowledgment" | undefined;
    manager_id?: string | undefined;
    due_before?: string | undefined;
    employee_id?: string | undefined;
    triggered_by?: string | undefined;
    overdue?: boolean | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    status?: "completed" | "cancelled" | "initiated" | "pending_acknowledgment" | undefined;
    manager_id?: string | undefined;
    due_before?: string | undefined;
    employee_id?: string | undefined;
    triggered_by?: string | undefined;
    overdue?: boolean | undefined;
}>;
export declare const questionConfigSchema: z.ZodObject<{
    scale_type: z.ZodOptional<z.ZodEnum<["numeric"]>>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    min_length: z.ZodOptional<z.ZodNumber>;
    max_length: z.ZodOptional<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    include_active_goals: z.ZodOptional<z.ZodBoolean>;
    include_completed_goals: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options?: string[] | undefined;
    min?: number | undefined;
    max?: number | undefined;
    scale_type?: "numeric" | undefined;
    labels?: Record<string, string> | undefined;
    min_length?: number | undefined;
    max_length?: number | undefined;
    include_active_goals?: boolean | undefined;
    include_completed_goals?: boolean | undefined;
}, {
    options?: string[] | undefined;
    min?: number | undefined;
    max?: number | undefined;
    scale_type?: "numeric" | undefined;
    labels?: Record<string, string> | undefined;
    min_length?: number | undefined;
    max_length?: number | undefined;
    include_active_goals?: boolean | undefined;
    include_completed_goals?: boolean | undefined;
}>;
export declare const questionSchema: z.ZodObject<{
    text: z.ZodString;
    help_text: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["rating_scale", "text_short", "text_long", "multiple_choice", "checkbox", "yes_no", "goal_rating", "number"]>;
    required: z.ZodDefault<z.ZodBoolean>;
    for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
    weight: z.ZodDefault<z.ZodNumber>;
    config: z.ZodOptional<z.ZodObject<{
        scale_type: z.ZodOptional<z.ZodEnum<["numeric"]>>;
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        min_length: z.ZodOptional<z.ZodNumber>;
        max_length: z.ZodOptional<z.ZodNumber>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        include_active_goals: z.ZodOptional<z.ZodBoolean>;
        include_completed_goals: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        scale_type?: "numeric" | undefined;
        labels?: Record<string, string> | undefined;
        min_length?: number | undefined;
        max_length?: number | undefined;
        include_active_goals?: boolean | undefined;
        include_completed_goals?: boolean | undefined;
    }, {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        scale_type?: "numeric" | undefined;
        labels?: Record<string, string> | undefined;
        min_length?: number | undefined;
        max_length?: number | undefined;
        include_active_goals?: boolean | undefined;
        include_completed_goals?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
    text: string;
    required: boolean;
    for_reviewer: "manager" | "self" | "both";
    weight: number;
    help_text?: string | undefined;
    config?: {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        scale_type?: "numeric" | undefined;
        labels?: Record<string, string> | undefined;
        min_length?: number | undefined;
        max_length?: number | undefined;
        include_active_goals?: boolean | undefined;
        include_completed_goals?: boolean | undefined;
    } | undefined;
}, {
    type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
    text: string;
    help_text?: string | undefined;
    required?: boolean | undefined;
    for_reviewer?: "manager" | "self" | "both" | undefined;
    weight?: number | undefined;
    config?: {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        scale_type?: "numeric" | undefined;
        labels?: Record<string, string> | undefined;
        min_length?: number | undefined;
        max_length?: number | undefined;
        include_active_goals?: boolean | undefined;
        include_completed_goals?: boolean | undefined;
    } | undefined;
}>;
export declare const sectionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
    collapsible: z.ZodDefault<z.ZodBoolean>;
    for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
    questions: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        help_text: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["rating_scale", "text_short", "text_long", "multiple_choice", "checkbox", "yes_no", "goal_rating", "number"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
        weight: z.ZodDefault<z.ZodNumber>;
        config: z.ZodOptional<z.ZodObject<{
            scale_type: z.ZodOptional<z.ZodEnum<["numeric"]>>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            min_length: z.ZodOptional<z.ZodNumber>;
            max_length: z.ZodOptional<z.ZodNumber>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            include_active_goals: z.ZodOptional<z.ZodBoolean>;
            include_completed_goals: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        }, {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
        text: string;
        required: boolean;
        for_reviewer: "manager" | "self" | "both";
        weight: number;
        help_text?: string | undefined;
        config?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        } | undefined;
    }, {
        type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
        text: string;
        help_text?: string | undefined;
        required?: boolean | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        weight?: number | undefined;
        config?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    for_reviewer: "manager" | "self" | "both";
    collapsible: boolean;
    questions: {
        type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
        text: string;
        required: boolean;
        for_reviewer: "manager" | "self" | "both";
        weight: number;
        help_text?: string | undefined;
        config?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    order?: number | undefined;
}, {
    title: string;
    questions: {
        type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
        text: string;
        help_text?: string | undefined;
        required?: boolean | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        weight?: number | undefined;
        config?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            scale_type?: "numeric" | undefined;
            labels?: Record<string, string> | undefined;
            min_length?: number | undefined;
            max_length?: number | undefined;
            include_active_goals?: boolean | undefined;
            include_completed_goals?: boolean | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    for_reviewer?: "manager" | "self" | "both" | undefined;
    order?: number | undefined;
    collapsible?: boolean | undefined;
}>;
export declare const createReviewFormSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    instructions: z.ZodOptional<z.ZodString>;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        collapsible: z.ZodDefault<z.ZodBoolean>;
        for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
        questions: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            help_text: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<["rating_scale", "text_short", "text_long", "multiple_choice", "checkbox", "yes_no", "goal_rating", "number"]>;
            required: z.ZodDefault<z.ZodBoolean>;
            for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
            weight: z.ZodDefault<z.ZodNumber>;
            config: z.ZodOptional<z.ZodObject<{
                scale_type: z.ZodOptional<z.ZodEnum<["numeric"]>>;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                min_length: z.ZodOptional<z.ZodNumber>;
                max_length: z.ZodOptional<z.ZodNumber>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                include_active_goals: z.ZodOptional<z.ZodBoolean>;
                include_completed_goals: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            }, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }, {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        for_reviewer: "manager" | "self" | "both";
        collapsible: boolean;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        order?: number | undefined;
    }, {
        title: string;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        order?: number | undefined;
        collapsible?: boolean | undefined;
    }>, "many">;
    settings: z.ZodOptional<z.ZodObject<{
        rating_scale: z.ZodOptional<z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sections: {
        title: string;
        for_reviewer: "manager" | "self" | "both";
        collapsible: boolean;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        order?: number | undefined;
    }[];
    description?: string | undefined;
    settings?: {
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
    instructions?: string | undefined;
}, {
    name: string;
    sections: {
        title: string;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        order?: number | undefined;
        collapsible?: boolean | undefined;
    }[];
    description?: string | undefined;
    settings?: {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    instructions?: string | undefined;
}>;
export declare const updateReviewFormSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        collapsible: z.ZodDefault<z.ZodBoolean>;
        for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
        questions: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            help_text: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<["rating_scale", "text_short", "text_long", "multiple_choice", "checkbox", "yes_no", "goal_rating", "number"]>;
            required: z.ZodDefault<z.ZodBoolean>;
            for_reviewer: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
            weight: z.ZodDefault<z.ZodNumber>;
            config: z.ZodOptional<z.ZodObject<{
                scale_type: z.ZodOptional<z.ZodEnum<["numeric"]>>;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                min_length: z.ZodOptional<z.ZodNumber>;
                max_length: z.ZodOptional<z.ZodNumber>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                include_active_goals: z.ZodOptional<z.ZodBoolean>;
                include_completed_goals: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            }, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }, {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        for_reviewer: "manager" | "self" | "both";
        collapsible: boolean;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        order?: number | undefined;
    }, {
        title: string;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        order?: number | undefined;
        collapsible?: boolean | undefined;
    }>, "many">>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        rating_scale: z.ZodOptional<z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    settings?: {
        rating_scale?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
    instructions?: string | undefined;
    sections?: {
        title: string;
        for_reviewer: "manager" | "self" | "both";
        collapsible: boolean;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            required: boolean;
            for_reviewer: "manager" | "self" | "both";
            weight: number;
            help_text?: string | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        order?: number | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    settings?: {
        rating_scale?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    instructions?: string | undefined;
    sections?: {
        title: string;
        questions: {
            type: "number" | "rating_scale" | "text_short" | "text_long" | "multiple_choice" | "checkbox" | "yes_no" | "goal_rating";
            text: string;
            help_text?: string | undefined;
            required?: boolean | undefined;
            for_reviewer?: "manager" | "self" | "both" | undefined;
            weight?: number | undefined;
            config?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                scale_type?: "numeric" | undefined;
                labels?: Record<string, string> | undefined;
                min_length?: number | undefined;
                max_length?: number | undefined;
                include_active_goals?: boolean | undefined;
                include_completed_goals?: boolean | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        for_reviewer?: "manager" | "self" | "both" | undefined;
        order?: number | undefined;
        collapsible?: boolean | undefined;
    }[] | undefined;
}>;
export declare const assignDepartmentsSchema: z.ZodObject<{
    departments: z.ZodArray<z.ZodObject<{
        department_id: z.ZodString;
        form_type: z.ZodDefault<z.ZodEnum<["self", "manager", "both"]>>;
        effective_date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        department_id: string;
        form_type: "manager" | "self" | "both";
        effective_date?: string | undefined;
    }, {
        department_id: string;
        form_type?: "manager" | "self" | "both" | undefined;
        effective_date?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    departments: {
        department_id: string;
        form_type: "manager" | "self" | "both";
        effective_date?: string | undefined;
    }[];
}, {
    departments: {
        department_id: string;
        form_type?: "manager" | "self" | "both" | undefined;
        effective_date?: string | undefined;
    }[];
}>;
export declare const cloneFormSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const reviewFormQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
    is_default: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    per_page: number;
    sort_order: "asc" | "desc";
    search?: string | undefined;
    sort_by?: string | undefined;
    status?: "draft" | "published" | "archived" | undefined;
    is_default?: boolean | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    status?: "draft" | "published" | "archived" | undefined;
    is_default?: boolean | undefined;
}>;
export declare const analyticsQuerySchema: z.ZodObject<{
    period: z.ZodOptional<z.ZodEnum<["month", "quarter", "year"]>>;
    year: z.ZodOptional<z.ZodNumber>;
    quarter: z.ZodOptional<z.ZodNumber>;
    month: z.ZodOptional<z.ZodNumber>;
    department_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    department_id?: string | undefined;
    year?: number | undefined;
    month?: number | undefined;
    quarter?: number | undefined;
    period?: "year" | "month" | "quarter" | undefined;
}, {
    department_id?: string | undefined;
    year?: number | undefined;
    month?: number | undefined;
    quarter?: number | undefined;
    period?: "year" | "month" | "quarter" | undefined;
}>;
export declare const exportQuerySchema: z.ZodObject<{
    type: z.ZodEnum<["goals", "reviews", "employees"]>;
    format: z.ZodDefault<z.ZodEnum<["csv", "xlsx", "pdf"]>>;
    period: z.ZodOptional<z.ZodEnum<["month", "quarter", "year"]>>;
    year: z.ZodOptional<z.ZodNumber>;
    quarter: z.ZodOptional<z.ZodNumber>;
    department_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "goals" | "reviews" | "employees";
    format: "csv" | "xlsx" | "pdf";
    department_id?: string | undefined;
    year?: number | undefined;
    quarter?: number | undefined;
    period?: "year" | "month" | "quarter" | undefined;
}, {
    type: "goals" | "reviews" | "employees";
    department_id?: string | undefined;
    year?: number | undefined;
    quarter?: number | undefined;
    period?: "year" | "month" | "quarter" | undefined;
    format?: "csv" | "xlsx" | "pdf" | undefined;
}>;
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
//# sourceMappingURL=index.d.ts.map