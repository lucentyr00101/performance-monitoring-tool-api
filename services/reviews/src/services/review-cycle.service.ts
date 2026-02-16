import { ReviewCycle, type ReviewCycleDocument } from '@reviews/models/index.js';
import { Review } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';

const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:4002';
const LOG_PREFIX = '[ReviewCycleService]';

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
  managerId?: string;
  status: string;
}

interface ReviewGenerationResult {
  totalEmployees: number;
  reviewsCreated: {
    self: number;
    manager: number;
    peer: number;
    hr: number;
  };
  reviewsSkipped: {
    selfReview: number;
    managerReview: number;
    peerReview: number;
    hrReview: number;
  };
  errors: Array<{
    employeeId: string;
    employeeName: string;
    reviewType: string;
    reason: string;
  }>;
}

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

  private async fetchEmployeesInScope(
    cycle: ReviewCycleDocument
  ): Promise<EmployeeData[]> {
    const url = new URL(`${EMPLOYEE_SERVICE_URL}/api/v1/employees`);
    url.searchParams.set('status', 'active');
    url.searchParams.set('per_page', '1000');

    console.info(`${LOG_PREFIX} Fetching employees`, { cycleId: cycle._id });

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (err) {
      console.error(`${LOG_PREFIX} Failed to fetch employees`, { error: err });
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        'Failed to fetch employees from employee service',
        503
      );
    }

    if (!response.ok) {
      console.error(`${LOG_PREFIX} Employee service returned error`, {
        status: response.status,
        statusText: response.statusText,
      });
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        `Employee service returned ${response.status}`,
        503
      );
    }

    const body = await response.json() as any;
    const employees = (body.data?.employees || body.data || []) as EmployeeData[];

    console.info(`${LOG_PREFIX} Fetched employees from service`, {
      count: employees.length,
    });

    // Filter by departments if specified
    if (cycle.departments && cycle.departments.length > 0) {
      const deptIds = cycle.departments.map(d => d.toString());
      const filtered = employees.filter(
        e => e.departmentId && deptIds.includes(e.departmentId)
      );
      console.info(`${LOG_PREFIX} Filtered employees by department`, {
        before: employees.length,
        after: filtered.length,
        departments: deptIds,
      });
      return filtered;
    }

    return employees;
  }

  private async generateReviewsForCycle(
    cycle: ReviewCycleDocument
  ): Promise<ReviewGenerationResult> {
    console.info(`${LOG_PREFIX} Generating reviews for cycle`, {
      cycleId: cycle._id,
    });

    // Check for existing reviews
    const existingCount = await Review.countDocuments({
      reviewCycleId: cycle._id,
    });
    if (existingCount > 0) {
      console.warn(`${LOG_PREFIX} Reviews already exist for cycle`, {
        cycleId: cycle._id,
        count: existingCount,
      });
      throw new AppError(
        'CONFLICT',
        `Reviews already exist for this cycle (${existingCount} reviews). Cannot regenerate.`,
        409
      );
    }

    // Fetch employees
    const employees = await this.fetchEmployeesInScope(cycle);

    if (employees.length === 0) {
      console.warn(`${LOG_PREFIX} No employees in scope for cycle`, {
        cycleId: cycle._id,
      });
      return {
        totalEmployees: 0,
        reviewsCreated: { self: 0, manager: 0, peer: 0, hr: 0 },
        reviewsSkipped: { selfReview: 0, managerReview: 0, peerReview: 0, hrReview: 0 },
        errors: [],
      };
    }

    // Build review documents
    const reviewsToCreate: Array<{
      reviewCycleId: Types.ObjectId;
      employeeId: Types.ObjectId;
      reviewerId: Types.ObjectId;
      reviewerType: 'self' | 'manager' | 'peer' | 'hr';
      status: 'pending';
    }> = [];

    const result: ReviewGenerationResult = {
      totalEmployees: employees.length,
      reviewsCreated: { self: 0, manager: 0, peer: 0, hr: 0 },
      reviewsSkipped: { selfReview: 0, managerReview: 0, peerReview: 0, hrReview: 0 },
      errors: [],
    };

    for (const employee of employees) {
      const employeeName = `${employee.firstName} ${employee.lastName}`;

      try {
        const employeeObjId = new Types.ObjectId(employee.id);

        // Self review
        if (cycle.settings?.selfReviewEnabled !== false) {
          reviewsToCreate.push({
            reviewCycleId: cycle._id,
            employeeId: employeeObjId,
            reviewerId: employeeObjId,
            reviewerType: 'self',
            status: 'pending',
          });
        } else {
          result.reviewsSkipped.selfReview++;
        }

        // Manager review
        if (employee.managerId) {
          try {
            const managerObjId = new Types.ObjectId(employee.managerId);
            reviewsToCreate.push({
              reviewCycleId: cycle._id,
              employeeId: employeeObjId,
              reviewerId: managerObjId,
              reviewerType: 'manager',
              status: 'pending',
            });
          } catch (err) {
            console.warn(`${LOG_PREFIX} Invalid managerId`, {
              employeeId: employee.id,
              managerId: employee.managerId,
            });
            result.reviewsSkipped.managerReview++;
            result.errors.push({
              employeeId: employee.id,
              employeeName,
              reviewType: 'manager',
              reason: 'Invalid manager ID format',
            });
          }
        } else {
          console.warn(`${LOG_PREFIX} Employee has no manager`, {
            employeeId: employee.id,
            employeeName,
          });
          result.reviewsSkipped.managerReview++;
          result.errors.push({
            employeeId: employee.id,
            employeeName,
            reviewType: 'manager',
            reason: 'No manager assigned',
          });
        }

        // Peer reviews - not implemented yet
        if (cycle.settings?.peerReviewEnabled) {
          result.reviewsSkipped.peerReview++;
        }

        // HR reviews - not implemented yet
        if (cycle.settings?.requireCalibration) {
          result.reviewsSkipped.hrReview++;
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} Error processing employee`, {
          employeeId: employee.id,
          error: err,
        });
        result.errors.push({
          employeeId: employee.id,
          employeeName,
          reviewType: 'all',
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Bulk insert reviews
    if (reviewsToCreate.length > 0) {
      try {
        console.info(`${LOG_PREFIX} Inserting reviews`, {
          count: reviewsToCreate.length,
        });

        const insertResult = await Review.insertMany(reviewsToCreate, {
          ordered: false,
        });

        // Count by type
        for (const review of insertResult) {
          const reviewType = review.reviewerType as 'self' | 'manager' | 'peer' | 'hr';
          result.reviewsCreated[reviewType]++;
        }

        console.info(`${LOG_PREFIX} Reviews created successfully`, {
          cycleId: cycle._id,
          total: insertResult.length,
          byType: result.reviewsCreated,
        });
      } catch (err: any) {
        // Handle bulk insert errors (e.g., duplicates)
        if (err.writeErrors) {
          console.warn(`${LOG_PREFIX} Some reviews failed to create`, {
            cycleId: cycle._id,
            failedCount: err.writeErrors.length,
          });

          // Count successful insertions
          if (err.insertedDocs) {
            for (const review of err.insertedDocs) {
              const reviewType = review.reviewerType as 'self' | 'manager' | 'peer' | 'hr';
              result.reviewsCreated[reviewType]++;
            }
          }

          // Add write errors to results
          for (const writeErr of err.writeErrors) {
            const doc = reviewsToCreate[writeErr.index];
            if (doc) {
              result.errors.push({
                employeeId: doc.employeeId.toString(),
                employeeName: 'Unknown',
                reviewType: doc.reviewerType,
                reason: writeErr.errmsg || 'Write error',
              });
            }
          }
        } else {
          throw err;
        }
      }
    }

    console.info(`${LOG_PREFIX} Review generation complete`, {
      cycleId: cycle._id,
      totalEmployees: result.totalEmployees,
      created: result.reviewsCreated,
      skipped: result.reviewsSkipped,
      errorCount: result.errors.length,
    });

    return result;
  }

  async launchReviewCycle(
    id: string
  ): Promise<ReviewCycleDocument & { reviewGeneration?: ReviewGenerationResult }> {
    console.info(`${LOG_PREFIX} Launching review cycle`, { cycleId: id });

    const cycle = await ReviewCycle.findById(id);

    if (!cycle) {
      console.warn(`${LOG_PREFIX} Review cycle not found`, { cycleId: id });
      throw new AppError('NOT_FOUND', 'Review cycle not found', 404);
    }

    if (cycle.status !== 'draft' && cycle.status !== 'scheduled') {
      console.warn(`${LOG_PREFIX} Cannot launch review cycle with invalid status`, {
        cycleId: id,
        status: cycle.status,
      });
      throw new AppError(
        'CONFLICT',
        `Cannot launch review cycle with status: ${cycle.status}`,
        409
      );
    }

    cycle.status = 'active';
    cycle.launchedAt = new Date();
    await cycle.save();

    console.info(`${LOG_PREFIX} Review cycle status updated to active`, {
      cycleId: id,
    });

    // Generate reviews for all eligible employees
    let reviewGeneration: ReviewGenerationResult | undefined;
    try {
      reviewGeneration = await this.generateReviewsForCycle(cycle);
      const totalCreated = Object.values(reviewGeneration.reviewsCreated).reduce(
        (sum, count) => sum + count,
        0
      );
      console.info(`${LOG_PREFIX} Review generation successful`, {
        cycleId: id,
        totalCreated,
      });
    } catch (err) {
      console.error(`${LOG_PREFIX} Review generation failed`, {
        cycleId: id,
        error: err,
      });
      // Cycle is already active - throw error to inform caller
      throw err;
    }

    const result = Object.assign(cycle.toObject(), { reviewGeneration });
    console.info(`${LOG_PREFIX} Review cycle launched`, {
      cycleId: id,
      launchedAt: cycle.launchedAt,
    });

    return result;
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
