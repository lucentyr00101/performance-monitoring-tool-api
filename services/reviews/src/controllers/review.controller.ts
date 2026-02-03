import { Context } from 'hono';
import { reviewService } from '@reviews/services/index.js';
import {
  successResponse,
  errorResponse,
  updateReviewSchema,
  reviewQuerySchema,
  acknowledgeReviewSchema,
  parsePagination,
  type JwtPayload,
} from '@pmt/shared';

export class ReviewController {
  async list(c: Context) {
    const query = c.req.query();

    const parsed = reviewQuerySchema.safeParse({
      page: query.page,
      per_page: query.per_page,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      cycle_id: query.cycle_id,
      employee_id: query.employee_id,
      reviewer_id: query.reviewer_id,
      type: query.type,
      status: query.status,
    });

    if (!parsed.success) {
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      cycleId: parsed.data.cycle_id,
      employeeId: parsed.data.employee_id,
      reviewerId: parsed.data.reviewer_id,
      type: parsed.data.type,
      status: parsed.data.status,
    };

    const pagination = parsePagination({
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      sort_by: parsed.data.sort_by,
      sort_order: parsed.data.sort_order,
    });

    const { reviews, total } = await reviewService.listReviews(filters, pagination);

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
    const review = await reviewService.getReviewById(id);
    return c.json(successResponse(review), 200);
  }

  async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateReviewSchema.safeParse(body);
    const user = c.get('user') as JwtPayload;

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const review = await reviewService.updateReview(id, {
      rating: parsed.data.rating,
      ratingsBreakdown: parsed.data.ratings_breakdown,
      strengths: parsed.data.strengths,
      improvements: parsed.data.improvements,
      comments: parsed.data.comments,
      status: parsed.data.status,
    }, user.sub);
    return c.json(successResponse(review), 200);
  }

  async submit(c: Context) {
    const id = c.req.param('id');
    const review = await reviewService.submitReview(id);
    return c.json(successResponse(review), 200);
  }

  async acknowledge(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = acknowledgeReviewSchema.safeParse(body);
    
    const employeeComments = parsed.success ? parsed.data.employee_comments : undefined;
    const review = await reviewService.acknowledgeReview(id, employeeComments);
    return c.json(successResponse(review), 200);
  }
}

export const reviewController = new ReviewController();
