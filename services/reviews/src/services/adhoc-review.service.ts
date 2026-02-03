import { AdhocReview, type AdhocReviewDocument } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

const LOG_PREFIX = '[AdhocReviewService]';

export interface CreateAdhocReviewDTO {
  employeeId: string;
  triggeredBy: string;
  dueDate?: Date;
  reason?: string;
  reviewFormId?: string;
  settings?: {
    self_review_required?: boolean;
    manager_review_required?: boolean;
    include_goals?: boolean;
  };
}

export interface AdhocReviewFilters {
  status?: string;
  employeeId?: string;
  managerId?: string;
  triggeredBy?: string;
  dueBefore?: Date;
  overdue?: boolean;
}

export interface Pagination {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

export class AdhocReviewService {
  async listAdhocReviews(
    filters: AdhocReviewFilters,
    pagination: Pagination
  ): Promise<{ reviews: AdhocReviewDocument[]; total: number }> {
    console.info(`${LOG_PREFIX} Listing ad-hoc reviews`, { filters, page: pagination.page, perPage: pagination.perPage });

    const query: FilterQuery<AdhocReviewDocument> = {};

    if (filters.status) query.status = filters.status;
    if (filters.employeeId) query.employeeId = filters.employeeId;
    if (filters.managerId) query.managerId = filters.managerId;
    if (filters.triggeredBy) query.triggeredBy = filters.triggeredBy;
    if (filters.dueBefore) query.dueDate = { $lte: filters.dueBefore };
    if (filters.overdue) {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['completed', 'cancelled'] };
    }

    const sortField = pagination.sortBy || 'createdAt';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [reviews, total] = await Promise.all([
      AdhocReview.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      AdhocReview.countDocuments(query),
    ]);

    console.info(`${LOG_PREFIX} Ad-hoc reviews listed`, { count: reviews.length, total });
    return { reviews, total };
  }

  async getAdhocReviewById(id: string): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Getting ad-hoc review by ID`, { reviewId: id });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    console.info(`${LOG_PREFIX} Ad-hoc review retrieved`, { reviewId: id, status: review.status, employeeId: review.employeeId });
    return review;
  }

  async createAdhocReview(data: CreateAdhocReviewDTO): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Creating ad-hoc review`, { employeeId: data.employeeId, triggeredBy: data.triggeredBy, dueDate: data.dueDate });

    const review = await AdhocReview.create({
      employeeId: data.employeeId,
      triggeredBy: data.triggeredBy,
      dueDate: data.dueDate,
      reason: data.reason,
      reviewFormId: data.reviewFormId,
      settings: data.settings ? {
        selfReviewRequired: data.settings.self_review_required,
        managerReviewRequired: data.settings.manager_review_required,
        includeGoals: data.settings.include_goals,
      } : undefined,
      status: 'initiated',
    });

    console.info(`${LOG_PREFIX} Ad-hoc review created`, { reviewId: review._id, employeeId: data.employeeId });
    return review;
  }

  async deleteAdhocReview(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Deleting ad-hoc review`, { reviewId: id });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    if (review.status === 'completed') {
      console.warn(`${LOG_PREFIX} Cannot delete completed review`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Cannot delete a completed review', 409);
    }

    await review.deleteOne();
    console.info(`${LOG_PREFIX} Ad-hoc review deleted`, { reviewId: id, employeeId: review.employeeId });
  }

  async sendReminder(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Sending reminder for ad-hoc review`, { reviewId: id });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    if (review.status === 'completed' || review.status === 'cancelled') {
      console.warn(`${LOG_PREFIX} Cannot send reminder for completed or cancelled review`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Cannot send reminder for completed or cancelled review', 409);
    }

    // TODO: Send email reminder
    review.lastReminderSentAt = new Date();
    await review.save();

    console.info(`${LOG_PREFIX} Reminder sent for ad-hoc review`, { reviewId: id, lastReminderSentAt: review.lastReminderSentAt });
  }

  async cancelAdhocReview(id: string): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Cancelling ad-hoc review`, { reviewId: id });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    if (review.status === 'completed') {
      console.warn(`${LOG_PREFIX} Cannot cancel completed review`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Cannot cancel a completed review', 409);
    }

    review.status = 'cancelled';
    await review.save();

    console.info(`${LOG_PREFIX} Ad-hoc review cancelled`, { reviewId: id, employeeId: review.employeeId });
    return review;
  }

  async acknowledgeAdhocReview(id: string, employeeComments?: string): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Acknowledging ad-hoc review`, { reviewId: id, hasComments: !!employeeComments });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    if (review.status !== 'pending_acknowledgment') {
      console.warn(`${LOG_PREFIX} Review is not pending acknowledgment`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Review is not pending acknowledgment', 409);
    }

    review.status = 'completed';
    review.acknowledgedAt = new Date();
    if (employeeComments) {
      review.employeeComments = employeeComments;
    }
    await review.save();

    console.info(`${LOG_PREFIX} Ad-hoc review acknowledged`, { reviewId: id, acknowledgedAt: review.acknowledgedAt });
    return review;
  }
}

export const adhocReviewService = new AdhocReviewService();
