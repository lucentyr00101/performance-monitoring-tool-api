import { Context } from 'hono';
import { adhocReviewService } from '@reviews/services/index.js';
import {
  successResponse,
  errorResponse,
  createAdhocReviewSchema,
  adhocReviewQuerySchema,
  submitAdhocReviewSchema,
  acknowledgeAdhocReviewSchema,
  parsePagination,
  createError,
  type JwtPayload,
} from '@pmt/shared';

const LOG_PREFIX = '[AdhocReviewController]';

export class AdhocReviewController {
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /adhoc-reviews`);
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
      console.warn(`${LOG_PREFIX} List validation failed`, { errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} List response sent`, { total });
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
    console.info(`${LOG_PREFIX} GET /adhoc-reviews/${id}`);
    const review = await adhocReviewService.getAdhocReviewById(id);
    console.info(`${LOG_PREFIX} GetById response sent`, { reviewId: id });
    return c.json(successResponse(review), 200);
  }

  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /adhoc-reviews`);
    const body = await c.req.json();
    const parsed = createAdhocReviewSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`, { errors: parsed.error.errors });
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

    console.info(`${LOG_PREFIX} Create response sent`, { reviewId: review._id });
    return c.json(successResponse(review), 201);
  }

  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /adhoc-reviews/${id}`);
    await adhocReviewService.deleteAdhocReview(id);
    console.info(`${LOG_PREFIX} Delete response sent`, { reviewId: id });
    return c.json(successResponse({ message: 'Ad-hoc review deleted successfully' }), 200);
  }

  async remind(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /adhoc-reviews/${id}/remind`);
    await adhocReviewService.sendReminder(id);
    console.info(`${LOG_PREFIX} Remind response sent`, { reviewId: id });
    return c.json(successResponse({ message: 'Reminder sent successfully' }), 200);
  }

  async cancel(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /adhoc-reviews/${id}/cancel`);
    const review = await adhocReviewService.cancelAdhocReview(id);
    console.info(`${LOG_PREFIX} Cancel response sent`, { reviewId: id });
    return c.json(successResponse(review), 200);
  }

  async acknowledge(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /adhoc-reviews/${id}/acknowledge`);
    const body = await c.req.json().catch(() => ({}));

    const parsed = acknowledgeAdhocReviewSchema.safeParse(body);
    const comments = parsed.success ? parsed.data.comments : body.employee_comments;

    const review = await adhocReviewService.acknowledgeAdhocReview(id, comments);

    console.info(`${LOG_PREFIX} Acknowledge response sent`, { reviewId: id });
    return c.json(successResponse({
      id: review._id?.toString() ?? review.id,
      status: review.status,
      acknowledgedAt: review.acknowledgedAt?.toISOString() ?? null,
    }), 200);
  }

  async submitSelfReview(c: Context) {
    const id = c.req.param('id');
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} PUT /adhoc-reviews/${id}/self-review`, { userId: user.sub });

    let body: unknown;
    try {
      body = await c.req.json();
    } catch (e) {
      throw createError.badRequest('Invalid JSON in request body');
    }

    const parsed = submitAdhocReviewSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Self-review validation failed`, { errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        ),
        422
      );
    }

    // Authorization: only the assigned employee can submit self-review
    const existing = await adhocReviewService.getAdhocReviewById(id);
    if (user.employeeId && existing.employeeId.toString() !== user.employeeId) {
      console.warn(`${LOG_PREFIX} Self-review authorization failed`, {
        reviewId: id,
        userId: user.sub,
        employeeId: user.employeeId,
        reviewEmployeeId: existing.employeeId.toString(),
      });
      throw createError.authorization('Only the assigned employee can submit a self-review');
    }

    const review = await adhocReviewService.submitSelfReview(
      id,
      parsed.data.answers,
      parsed.data.status,
    );

    console.info(`${LOG_PREFIX} Self-review response sent`, { reviewId: id, status: review.status });
    return c.json(successResponse({
      id: review._id?.toString() ?? review.id,
      status: review.status,
      selfReview: review.selfReview ? {
        status: review.selfReview.status,
        submittedAt: review.selfReview.submittedAt?.toISOString() ?? null,
        answers: review.selfReview.answers,
      } : null,
    }), 200);
  }

  async submitManagerReview(c: Context) {
    const id = c.req.param('id');
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} PUT /adhoc-reviews/${id}/manager-review`, { userId: user.sub });

    let body: unknown;
    try {
      body = await c.req.json();
    } catch (e) {
      throw createError.badRequest('Invalid JSON in request body');
    }

    const parsed = submitAdhocReviewSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Manager review validation failed`, { errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        ),
        422
      );
    }

    // Authorization: only the assigned manager can submit manager review
    const existing = await adhocReviewService.getAdhocReviewById(id);
    if (user.employeeId && existing.managerId && existing.managerId.toString() !== user.employeeId) {
      console.warn(`${LOG_PREFIX} Manager review authorization failed`, {
        reviewId: id,
        userId: user.sub,
        employeeId: user.employeeId,
        reviewManagerId: existing.managerId.toString(),
      });
      throw createError.authorization('Only the assigned manager can submit a manager review');
    }

    const review = await adhocReviewService.submitManagerReview(
      id,
      parsed.data.answers,
      parsed.data.status,
    );

    console.info(`${LOG_PREFIX} Manager review response sent`, { reviewId: id, status: review.status });
    return c.json(successResponse({
      id: review._id?.toString() ?? review.id,
      status: review.status,
      managerReview: review.managerReview ? {
        status: review.managerReview.status,
        submittedAt: review.managerReview.submittedAt?.toISOString() ?? null,
        answers: review.managerReview.answers,
      } : null,
    }), 200);
  }
}

export const adhocReviewController = new AdhocReviewController();
