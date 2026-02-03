import { ReviewCycle, type ReviewCycleDocument } from '@reviews/models/index.js';
import { Review } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

export interface CreateReviewCycleDTO {
  name: string;
  description?: string;
  type: string;
  startDate: Date;
  endDate: Date;
  departments?: string[];
  settings?: {
    selfReviewEnabled?: boolean;
    peerReviewEnabled?: boolean;
    includeGoalReview?: boolean;
    requireCalibration?: boolean;
    allowEmployeeViewBeforeRelease?: boolean;
  };
}

export interface ReviewCycleFilters {
  status?: string;
  type?: string;
  year?: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

export class ReviewCycleService {
  async listReviewCycles(
    filters: ReviewCycleFilters,
    pagination: Pagination
  ): Promise<{ cycles: ReviewCycleDocument[]; total: number }> {
    const query: FilterQuery<ReviewCycleDocument> = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.year) {
      const startOfYear = new Date(filters.year, 0, 1);
      const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const sortField = pagination.sortBy || 'startDate';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [cycles, total] = await Promise.all([
      ReviewCycle.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      ReviewCycle.countDocuments(query),
    ]);

    return { cycles, total };
  }

  async getReviewCycleById(id: string): Promise<ReviewCycleDocument & { stats?: object }> {
    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    const stats = await Review.aggregate([
      { $match: { reviewCycleId: cycle._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statsMap: Record<string, number> = {};
    stats.forEach((s) => { statsMap[s._id] = s.count; });

    return Object.assign(cycle.toObject(), {
      stats: {
        total: Object.values(statsMap).reduce((a, b) => a + b, 0),
        pending: statsMap['pending'] || 0,
        in_progress: statsMap['in_progress'] || 0,
        submitted: statsMap['submitted'] || 0,
        acknowledged: statsMap['acknowledged'] || 0,
      },
    });
  }

  async createReviewCycle(data: CreateReviewCycleDTO): Promise<ReviewCycleDocument> {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new AppError('VALIDATION_ERROR', 'End date must be after start date', 422);
    }
    const cycle = await ReviewCycle.create(data);
    return cycle;
  }

  async updateReviewCycle(id: string, data: Record<string, unknown>): Promise<ReviewCycleDocument> {
    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status === 'completed' || cycle.status === 'cancelled') {
      throw new AppError('CONFLICT', 'Cannot update a completed or cancelled review cycle', 409);
    }

    Object.assign(cycle, data);
    await cycle.save();
    return cycle;
  }

  async deleteReviewCycle(id: string): Promise<void> {
    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status === 'active') {
      throw new AppError('CONFLICT', 'Cannot delete an active review cycle', 409);
    }

    const reviewCount = await Review.countDocuments({ reviewCycleId: id });
    if (reviewCount > 0) {
      throw new AppError('CONFLICT', 'Cannot delete review cycle with existing reviews', 409);
    }

    await cycle.deleteOne();
  }

  async launchReviewCycle(id: string): Promise<ReviewCycleDocument> {
    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status !== 'draft' && cycle.status !== 'scheduled') {
      throw new AppError('CONFLICT', `Cannot launch review cycle with status: ${cycle.status}`, 409);
    }

    cycle.status = 'active';
    cycle.launchedAt = new Date();
    await cycle.save();
    return cycle;
  }

  async completeReviewCycle(id: string): Promise<ReviewCycleDocument> {
    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status !== 'active') {
      throw new AppError('CONFLICT', 'Only active review cycles can be completed', 409);
    }

    cycle.status = 'completed';
    cycle.completedAt = new Date();
    await cycle.save();
    return cycle;
  }
}

export const reviewCycleService = new ReviewCycleService();
