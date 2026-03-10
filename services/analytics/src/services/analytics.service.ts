import { type JwtPayload } from '@pmt/shared';
import type { IKpiData } from '@pmt/shared';

const LOG_PREFIX = '[AnalyticsService]';

const GOALS_SERVICE_URL = process.env.GOALS_SERVICE_URL || 'http://localhost:4003';
const REVIEWS_SERVICE_URL = process.env.REVIEWS_SERVICE_URL || 'http://localhost:4004';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002';

export interface DashboardData {
  overview: {
    totalEmployees: number;
    activeGoals: number;
    completedGoals: number;
    pendingReviews: number;
    averagePerformanceRating: number;
  };
  goalProgress: {
    onTrack: number;
    atRisk: number;
    behind: number;
  };
  reviewStatus: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export interface GoalAnalytics {
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  averageProgress: number;
  completionRate: number;
  overdueCount: number;
  trends: Array<{
    period: string;
    created: number;
    completed: number;
  }>;
}

export interface ReviewAnalytics {
  summary: {
    totalCycles: number;
    activeCycles: number;
    totalReviews: number;
    completedReviews: number;
  };
  ratingDistribution: Record<number, number>;
  averageRating: number;
  completionRate: number;
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    averageRating: number;
    completionRate: number;
  }>;
}

export interface TeamAnalytics {
  teamSize: number;
  directReports: number;
  averagePerformanceRating: number;
  goalCompletionRate: number;
  members: Array<{
    employeeId: string;
    name: string;
    performanceRating: number | null;
    activeGoals: number;
    completedGoals: number;
  }>;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  averagePerformanceRating: number;
  goalMetrics: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  reviewMetrics: {
    total: number;
    completed: number;
    averageRating: number;
  };
  topPerformers: Array<{
    employeeId: string;
    name: string;
    performanceRating: number;
  }>;
}

export interface ExportResult {
  data: string;
  format: string;
  filename: string;
  generatedAt: Date;
}

