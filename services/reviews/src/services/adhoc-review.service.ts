import { AdhocReview, type AdhocReviewDocument } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';

// Import stub models to ensure they're registered before population
import '@reviews/models/employee.model.js';
import '@reviews/models/user.model.js';
import '@reviews/models/department.model.js';

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

// Response DTO for list endpoint
export interface EmployeeRef {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  department?: {
    id: string;
    name: string;
  };
}

export interface ManagerRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ReviewFormRef {
  id: string;
  name: string;
}

export interface AdhocReviewListItem {
  id: string;
  employee: EmployeeRef;
  manager?: ManagerRef;
  triggeredBy: UserRef;
  reviewForm?: ReviewFormRef;
  reason?: string;
  status: string;
  dueDate?: Date;
  triggeredAt: Date;
  selfReviewStatus?: 'pending' | 'in_progress' | 'submitted' | null;
  managerReviewStatus?: 'pending' | 'in_progress' | 'submitted' | null;
  settings?: {
    selfReviewRequired?: boolean;
    managerReviewRequired?: boolean;
    includeGoals?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class AdhocReviewService {
  async listAdhocReviews(
    filters: AdhocReviewFilters,
    pagination: Pagination
  ): Promise<{ reviews: AdhocReviewListItem[]; total: number }> {
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
        .populate({
          path: 'employeeId',
          select: 'firstName lastName jobTitle department',
          populate: {
            path: 'department',
            select: 'name',
          },
        })
        .populate('managerId', 'firstName lastName')
        .populate('triggeredBy', 'firstName lastName')
        .populate('reviewFormId', 'name')
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      AdhocReview.countDocuments(query),
    ]);

    // Transform reviews to AdhocReviewListItem[]
    const transformedReviews: AdhocReviewListItem[] = reviews.map(review => {
      const employee = review.employeeId as any;
      const manager = review.managerId as any;
      const triggeredBy = review.triggeredBy as any;
      const reviewForm = review.reviewFormId as any;

      // Handle case where employee might not be populated or doesn't exist
      const employeeData: EmployeeRef = employee && typeof employee === 'object' ? {
        id: employee._id?.toString() ?? employee.toString(),
        firstName: employee.firstName ?? 'Unknown',
        lastName: employee.lastName ?? 'User',
        jobTitle: employee.jobTitle,
        department: employee.department && typeof employee.department === 'object' ? {
          id: employee.department._id?.toString() ?? employee.department.toString(),
          name: employee.department.name ?? 'Unknown Department',
        } : undefined,
      } : {
        id: typeof employee === 'string' ? employee : review.employeeId?.toString() ?? '',
        firstName: 'Unknown',
        lastName: 'User',
      };

      const triggeredByData: UserRef = triggeredBy && typeof triggeredBy === 'object' ? {
        id: triggeredBy._id?.toString() ?? triggeredBy.toString(),
        firstName: triggeredBy.firstName ?? 'Unknown',
        lastName: triggeredBy.lastName ?? 'User',
      } : {
        id: typeof triggeredBy === 'string' ? triggeredBy : review.triggeredBy?.toString() ?? '',
        firstName: 'Unknown',
        lastName: 'User',
      };

      return {
        id: review._id.toString(),
        employee: employeeData,
        manager: manager && typeof manager === 'object' ? {
          id: manager._id?.toString() ?? manager.toString(),
          firstName: manager.firstName ?? 'Unknown',
          lastName: manager.lastName ?? 'Manager',
        } : undefined,
        triggeredBy: triggeredByData,
        reviewForm: reviewForm && typeof reviewForm === 'object' ? {
          id: reviewForm._id?.toString() ?? reviewForm.toString(),
          name: reviewForm.name ?? 'Unknown Form',
        } : undefined,
        reason: review.reason,
        status: review.status,
        dueDate: review.dueDate,
        triggeredAt: review.createdAt,
        selfReviewStatus: review.selfReview?.status ?? null,
        managerReviewStatus: review.managerReview?.status ?? null,
        settings: review.settings,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    console.info(`${LOG_PREFIX} Ad-hoc reviews listed`, { count: reviews.length, total });
    return { reviews: transformedReviews, total };
  }

  async getAdhocReviewById(id: string): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Getting ad-hoc review by ID`, { reviewId: id });

    const review = await AdhocReview.findById(id)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName jobTitle department',
        populate: {
          path: 'department',
          select: 'name',
        },
      })
      .populate('managerId', 'firstName lastName')
      .populate('triggeredBy', 'firstName lastName')
      .populate('reviewFormId', 'name');

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

  async acknowledgeAdhocReview(id: string, comments?: string): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Acknowledging ad-hoc review`, { reviewId: id, hasComments: !!comments });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    if (review.status !== 'pending_acknowledgment') {
      console.warn(`${LOG_PREFIX} Review is not pending acknowledgment`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', 'Review is not pending acknowledgment', 409);
    }

    review.status = 'acknowledged';
    review.acknowledgedAt = new Date();
    if (comments) {
      review.acknowledgmentComments = comments;
      review.employeeComments = comments;
    }
    await review.save();

    console.info(`${LOG_PREFIX} Ad-hoc review acknowledged`, { reviewId: id, acknowledgedAt: review.acknowledgedAt });
    return review;
  }

  /**
   * Submit self-review for an adhoc review.
   * Only the assigned employee should call this.
   */
  async submitSelfReview(
    id: string,
    answers: { questionId: string; value: string | number | boolean | string[] }[],
    submissionStatus: 'submitted' | 'in_progress',
  ): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Submitting self-review`, { reviewId: id, answerCount: answers.length, submissionStatus });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    const invalidStatuses = ['completed', 'cancelled', 'acknowledged', 'pending_acknowledgment'];
    if (invalidStatuses.includes(review.status)) {
      console.warn(`${LOG_PREFIX} Cannot submit self-review in current status`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', `Cannot submit self-review when review is ${review.status}`, 409);
    }

    review.selfReview = {
      status: submissionStatus,
      submittedAt: submissionStatus === 'submitted' ? new Date() : undefined,
      answers: answers.map(answer => ({
        questionId: new Types.ObjectId(answer.questionId),
        value: answer.value,
      })),
    };

    if (submissionStatus === 'submitted') {
      review.status = this.computeNextStatus(review, 'self');
    } else {
      review.status = 'self_review_pending';
    }

    await review.save();

    console.info(`${LOG_PREFIX} Self-review submitted`, { reviewId: id, newStatus: review.status });
    return review;
  }

  /**
   * Submit manager review for an adhoc review.
   * Only the assigned manager should call this.
   */
  async submitManagerReview(
    id: string,
    answers: { questionId: string; value: string | number | boolean | string[] }[],
    submissionStatus: 'submitted' | 'in_progress',
  ): Promise<AdhocReviewDocument> {
    console.info(`${LOG_PREFIX} Submitting manager review`, { reviewId: id, answerCount: answers.length, submissionStatus });

    const review = await AdhocReview.findById(id);

    if (!review) {
      console.warn(`${LOG_PREFIX} Ad-hoc review not found`, { reviewId: id });
      throw new AppError('NOT_FOUND', 'Ad-hoc review not found', 404);
    }

    const invalidStatuses = ['completed', 'cancelled', 'acknowledged', 'pending_acknowledgment'];
    if (invalidStatuses.includes(review.status)) {
      console.warn(`${LOG_PREFIX} Cannot submit manager review in current status`, { reviewId: id, status: review.status });
      throw new AppError('CONFLICT', `Cannot submit manager review when review is ${review.status}`, 409);
    }

    review.managerReview = {
      status: submissionStatus,
      submittedAt: submissionStatus === 'submitted' ? new Date() : undefined,
      answers: answers.map(answer => ({
        questionId: new Types.ObjectId(answer.questionId),
        value: answer.value,
      })),
    };

    if (submissionStatus === 'submitted') {
      review.status = this.computeNextStatus(review, 'manager');
    } else {
      review.status = 'manager_review_pending';
    }

    await review.save();

    console.info(`${LOG_PREFIX} Manager review submitted`, { reviewId: id, newStatus: review.status });
    return review;
  }

  /**
   * Compute the next status based on which reviews are required and submitted.
   */
  private computeNextStatus(
    review: AdhocReviewDocument,
    justSubmitted: 'self' | 'manager',
  ): AdhocReviewDocument['status'] {
    const selfRequired = review.settings?.selfReviewRequired ?? true;
    const managerRequired = review.settings?.managerReviewRequired ?? true;

    const selfDone = review.selfReview?.status === 'submitted' || justSubmitted === 'self';
    const managerDone = review.managerReview?.status === 'submitted' || justSubmitted === 'manager';

    if (selfRequired && !selfDone) return 'self_review_pending';
    if (managerRequired && !managerDone) return 'manager_review_pending';

    // All required reviews are done
    return 'pending_acknowledgment';
  }
}

export const adhocReviewService = new AdhocReviewService();
