import { Context } from 'hono';
import { reviewCycleService } from '@reviews/services/index.js';
import {
  successResponse,
  errorResponse,
  createReviewCycleSchema,
  updateReviewCycleSchema,
  reviewCycleQuerySchema,
  parsePagination,
} from '@pmt/shared';

const LOG_PREFIX = '[ReviewCycleController]';

export class ReviewCycleController {
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /review-cycles`);
    const query = c.req.query();

    const parsed = reviewCycleQuerySchema.safeParse({
      page: query.page,
      per_page: query.per_page,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      status: query.status,
      type: query.type,
      year: query.year,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      status: parsed.data.status,
      type: parsed.data.type,
      year: parsed.data.year,
    };

    const pagination = parsePagination({
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      sort_by: parsed.data.sort_by,
      sort_order: parsed.data.sort_order,
    });

    const { cycles, total } = await reviewCycleService.listReviewCycles(filters, pagination);

    console.info(`${LOG_PREFIX} List response sent`, { total });
    return c.json(successResponse(cycles, {
      pagination: {
        page: pagination.page,
        per_page: pagination.perPage,
        total_items: total,
        total_pages: Math.ceil(total / pagination.perPage),
      },
    }), 200);
  }

  async getById(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /review-cycles/${id}`);
    const cycle = await reviewCycleService.getReviewCycleById(id);
    console.info(`${LOG_PREFIX} GetById response sent`, { cycleId: id });
    return c.json(successResponse(cycle), 200);
  }

  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /review-cycles`);
    const body = await c.req.json();
    const parsed = createReviewCycleSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`, { errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const cycle = await reviewCycleService.createReviewCycle({
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      startDate: new Date(parsed.data.start_date),
      endDate: new Date(parsed.data.end_date),
      departments: parsed.data.departments,
      settings: parsed.data.settings ? {
        selfReviewEnabled: parsed.data.settings.include_self_assessment,
        peerReviewEnabled: parsed.data.settings.include_peer_review,
      } : undefined,
    });

    console.info(`${LOG_PREFIX} Create response sent`, { cycleId: cycle._id });
    return c.json(successResponse(cycle), 201);
  }

  async update(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /review-cycles/${id}`);
    const body = await c.req.json();
    const parsed = updateReviewCycleSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Update validation failed`, { cycleId: id, errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.type) updateData.type = parsed.data.type;
    if (parsed.data.start_date) updateData.startDate = new Date(parsed.data.start_date);
    if (parsed.data.end_date) updateData.endDate = new Date(parsed.data.end_date);
    if (parsed.data.departments) updateData.departments = parsed.data.departments;
    if (parsed.data.settings) updateData.settings = {
      selfReviewEnabled: parsed.data.settings.include_self_assessment,
      peerReviewEnabled: parsed.data.settings.include_peer_review,
    };

    const cycle = await reviewCycleService.updateReviewCycle(id, updateData);
    console.info(`${LOG_PREFIX} Update response sent`, { cycleId: id });
    return c.json(successResponse(cycle), 200);
  }

  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /review-cycles/${id}`);
    await reviewCycleService.deleteReviewCycle(id);
    console.info(`${LOG_PREFIX} Delete response sent`, { cycleId: id });
    return c.json(successResponse({ message: 'Review cycle deleted successfully' }), 200);
  }

  async launch(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-cycles/${id}/launch`);
    const cycle = await reviewCycleService.launchReviewCycle(id);
    console.info(`${LOG_PREFIX} Launch response sent`, { cycleId: id });
    return c.json(successResponse(cycle), 200);
  }

  async complete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-cycles/${id}/complete`);
    const cycle = await reviewCycleService.completeReviewCycle(id);
    console.info(`${LOG_PREFIX} Complete response sent`, { cycleId: id });
    return c.json(successResponse(cycle), 200);
  }
}

export const reviewCycleController = new ReviewCycleController();
