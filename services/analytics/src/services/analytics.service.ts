import { type JwtPayload } from '@pmt/shared';
import type { IKpiData } from '@pmt/shared';

const LOG_PREFIX = '[AnalyticsService]';

const GOALS_SERVICE_URL = process.env.GOALS_SERVICE_URL || 'http://localhost:4003';
const REVIEWS_SERVICE_URL = process.env.REVIEWS_SERVICE_URL || 'http://localhost:4004';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002';

// The analytics service aggregates data from other services
// In a real microservices setup, it would make HTTP calls to other services
// For simplicity, we'll simulate the aggregation logic

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

export class AnalyticsService {
  /**
   * Get dashboard data based on user role
   */
  async getDashboard(user: JwtPayload): Promise<DashboardData> {
    console.info(`${LOG_PREFIX} Getting dashboard`, { userId: user.sub, role: user.role });
    
    // In a real implementation, this would fetch data from other services
    // For now, we return mock data structure
    const result = {
      overview: {
        totalEmployees: 0,
        activeGoals: 0,
        completedGoals: 0,
        pendingReviews: 0,
        averagePerformanceRating: 0,
      },
      goalProgress: {
        onTrack: 0,
        atRisk: 0,
        behind: 0,
      },
      reviewStatus: {
        pending: 0,
        inProgress: 0,
        completed: 0,
      },
      recentActivity: [],
    };
    
    console.info(`${LOG_PREFIX} Dashboard retrieved`, { userId: user.sub });
    return result;
  }

  /**
   * Get goal analytics
   */
  async getGoalAnalytics(filters: {
    departmentId?: string;
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<GoalAnalytics> {
    console.info(`${LOG_PREFIX} Getting goal analytics`, { filters });
    
    const result = {
      summary: {
        total: 0,
        byStatus: {},
        byCategory: {},
        byPriority: {},
      },
      averageProgress: 0,
      completionRate: 0,
      overdueCount: 0,
      trends: [],
    };
    
    console.info(`${LOG_PREFIX} Goal analytics retrieved`, { totalGoals: result.summary.total });
    return result;
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(filters: {
    cycleId?: string;
    departmentId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ReviewAnalytics> {
    console.info(`${LOG_PREFIX} Getting review analytics`, { filters });
    
    const result = {
      summary: {
        totalCycles: 0,
        activeCycles: 0,
        totalReviews: 0,
        completedReviews: 0,
      },
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      averageRating: 0,
      completionRate: 0,
      byDepartment: [],
    };
    
    console.info(`${LOG_PREFIX} Review analytics retrieved`, { totalReviews: result.summary.totalReviews });
    return result;
  }

  /**
   * Get team analytics for a manager
   */
  async getTeamAnalytics(managerId: string): Promise<TeamAnalytics> {
    console.info(`${LOG_PREFIX} Getting team analytics`, { managerId });
    
    const result = {
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
  async getDepartmentAnalytics(departmentId: string): Promise<DepartmentAnalytics> {
    console.info(`${LOG_PREFIX} Getting department analytics`, { departmentId });
    
    const result = {
      departmentId,
      departmentName: '',
      employeeCount: 0,
      averagePerformanceRating: 0,
      goalMetrics: {
        total: 0,
        completed: 0,
        inProgress: 0,
        averageProgress: 0,
      },
      reviewMetrics: {
        total: 0,
        completed: 0,
        averageRating: 0,
      },
      topPerformers: [],
    };
    
    console.info(`${LOG_PREFIX} Department analytics retrieved`, { departmentId, employeeCount: result.employeeCount });
    return result;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(params: {
    type: 'goals' | 'reviews' | 'employees' | 'all';
    format: 'csv' | 'json' | 'xlsx';
    filters?: Record<string, unknown>;
  }): Promise<{ url: string; expiresAt: Date }> {
    console.info(`${LOG_PREFIX} Exporting analytics`, { type: params.type, format: params.format, filters: params.filters });
    
    // In a real implementation, this would generate and store the export file
    // Then return a signed URL for download
    const result = {
      url: `/api/v1/analytics/exports/${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    
    console.info(`${LOG_PREFIX} Export created`, { type: params.type, format: params.format, url: result.url });
    return result;
  }

  /**
   * Get KPI data with optional period and department filters.
   * Aggregates data from goals, reviews, and employees services.
   */
  async getKpis(filters: {
    period?: string;
    department?: string;
  }, authHeader?: string): Promise<IKpiData> {
    console.info(`${LOG_PREFIX} Getting KPIs`, { filters });

    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const [goalsData, reviewsData, employeesData] = await Promise.all([
      this.fetchServiceData(`${GOALS_SERVICE_URL}/api/v1/goals?per_page=100`, headers),
      this.fetchServiceData(`${REVIEWS_SERVICE_URL}/api/v1/reviews?per_page=100`, headers),
      this.fetchServiceData(`${EMPLOYEE_SERVICE_URL}/api/v1/employees?per_page=1`, headers),
    ]);

    const goals = (goalsData?.data as Array<{ status?: string }>) ?? [];
    const reviews = (reviewsData?.data as Array<{ status?: string; rating?: number }>) ?? [];

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalsCompletionRate = totalGoals > 0 ? completedGoals / totalGoals : 0;

    const totalReviews = reviews.length;
    const submittedReviews = reviews.filter((r) => r.status === 'submitted' || r.status === 'acknowledged').length;
    const reviewCompletionRate = totalReviews > 0 ? submittedReviews / totalReviews : 0;

    const ratingsWithValues = reviews.filter((r) => typeof r.rating === 'number');
    const averagePerformanceScore =
      ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingsWithValues.length
        : 0;

    const employeeCount = employeesData?.meta?.pagination?.total_items ?? 0;
    const activeReviewCycles = 0; // Would require a separate call to review-cycles

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
