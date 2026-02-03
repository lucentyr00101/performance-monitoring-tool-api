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

const LOG_PREFIX = '[GoalController]';

export class GoalController {
  /**
   * GET /goals
   */
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /goals`);

    const query = c.req.query();
    const parsed = goalQuerySchema.safeParse(query);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`, { errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const { goals, total, pagination } = await goalService.listGoals(parsed.data);

    console.info(`${LOG_PREFIX} List response sent`, { count: goals.length, total });

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
    console.info(`${LOG_PREFIX} GET /goals/${id}`);

    const goal = await goalService.getGoalById(id);

    console.info(`${LOG_PREFIX} GetById response sent`, { goalId: id });

    return c.json(successResponse(goal), 200);
  }

  /**
   * POST /goals
   */
  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /goals`);

    const body = await c.req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`, { errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} Create response sent`, { goalId: goal.id });

    return c.json(successResponse(goal), 201);
  }

  /**
   * PUT /goals/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /goals/${id}`);

    const body = await c.req.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Update validation failed`, { goalId: id, errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} Update response sent`, { goalId: id });

    return c.json(successResponse(goal), 200);
  }

  /**
   * DELETE /goals/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /goals/${id}`);

    await goalService.deleteGoal(id);

    console.info(`${LOG_PREFIX} Delete response sent`, { goalId: id });

    return c.json(successResponse({ message: 'Goal deleted successfully' }), 200);
  }

  /**
   * PATCH /goals/:id/progress
   */
  async updateProgress(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PATCH /goals/${id}/progress`);

    const body = await c.req.json();
    const parsed = updateProgressSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} UpdateProgress validation failed`, { goalId: id, errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const goal = await goalService.updateProgress(id, parsed.data.progress, parsed.data.note);

    console.info(`${LOG_PREFIX} UpdateProgress response sent`, { goalId: id, progress: parsed.data.progress });

    return c.json(successResponse(goal), 200);
  }

  /**
   * GET /goals/:id/key-results
   */
  async getKeyResults(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /goals/${id}/key-results`);

    const keyResults = await goalService.getKeyResults(id);

    console.info(`${LOG_PREFIX} GetKeyResults response sent`, { goalId: id, count: keyResults.length });

    return c.json(successResponse(keyResults), 200);
  }

  /**
   * POST /goals/:id/key-results
   */
  async addKeyResult(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /goals/${id}/key-results`);

    const body = await c.req.json();
    const parsed = keyResultSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} AddKeyResult validation failed`, { goalId: id, errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} AddKeyResult response sent`, { goalId: id });

    return c.json(successResponse(goal), 201);
  }

  /**
   * PUT /goals/:id/key-results/:krId
   */
  async updateKeyResult(c: Context) {
    const id = c.req.param('id');
    const krId = c.req.param('krId');
    console.info(`${LOG_PREFIX} PUT /goals/${id}/key-results/${krId}`);

    const body = await c.req.json();
    const parsed = updateKeyResultSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} UpdateKeyResult validation failed`, { goalId: id, keyResultId: krId, errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} UpdateKeyResult response sent`, { goalId: id, keyResultId: krId });

    return c.json(successResponse(goal), 200);
  }

  /**
   * DELETE /goals/:id/key-results/:krId
   */
  async deleteKeyResult(c: Context) {
    const id = c.req.param('id');
    const krId = c.req.param('krId');
    console.info(`${LOG_PREFIX} DELETE /goals/${id}/key-results/${krId}`);

    const goal = await goalService.deleteKeyResult(id, krId);

    console.info(`${LOG_PREFIX} DeleteKeyResult response sent`, { goalId: id, keyResultId: krId });

    return c.json(successResponse(goal), 200);
  }
}

export const goalController = new GoalController();
