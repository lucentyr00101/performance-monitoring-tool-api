import { Review, type ReviewDocument } from '@reviews/models/index.js';
import { ReviewCycle } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

const LOG_PREFIX = '[ReviewService]';

export interface UpdateReviewDTO {
  rating?: number;
  ratingsBreakdown?: Record<string, number>;
  strengths?: string;
  improvements?: string;
  comments?: string;
  status?: 'in_progress' | 'submitted';
}

export interface ReviewFilters {
  cycleId?: string;
  employeeId?: string;
  reviewerId?: string;
  type?: string;
  status?: string;
}

export interface Pagination {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

export class ReviewService {
  async listReviews(
    filters: ReviewFilters,
    pagination: Pagination
  ): Promise<{ reviews: ReviewDocument[]; total: number }> {
    console.info(`${LOG_PREFIX} Listing reviews`, { filters, page: pagination.page, perPage: pagination.perPage });

    const query: FilterQuery<ReviewDocument> = {};

    if (filters.cycleId) query.reviewCycleId = filters.cycleId;
    if (filters.employeeId) query.employeeId = filters.employeeId;
    if (filters.reviewerId) query.reviewerId = filters.reviewerId;
    if (filters.type) query.reviewerType = filters.type;
    if (filters.status) query.status = filters.status;

    const sortField = pagination.sortBy || 'createdAt';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      Review.countDocuments(query),
    ]);

    console.info(`${LOG_PREFIX} Reviews listed`, { count: reviews.length, total });
    return { reviews, total };
  }

  async getReviewById(id: string): Promise<ReviewDocument> {
    console.info(`${LOG_PREFIX} Getting review by ID`, { reviewId: id });

    const review = await Review.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Review not found', 404);
    }

    console.info(`${LOG_PREFIX} Review retrieved`, { reviewId: id, status: review.status, employeeId: review.employeeId });
    return review;
  }

  async updateReview(id: string, data: UpdateReviewDTO, userId: string): Promise<ReviewDocument> {
    console.info(`${LOG_PREFIX} Updating review`, { reviewId: id, userId, updateFields: Object.keys(data) });

    const review = await Review.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Review not found', 404);
    }

    if (review.status === 'finalized') {
      console.warn(`${LOG_PREFIX} Cannot update finalized review`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Cannot update a finalized review', 409);
    }

    if (review.status === 'pending') {
      review.status = 'in_progress';
    }

    if (data.rating !== undefined) review.overallRating = data.rating;
    if (data.ratingsBreakdown) review.ratingsBreakdown = data.ratingsBreakdown;
    if (data.strengths) review.strengths = [data.strengths];
    if (data.improvements) review.areasForImprovement = [data.improvements];
    if (data.comments) review.overallComment = data.comments;
    if (data.status) review.status = data.status;

    await review.save();

    console.info(`${LOG_PREFIX} Review updated`, { reviewId: id, status: review.status });
    return review;
  }

  async submitReview(id: string): Promise<ReviewDocument> {
    console.info(`${LOG_PREFIX} Submitting review`, { reviewId: id });

    const review = await Review.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Review not found', 404);
    }

    if (review.status !== 'pending' && review.status !== 'in_progress') {
      console.warn(`${LOG_PREFIX} Cannot submit review with invalid status`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', `Cannot submit review with status: ${review.status}`, 409);
    }

    review.status = 'submitted';
    review.submittedAt = new Date();
    await review.save();

    console.info(`${LOG_PREFIX} Review submitted`, { reviewId: id, submittedAt: review.submittedAt });
    return review;
  }

  async acknowledgeReview(id: string, employeeComments?: string): Promise<ReviewDocument> {
    console.info(`${LOG_PREFIX} Acknowledging review`, { reviewId: id, hasComments: !!employeeComments });

    const review = await Review.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Review not found', 404);
    }

    if (review.status !== 'submitted') {
      console.warn(`${LOG_PREFIX} Only submitted reviews can be acknowledged`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Only submitted reviews can be acknowledged', 409);
    }

    review.status = 'acknowledged';
    review.acknowledgedAt = new Date();
    if (employeeComments) {
      review.employeeComments = employeeComments;
    }
    await review.save();

    console.info(`${LOG_PREFIX} Review acknowledged`, { reviewId: id, acknowledgedAt: review.acknowledgedAt });
    return review;
  }

  async createReview(data: {
    reviewCycleId: string;
    employeeId: string;
    reviewerId: string;
    reviewerType: 'self' | 'manager' | 'peer' | 'hr';
  }): Promise<ReviewDocument> {
    console.info(`${LOG_PREFIX} Creating review`, { cycleId: data.reviewCycleId, employeeId: data.employeeId, reviewerType: data.reviewerType });

    const cycle = await ReviewCycle.findById(data.reviewCycleId);
    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: data.reviewCycleId });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }
    if (cycle.status !== 'active') {
      console.warn(`${LOG_PREFIX} Can only create reviews for active review cycles`, { cycleId: data.reviewCycleId, status: cycle.status });
      throw new AppError('CONFLICT', 'Can only create reviews for active review cycles', 409);
    }

    const existing = await Review.findOne({
      reviewCycleId: data.reviewCycleId,
      employeeId: data.employeeId,
      reviewerType: data.reviewerType,
    });
    if (existing) {
      console.warn(`${LOG_PREFIX} Review already exists for this employee and reviewer type`, { cycleId: data.reviewCycleId, employeeId: data.employeeId, reviewerType: data.reviewerType });
      throw new AppError('CONFLICT', 'Review already exists for this employee and reviewer type', 409);
    }

    const review = await Review.create({
      ...data,
      status: 'pending',
    });

    console.info(`${LOG_PREFIX} Review created`, { reviewId: review._id, employeeId: data.employeeId, reviewerType: data.reviewerType });
    return review;
  }
}

export const reviewService = new ReviewService();
