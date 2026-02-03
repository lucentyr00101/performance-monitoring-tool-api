import { ReviewCycle, type ReviewCycleDocument } from '@reviews/models/index.js';
import { Review } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

const LOG_PREFIX = '[ReviewCycleService]';

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
    console.info(`${LOG_PREFIX} Listing review cycles`, { filters, page: pagination.page, perPage: pagination.perPage });

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

    console.info(`${LOG_PREFIX} Review cycles listed`, { count: cycles.length, total });
    return { cycles, total };
  }

  async getReviewCycleById(id: string): Promise<ReviewCycleDocument & { stats?: object }> {
    console.info(`${LOG_PREFIX} Getting review cycle by ID`, { cycleId: id });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    const stats = await Review.aggregate([
      { $match: { reviewCycleId: cycle._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statsMap: Record<string, number> = {};
    stats.forEach((s) => { statsMap[s._id] = s.count; });

    console.info(`${LOG_PREFIX} Review cycle retrieved`, { cycleId: id, name: cycle.name, status: cycle.status });
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
    console.info(`${LOG_PREFIX} Creating review cycle`, { name: data.name, type: data.type, startDate: data.startDate, endDate: data.endDate });

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      console.warn(`${LOG_PREFIX} Validation failed: end date must be after start date`, { startDate: data.startDate, endDate: data.endDate });
      throw new AppError('VALIDATION_ERROR', 'End date must be after start date', 422);
    }
    const cycle = await ReviewCycle.create(data);

    console.info(`${LOG_PREFIX} Review cycle created`, { cycleId: cycle._id, name: cycle.name });
    return cycle;
  }

  async updateReviewCycle(id: string, data: Record<string, unknown>): Promise<ReviewCycleDocument> {
    console.info(`${LOG_PREFIX} Updating review cycle`, { cycleId: id, updateFields: Object.keys(data) });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status === 'completed' || cycle.status === 'cancelled') {
      console.warn(`${LOG_PREFIX} Cannot update completed or cancelled review cycle`, { cycleId: id, status: cycle.status });
      throw new AppError('CONFLICT', 'Cannot update a completed or cancelled review cycle', 409);
    }

    Object.assign(cycle, data);
    await cycle.save();

    console.info(`${LOG_PREFIX} Review cycle updated`, { cycleId: id, name: cycle.name });
    return cycle;
  }

  async deleteReviewCycle(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Deleting review cycle`, { cycleId: id });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status === 'active') {
      console.warn(`${LOG_PREFIX} Cannot delete active review cycle`, { cycleId: id, status: cycle.status });
      throw new AppError('CONFLICT', 'Cannot delete an active review cycle', 409);
    }

    const reviewCount = await Review.countDocuments({ reviewCycleId: id });
    if (reviewCount > 0) {
      console.warn(`${LOG_PREFIX} Cannot delete review cycle with existing reviews`, { cycleId: id, reviewCount });
      throw new AppError('CONFLICT', 'Cannot delete review cycle with existing reviews', 409);
    }

    await cycle.deleteOne();
    console.info(`${LOG_PREFIX} Review cycle deleted`, { cycleId: id, name: cycle.name });
  }

  async launchReviewCycle(id: string): Promise<ReviewCycleDocument> {
    console.info(`${LOG_PREFIX} Launching review cycle`, { cycleId: id });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status !== 'draft' && cycle.status !== 'scheduled') {
      console.warn(`${LOG_PREFIX} Cannot launch review cycle with invalid status`, { cycleId: id, status: cycle.status });
      throw new AppError('CONFLICT', `Cannot launch review cycle with status: ${cycle.status}`, 409);
    }

    cycle.status = 'active';
    cycle.launchedAt = new Date();
    await cycle.save();

    console.info(`${LOG_PREFIX} Review cycle launched`, { cycleId: id, name: cycle.name, launchedAt: cycle.launchedAt });
    return cycle;
  }

  async completeReviewCycle(id: string): Promise<ReviewCycleDocument> {
    console.info(`${LOG_PREFIX} Completing review cycle`, { cycleId: id });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status !== 'active') {
      console.warn(`${LOG_PREFIX} Only active review cycles can be completed`, { cycleId: id, status: cycle.status });
      throw new AppError('CONFLICT', 'Only active review cycles can be completed', 409);
    }

    cycle.status = 'completed';
    cycle.completedAt = new Date();
    await cycle.save();

    console.info(`${LOG_PREFIX} Review cycle completed`, { cycleId: id, name: cycle.name, completedAt: cycle.completedAt });
    return cycle;
  }
}

export const reviewCycleService = new ReviewCycleService();
