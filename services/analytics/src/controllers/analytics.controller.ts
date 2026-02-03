import { Context } from 'hono';
import { analyticsService } from '@analytics/services/index.js';
import { successResponse, errorResponse, type JwtPayload } from '@pmt/shared';

export class AnalyticsController {
  /**
   * GET /analytics/dashboard
   */
  async getDashboard(c: Context) {
    const user = c.get('user') as JwtPayload;
    const dashboard = await analyticsService.getDashboard(user);
    return c.json(successResponse(dashboard), 200);
  }

  /**
   * GET /analytics/goals
   */
  async getGoalAnalytics(c: Context) {
    const query = c.req.query();
    
    const filters = {
      department_id: query.department_id,
      employee_id: query.employee_id,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
    };

    const analytics = await analyticsService.getGoalAnalytics(filters);
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/reviews
   */
  async getReviewAnalytics(c: Context) {
    const query = c.req.query();

    const filters = {
      cycle_id: query.cycle_id,
      department_id: query.department_id,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
    };

    const analytics = await analyticsService.getReviewAnalytics(filters);
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/team/:id
   */
  async getTeamAnalytics(c: Context) {
    const id = c.req.param('id');
    const analytics = await analyticsService.getTeamAnalytics(id);
    return c.json(successResponse(analytics), 200);
  }

  /**
   * GET /analytics/department/:id
   */
  async getDepartmentAnalytics(c: Context) {
    const id = c.req.param('id');
    const analytics = await analyticsService.getDepartmentAnalytics(id);
    return c.json(successResponse(analytics), 200);
  }

  /**
   * POST /analytics/export
   */
  async exportAnalytics(c: Context) {
    const body = await c.req.json();

    if (!body.type || !['goals', 'reviews', 'employees', 'all'].includes(body.type)) {
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid export type'), 422);
    }

    if (!body.format || !['csv', 'json', 'xlsx'].includes(body.format)) {
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid export format'), 422);
    }

    const result = await analyticsService.exportAnalytics({
      type: body.type,
      format: body.format,
      filters: body.filters,
    });

    return c.json(successResponse(result), 200);
  }
}

export const analyticsController = new AnalyticsController();