export class AnalyticsService {
  /**
   * Get dashboard data based on user role
   */
  async getDashboard(user: JwtPayload, authHeader?: string): Promise<DashboardData> {
    console.info(`${LOG_PREFIX} Getting dashboard`, { userId: user.sub, role: user.role });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const [
      employeesData,
      activeGoalsData,
      completedGoalsData,
      pendingReviewsData,
      inProgressReviewsData,
      submittedReviewsData,
    ] = await Promise.all([
      this.fetchServiceData(`${EMPLOYEE_SERVICE_URL}/api/v1/employees?per_page=1`, headers),
      this.fetchServiceData(`${GOALS_SERVICE_URL}/api/v1/goals?status=active&per_page=1`, headers),
      this.fetchServiceData(`${GOALS_SERVICE_URL}/api/v1/goals?status=completed&per_page=1`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?status=pending&per_page=1`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?status=in_progress&per_page=1`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?status=submitted&per_page=1`, headers),
    ]);

    const totalEmployees = employeesData?.meta?.pagination?.total_items ?? 0;
    const activeGoals = activeGoalsData?.meta?.pagination?.total_items ?? 0;
    const completedGoals = completedGoalsData?.meta?.pagination?.total_items ?? 0;
    const pendingReviews = pendingReviewsData?.meta?.pagination?.total_items ?? 0;
    const inProgressReviews = inProgressReviewsData?.meta?.pagination?.total_items ?? 0;
    const completedReviews = submittedReviewsData?.meta?.pagination?.total_items ?? 0;

    const result: DashboardData = {
      overview: {
        totalEmployees,
        activeGoals,
        completedGoals,
        pendingReviews,
        averagePerformanceRating: 0,
      },
      goalProgress: {
        onTrack: 0,
        atRisk: 0,
        behind: 0,
      },
      reviewStatus: {
        pending: pendingReviews,
        inProgress: inProgressReviews,
        completed: completedReviews,
      },
      recentActivity: [],
    };

    console.info(`${LOG_PREFIX} Dashboard retrieved`, { userId: user.sub });
    return result;
  }

  /**
   * Get goal analytics
   */
  async getGoalAnalytics(
    filters: {
      departmentId?: string;
      employeeId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    authHeader?: string,
  ): Promise<GoalAnalytics> {
    console.info(`${LOG_PREFIX} Getting goal analytics`, { filters });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const urlParams = new URLSearchParams({ per_page: '100' });
    if (filters.departmentId) urlParams.set('department_id', filters.departmentId);
    if (filters.employeeId) urlParams.set('owner_id', filters.employeeId);
    if (filters.startDate) urlParams.set('due_after', filters.startDate.toISOString().split('T')[0]!);
    if (filters.endDate) urlParams.set('due_before', filters.endDate.toISOString().split('T')[0]!);

    const goalsData = await this.fetchServiceData(
      `${GOALS_SERVICE_URL}/api/v1/goals?${urlParams.toString()}`,
      headers,
    );

    const goals = (goalsData?.data ?? []) as Array<{
      status?: string;
      progress?: number;
      dueDate?: string;
    }>;

    const totalGoals = goalsData?.meta?.pagination?.total_items ?? goals.length;
    const now = new Date();
    const byStatus: Record<string, number> = {};
    let totalProgress = 0;
    let overdueCount = 0;

    for (const goal of goals) {
      const status = goal.status ?? 'unknown';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      totalProgress += goal.progress ?? 0;
      if (
        goal.dueDate &&
        new Date(goal.dueDate) < now &&
        status !== 'completed' &&
        status !== 'cancelled'
      ) {
        overdueCount++;
      }
    }

    const completedGoals = byStatus['completed'] ?? 0;
    const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0;
    const completionRate = totalGoals > 0 ? completedGoals / totalGoals : 0;

    const result: GoalAnalytics = {
      summary: {
        total: totalGoals,
        byStatus,
        byCategory: {},
        byPriority: {},
      },
      averageProgress: Math.round(averageProgress * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      overdueCount,
      trends: [],
    };

    console.info(`${LOG_PREFIX} Goal analytics retrieved`, { totalGoals: result.summary.total });
    return result;
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(
    filters: {
      cycleId?: string;
      departmentId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    authHeader?: string,
  ): Promise<ReviewAnalytics> {
    console.info(`${LOG_PREFIX} Getting review analytics`, { filters });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const reviewParams = new URLSearchParams({ per_page: '100' });
    if (filters.cycleId) reviewParams.set('cycle_id', filters.cycleId);

    const [reviewsData, totalCyclesData, activeCyclesData] = await Promise.all([
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?${reviewParams.toString()}`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/review-cycles?per_page=1`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/review-cycles?status=active&per_page=1`, headers),
    ]);

    const reviews = (reviewsData?.data ?? []) as Array<{
      status?: string;
      overallRating?: number;
    }>;

    const totalReviews = reviewsData?.meta?.pagination?.total_items ?? reviews.length;
    const totalCycles = totalCyclesData?.meta?.pagination?.total_items ?? 0;
    const activeCycles = activeCyclesData?.meta?.pagination?.total_items ?? 0;

    const completedReviews = reviews.filter(
      r => r.status === 'submitted' || r.status === 'acknowledged' || r.status === 'finalized',
    ).length;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingTotal = 0;
    let ratingCount = 0;

    for (const review of reviews) {
      if (typeof review.overallRating === 'number') {
        const rating = Math.round(review.overallRating);
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = (ratingDistribution[rating] ?? 0) + 1;
          ratingTotal += review.overallRating;
          ratingCount++;
        }
      }
    }

    const averageRating = ratingCount > 0 ? ratingTotal / ratingCount : 0;
    const completionRate = totalReviews > 0 ? completedReviews / totalReviews : 0;

    const result: ReviewAnalytics = {
      summary: {
        totalCycles,
        activeCycles,
        totalReviews,
        completedReviews,
      },
      ratingDistribution,
      averageRating: Math.round(averageRating * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      byDepartment: [],
    };

    console.info(`${LOG_PREFIX} Review analytics retrieved`, { totalReviews: result.summary.totalReviews });
    return result;
  }

  /**
   * Get team analytics for a manager
   */
  async getTeamAnalytics(managerId: string, authHeader?: string): Promise<TeamAnalytics> {
    console.info(`${LOG_PREFIX} Getting team analytics`, { managerId });

    const result: TeamAnalytics = {
      teamSize: 0,
      directReports: 0,
      averagePerformanceRating: 0,
      goalCompletionRate: 0,
      members: [],
    };

    console.info(`${LOG_PREFIX} Team analytics retrieved`, { managerId, teamSize: result.teamSize });
    return result;
  }

