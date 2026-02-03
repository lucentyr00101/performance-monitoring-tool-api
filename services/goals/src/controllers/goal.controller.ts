import { Context } from 'hono';
import { goalService } from '@goals/services/index.js';
import {
  successResponse,
  errorResponse,
  createGoalSchema,
  updateGoalSchema,
  updateKeyResultSchema,
  goalQuerySchema,
  keyResultSchema,
  updateProgressSchema,
} from '@pmt/shared';

export class GoalController {
  /**
   * GET /goals
   */
  async list(c: Context) {
    const query = c.req.query();
    const parsed = goalQuerySchema.safeParse(query);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const { goals, total, pagination } = await goalService.listGoals(parsed.data);

    return c.json(successResponse(
      goals,
      {
        pagination: {
          page: pagination.page,
          per_page: pagination.perPage,
          total_items: total,
          total_pages: Math.ceil(total / pagination.perPage),
        },
      }
    ), 200);
  }

  /**
   * GET /goals/:id
   */
  async getById(c: Context) {
    const id = c.req.param('id');
    const goal = await goalService.getGoalById(id);
    return c.json(successResponse(goal), 200);
  }

  /**
   * POST /goals
   */
  async create(c: Context) {
    const body = await c.req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const goal = await goalService.createGoal({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      ownerId: parsed.data.owner_id,
      parentGoalId: parsed.data.parent_goal_id,
      startDate: parsed.data.start_date ? new Date(parsed.data.start_date) : undefined,
      dueDate: parsed.data.due_date ? new Date(parsed.data.due_date) : undefined,
      keyResults: parsed.data.key_results?.map(kr => ({
        title: kr.title,
        description: kr.description,
        targetValue: kr.target_value,
        unit: kr.unit,
      })),
    });

    return c.json(successResponse(goal), 201);
  }

  /**
   * PUT /goals/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.title) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.type) updateData.type = parsed.data.type;
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.owner_id) updateData.ownerId = parsed.data.owner_id;
    if (parsed.data.parent_goal_id !== undefined) updateData.parentGoalId = parsed.data.parent_goal_id;
    if (parsed.data.start_date) updateData.startDate = new Date(parsed.data.start_date);
    if (parsed.data.due_date) updateData.dueDate = new Date(parsed.data.due_date);

    const goal = await goalService.updateGoal(id, updateData);
    return c.json(successResponse(goal), 200);
  }

  /**
   * DELETE /goals/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    await goalService.deleteGoal(id);
    return c.json(successResponse({ message: 'Goal deleted successfully' }), 200);
  }

  /**
   * PATCH /goals/:id/progress
   */
  async updateProgress(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateProgressSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const goal = await goalService.updateProgress(id, parsed.data.progress, parsed.data.note);
    return c.json(successResponse(goal), 200);
  }

  /**
   * GET /goals/:id/key-results
   */
  async getKeyResults(c: Context) {
    const id = c.req.param('id');
    const keyResults = await goalService.getKeyResults(id);
    return c.json(successResponse(keyResults), 200);
  }

  /**
   * POST /goals/:id/key-results
   */
  async addKeyResult(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = keyResultSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const goal = await goalService.addKeyResult(id, {
      title: parsed.data.title,
      description: parsed.data.description,
      targetValue: parsed.data.target_value,
      unit: parsed.data.unit,
    });

    return c.json(successResponse(goal), 201);
  }

  /**
   * PUT /goals/:id/key-results/:krId
   */
  async updateKeyResult(c: Context) {
    const id = c.req.param('id');
    const krId = c.req.param('krId');
    const body = await c.req.json();
    const parsed = updateKeyResultSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.title) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.target_value !== undefined) updateData.targetValue = parsed.data.target_value;
    if (parsed.data.current_value !== undefined) updateData.currentValue = parsed.data.current_value;
    if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
    if (parsed.data.status) updateData.status = parsed.data.status;

    const goal = await goalService.updateKeyResult(id, krId, updateData);
    return c.json(successResponse(goal), 200);
  }

  /**
   * DELETE /goals/:id/key-results/:krId
   */
  async deleteKeyResult(c: Context) {
    const id = c.req.param('id');
    const krId = c.req.param('krId');
    const goal = await goalService.deleteKeyResult(id, krId);
    return c.json(successResponse(goal), 200);
  }
}

export const goalController = new GoalController();
