import { Context } from 'hono';
import { adhocReviewService } from '@reviews/services/index.js';
import {
  successResponse,
  errorResponse,
  createAdhocReviewSchema,
  adhocReviewQuerySchema,
  parsePagination,
} from '@pmt/shared';

export class AdhocReviewController {
  async list(c: Context) {
    const query = c.req.query();

    const parsed = adhocReviewQuerySchema.safeParse({
      page: query.page,
      per_page: query.per_page,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      status: query.status,
      employee_id: query.employee_id,
      manager_id: query.manager_id,
      triggered_by: query.triggered_by,
      due_before: query.due_before,
      overdue: query.overdue,
    });

    if (!parsed.success) {
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      status: parsed.data.status,
      employeeId: parsed.data.employee_id,
      managerId: parsed.data.manager_id,
      triggeredBy: parsed.data.triggered_by,
      dueBefore: parsed.data.due_before ? new Date(parsed.data.due_before) : undefined,
      overdue: parsed.data.overdue,
    };

    const pagination = parsePagination({
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      sort_by: parsed.data.sort_by,
      sort_order: parsed.data.sort_order,
    });

    const { reviews, total } = await adhocReviewService.listAdhocReviews(filters, pagination);

    return c.json(successResponse(reviews, {
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
    const review = await adhocReviewService.getAdhocReviewById(id);
    return c.json(successResponse(review), 200);
  }

  async create(c: Context) {
    const body = await c.req.json();
    const parsed = createAdhocReviewSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const user = c.get('user') as { sub: string };

    const review = await adhocReviewService.createAdhocReview({
      employeeId: parsed.data.employee_id,
      triggeredBy: user.sub,
      dueDate: parsed.data.due_date ? new Date(parsed.data.due_date) : undefined,
      reason: parsed.data.reason,
      reviewFormId: parsed.data.review_form_id || undefined,
      settings: parsed.data.settings,
    });

    return c.json(successResponse(review), 201);
  }

  async delete(c: Context) {
    const id = c.req.param('id');
    await adhocReviewService.deleteAdhocReview(id);
    return c.json(successResponse({ message: 'Ad-hoc review deleted successfully' }), 200);
  }

  async remind(c: Context) {
    const id = c.req.param('id');
    await adhocReviewService.sendReminder(id);
    return c.json(successResponse({ message: 'Reminder sent successfully' }), 200);
  }

  async cancel(c: Context) {
    const id = c.req.param('id');
    const review = await adhocReviewService.cancelAdhocReview(id);
    return c.json(successResponse(review), 200);
  }

  async acknowledge(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const review = await adhocReviewService.acknowledgeAdhocReview(id, body.employee_comments);
    return c.json(successResponse(review), 200);
  }
}

export const adhocReviewController = new AdhocReviewController();
