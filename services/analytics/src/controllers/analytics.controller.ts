import { Context } from 'hono';
import { analyticsService } from '@analytics/services/index.js';
import { successResponse, errorResponse, kpiQuerySchema, type JwtPayload } from '@pmt/shared';

const LOG_PREFIX = '[AnalyticsController]';

export class AnalyticsController {
  /**
   * GET /analytics/dashboard
   */
  async getDashboard(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /analytics/dashboard`, { userId: user.sub });
    
    const dashboard = await analyticsService.getDashboard(user);
    
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
    
    const filters = {
      departmentId: query.department_id,
      employeeId: query.employee_id,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
    };

    const analytics = await analyticsService.getGoalAnalytics(filters);
    
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

    const filters = {
      cycleId: query.cycle_id,
      departmentId: query.department_id,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
    };

    const analytics = await analyticsService.getReviewAnalytics(filters);
    
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
    
    const analytics = await analyticsService.getTeamAnalytics(id);
    
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
    
    const analytics = await analyticsService.getDepartmentAnalytics(id);
    
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

    if (!body.type || !['goals', 'reviews', 'employees', 'all'].includes(body.type)) {
      console.warn(`${LOG_PREFIX} Validation failed: Invalid export type`, { userId: user.sub, type: body.type });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid export type'), 422);
    }

    if (!body.format || !['csv', 'json', 'xlsx'].includes(body.format)) {
      console.warn(`${LOG_PREFIX} Validation failed: Invalid export format`, { userId: user.sub, format: body.format });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid export format'), 422);
    }

    const result = await analyticsService.exportAnalytics({
      type: body.type,
      format: body.format,
      filters: body.filters,
    });

    console.info(`${LOG_PREFIX} Export response sent`, { userId: user.sub, type: body.type, format: body.format });
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