  /**
   * Get department analytics
   */
  async getDepartmentAnalytics(departmentId: string, authHeader?: string): Promise<DepartmentAnalytics> {
    console.info(`${LOG_PREFIX} Getting department analytics`, { departmentId });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const [employeesData, goalsData, reviewsData] = await Promise.all([
      this.fetchServiceData(
        `${EMPLOYEE_SERVICE_URL}/api/v1/employees?department_id=${departmentId}&status=active&per_page=100`,
        headers,
      ),
      this.fetchServiceData(
        `${GOALS_SERVICE_URL}/api/v1/goals?department_id=${departmentId}&per_page=100`,
        headers,
      ),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?per_page=100`, headers),
    ]);

    const employees = (employeesData?.data ?? []) as Array<{
      _id?: string;
      id?: string;
      firstName?: string;
      lastName?: string;
    }>;

    const goals = (goalsData?.data ?? []) as Array<{
      status?: string;
      progress?: number;
    }>;

    const reviews = (reviewsData?.data ?? []) as Array<{
      status?: string;
      overallRating?: number;
      employeeId?: string;
    }>;

    const employeeCount = employeesData?.meta?.pagination?.total_items ?? employees.length;

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'active').length;
    const totalProgress = goals.reduce((sum, g) => sum + (g.progress ?? 0), 0);
    const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0;

    const completedReviews = reviews.filter(
      r => r.status === 'submitted' || r.status === 'acknowledged' || r.status === 'finalized',
    ).length;
    const reviewRatings = reviews
      .filter(r => typeof r.overallRating === 'number')
      .map(r => r.overallRating as number);
    const averageRating =
      reviewRatings.length > 0
        ? reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length
        : 0;

    // Compute top performers
    const employeeIdToName = new Map(
      employees.map(e => [e._id ?? e.id ?? '', `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim()]),
    );

    const employeeRatings = new Map<string, { total: number; count: number }>();
    for (const review of reviews) {
      if (review.employeeId && typeof review.overallRating === 'number') {
        const existing = employeeRatings.get(review.employeeId) ?? { total: 0, count: 0 };
        existing.total += review.overallRating;
        existing.count++;
        employeeRatings.set(review.employeeId, existing);
      }
    }

    const topPerformers = Array.from(employeeRatings.entries())
      .filter(([empId]) => employeeIdToName.has(empId))
      .map(([empId, { total, count }]) => ({
        employeeId: empId,
        name: employeeIdToName.get(empId) ?? 'Unknown',
        performanceRating: Math.round((total / count) * 100) / 100,
      }))
      .sort((a, b) => b.performanceRating - a.performanceRating)
      .slice(0, 5);

    const result: DepartmentAnalytics = {
      departmentId,
      departmentName: '',
      employeeCount,
      averagePerformanceRating: Math.round(averageRating * 100) / 100,
      goalMetrics: {
        total: goals.length,
        completed: completedGoals,
        inProgress: inProgressGoals,
        averageProgress: Math.round(averageProgress * 100) / 100,
      },
      reviewMetrics: {
        total: reviews.length,
        completed: completedReviews,
        averageRating: Math.round(averageRating * 100) / 100,
      },
      topPerformers,
    };

