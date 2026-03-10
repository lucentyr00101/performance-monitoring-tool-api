import { Context } from 'hono';
import { analyticsService } from '@analytics/services/index.js';
import {
  successResponse,
  errorResponse,
  analyticsQuerySchema,
  kpiQuerySchema,
  exportQuerySchema,
  type JwtPayload,
} from '@pmt/shared';

const LOG_PREFIX = '[AnalyticsController]';

export class AnalyticsController {
  /**
   * GET /analytics/dashboard
   */
  async getDashboard(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /analytics/dashboard`, { userId: user.sub });

    const query = c.req.query();
    const parsed = analyticsQuerySchema.safeParse({
      period: query.period,
      year: query.year,
      quarter: query.quarter,
      month: query.month,
      department_id: query.department_id,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Dashboard validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const authHeader = c.req.header('Authorization');
    const dashboard = await analyticsService.getDashboard(user, authHeader);

    console.info(`${LOG_PREFIX} Dashboard response sent`, { userId: user.sub });
    return c.json(successResponse(dashboard), 200);
  }

  /**
   * GET /analytics/goals
   */
  async getGoalAnalytics(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /analytics/goals`, { userId: user.sub });

    const query = c.req.query();
    const parsed = analyticsQuerySchema.safeParse({
      period: query.period,
      year: query.year,
      quarter: query.quarter,
      month: query.month,
      department_id: query.department_id,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Goal analytics validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      departmentId: parsed.data.department_id,
      employeeId: query.employee_id,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
    };

    const authHeader = c.req.header('Authorization');
    const analytics = await analyticsService.getGoalAnalytics(filters, authHeader);

    console.info(`${LOG_PREFIX} Goal analytics response sent`, { userId: user.sub, filters });
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/reviews
   */
  async getReviewAnalytics(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /analytics/reviews`, { userId: user.sub });

    const query = c.req.query();
    const parsed = analyticsQuerySchema.safeParse({
      period: query.period,
      year: query.year,
      quarter: query.quarter,
      month: query.month,
      department_id: query.department_id,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Review analytics validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      cycleId: query.cycle_id,
      departmentId: parsed.data.department_id,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
    };

    const authHeader = c.req.header('Authorization');
    const analytics = await analyticsService.getReviewAnalytics(filters, authHeader);

    console.info(`${LOG_PREFIX} Review analytics response sent`, { userId: user.sub, filters });
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/team/:id
   */
  async getTeamAnalytics(c: Context) {
    const user = c.get('user') as JwtPayload;
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /analytics/team/:id`, { userId: user.sub, teamId: id });

    const authHeader = c.req.header('Authorization');
    const analytics = await analyticsService.getTeamAnalytics(id, authHeader);

    console.info(`${LOG_PREFIX} Team analytics response sent`, { userId: user.sub, teamId: id });
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/department/:id
   */
  async getDepartmentAnalytics(c: Context) {
    const user = c.get('user') as JwtPayload;
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /analytics/department/:id`, { userId: user.sub, departmentId: id });

    const authHeader = c.req.header('Authorization');
    const analytics = await analyticsService.getDepartmentAnalytics(id, authHeader);

    console.info(`${LOG_PREFIX} Department analytics response sent`, { userId: user.sub, departmentId: id });
    return c.json(successResponse(analytics), 200);
  }

  /**
   * POST /analytics/export
   */
  async exportAnalytics(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} POST /analytics/export`, { userId: user.sub });

    const body = await c.req.json();
    const parsed = exportQuerySchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Export validation failed`, { userId: user.sub, errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        ),
        422,
      );
    }

    const authHeader = c.req.header('Authorization');
    const result = await analyticsService.exportAnalytics({
      type: parsed.data.type,
      format: parsed.data.format,
      period: parsed.data.period,
      year: parsed.data.year,
      quarter: parsed.data.quarter,
      departmentId: parsed.data.department_id,
    }, authHeader);

    console.info(`${LOG_PREFIX} Export response sent`, { userId: user.sub, type: parsed.data.type });
    return c.json(successResponse(result), 200);
  }

  /**
   * GET /analytics/kpis
   */
  async getKpis(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /analytics/kpis`, { userId: user.sub });

    const query = c.req.query();
    const parsed = kpiQuerySchema.safeParse({
      period: query.period,
      department: query.department,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} KPI validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const authHeader = c.req.header('Authorization');
    const kpis = await analyticsService.getKpis(
      { period: parsed.data.period, department: parsed.data.department },
      authHeader,
    );

    console.info(`${LOG_PREFIX} KPI response sent`, { userId: user.sub });
    return c.json(successResponse(kpis), 200);
  }
}

export const analyticsController = new AnalyticsController();