    console.info(`${LOG_PREFIX} Department analytics retrieved`, { departmentId, employeeCount });
    return result;
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics(
    params: {
      type: 'goals' | 'reviews' | 'employees';
      format: 'csv' | 'xlsx' | 'pdf';
      period?: string;
      year?: number;
      quarter?: number;
      departmentId?: string;
    },
    authHeader?: string,
  ): Promise<ExportResult> {
    console.info(`${LOG_PREFIX} Exporting analytics`, { type: params.type, format: params.format });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    let rawData: Record<string, unknown>[] = [];
    const filename = `${params.type}_export_${Date.now()}.csv`;

    if (params.type === 'goals') {
      const urlParams = new URLSearchParams({ per_page: '1000' });
      if (params.departmentId) urlParams.set('department_id', params.departmentId);
      const result = await this.fetchServiceData(
        `${GOALS_SERVICE_URL}/api/v1/goals?${urlParams}`,
        headers,
      );
      rawData = (result?.data ?? []) as Record<string, unknown>[];
    } else if (params.type === 'reviews') {
      const urlParams = new URLSearchParams({ per_page: '1000' });
      const result = await this.fetchServiceData(
        `${REVIEWS_SERVICE_URL}/api/v1/reviews?${urlParams}`,
        headers,
      );
      rawData = (result?.data ?? []) as Record<string, unknown>[];
    } else if (params.type === 'employees') {
      const urlParams = new URLSearchParams({ per_page: '1000' });
      if (params.departmentId) urlParams.set('department_id', params.departmentId);
      const result = await this.fetchServiceData(
        `${EMPLOYEE_SERVICE_URL}/api/v1/employees?${urlParams}`,
        headers,
      );
      rawData = (result?.data ?? []) as Record<string, unknown>[];
    }

    // Build CSV string
    let csvData = '';
    const firstRow = rawData[0];
    if (rawData.length > 0 && firstRow) {
      const keys = Object.keys(firstRow).filter(k => typeof firstRow[k] !== 'object' || firstRow[k] === null);
      csvData = [
        keys.join(','),
        ...rawData.map(row =>
          keys
            .map(k => {
              const val = (row as Record<string, unknown>)[k];
              if (val === null || val === undefined) return '';
              const str = String(val);
              return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(','),
        ),
      ].join('\n');
    }

    const result: ExportResult = {
      data: csvData,
      format: params.format,
      filename,
      generatedAt: new Date(),
    };

    console.info(`${LOG_PREFIX} Export created`, { type: params.type, rowCount: rawData.length });
    return result;
  }

  /**
   * Get KPI data with optional period and department filters.
   */
  async getKpis(
    filters: {
      period?: string;
      department?: string;
    },
    authHeader?: string,
  ): Promise<IKpiData> {
    console.info(`${LOG_PREFIX} Getting KPIs`, { filters });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const [goalsData, reviewsData, employeesData, reviewCyclesData] = await Promise.all([
      this.fetchServiceData(`${GOALS_SERVICE_URL}/api/v1/goals?per_page=100`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?per_page=100`, headers),
      this.fetchServiceData(`${EMPLOYEE_SERVICE_URL}/api/v1/employees?per_page=1`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/review-cycles?status=active&per_page=1`, headers),
    ]);

    const goals = (goalsData?.data as Array<{ status?: string }>) ?? [];
    const reviews = (reviewsData?.data as Array<{ status?: string; rating?: number }>) ?? [];

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalsCompletionRate = totalGoals > 0 ? completedGoals / totalGoals : 0;

    const totalReviews = reviews.length;
    const submittedReviews = reviews.filter(
      (r) => r.status === 'submitted' || r.status === 'acknowledged',
    ).length;
    const reviewCompletionRate = totalReviews > 0 ? submittedReviews / totalReviews : 0;

    const ratingsWithValues = reviews.filter((r) => typeof r.rating === 'number');
    const averagePerformanceScore =
      ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingsWithValues.length
        : 0;

    const employeeCount = employeesData?.meta?.pagination?.total_items ?? 0;
    const activeReviewCycles = reviewCyclesData?.meta?.pagination?.total_items ?? 0;

    const result: IKpiData = {
      averagePerformanceScore: Math.round(averagePerformanceScore * 100) / 100,
      goalsCompletionRate: Math.round(goalsCompletionRate * 100) / 100,
      reviewCompletionRate: Math.round(reviewCompletionRate * 100) / 100,
      employeeCount,
      activeReviewCycles,
      trends: {
        performanceScore: [averagePerformanceScore],
        goalsCompletion: [goalsCompletionRate],
      },
    };

    console.info(`${LOG_PREFIX} KPIs retrieved`, { ...result, trends: '[omitted]' });
    return result;
  }

  /**
   * Fetch data from another service. Returns null on failure.
   */
  private async fetchServiceData(
    url: string,
    headers: Record<string, string>,
  ): Promise<{ data?: unknown[]; meta?: { pagination?: { total_items?: number } } } | null> {
    const startTime = Date.now();
    try {
      const response = await fetch(url, { headers });
      const duration = Date.now() - startTime;

      if (!response.ok) {
        console.warn(`${LOG_PREFIX} Service call failed`, { url, status: response.status, duration });
        return null;
      }

      const body = await response.json();
      console.info(`${LOG_PREFIX} Service call success`, { url, duration });
      return body as { data?: unknown[]; meta?: { pagination?: { total_items?: number } } };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`${LOG_PREFIX} Service call error`, {
        url,
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
