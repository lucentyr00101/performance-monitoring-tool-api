import { ReviewForm, type ReviewFormDocument } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

export interface CreateReviewFormDTO {
  name: string;
  description?: string;
  instructions?: string;
  sections: Array<{
    title: string;
    description?: string;
    order?: number;
    collapsible?: boolean;
    forReviewer?: 'self' | 'manager' | 'both';
    questions: Array<{
      text: string;
      helpText?: string;
      type: string;
      required?: boolean;
      forReviewer?: 'self' | 'manager' | 'both';
      weight?: number;
      config?: Record<string, unknown>;
    }>;
  }>;
  settings?: {
    rating_scale?: {
      min?: number;
      max?: number;
    };
  };
  createdBy?: string;
}

export interface ReviewFormFilters {
  status?: string;
  isDefault?: boolean;
}

export interface Pagination {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

export class ReviewFormService {
  async listReviewForms(
    filters: ReviewFormFilters,
    pagination: Pagination
  ): Promise<{ forms: ReviewFormDocument[]; total: number }> {
    const query: FilterQuery<ReviewFormDocument> = {};

    if (filters.status) query.status = filters.status;
    if (typeof filters.isDefault === 'boolean') query.isDefault = filters.isDefault;

    const sortField = pagination.sortBy || 'name';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [forms, total] = await Promise.all([
      ReviewForm.find(query)
        .select('-sections.questions')
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      ReviewForm.countDocuments(query),
    ]);

    return { forms, total };
  }

  async getReviewFormById(id: string): Promise<ReviewFormDocument> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    return form;
  }

  async createReviewForm(data: CreateReviewFormDTO): Promise<ReviewFormDocument> {
    const existingForm = await ReviewForm.findOne({ name: data.name });
    if (existingForm) {
      throw new AppError('CONFLICT', 'Review form with this name already exists', 409);
    }

    const form = await ReviewForm.create({
      ...data,
      status: 'draft',
      version: 1,
    });

    return form;
  }

  async updateReviewForm(id: string, data: Record<string, unknown>): Promise<ReviewFormDocument> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status === 'archived') {
      throw new AppError('CONFLICT', 'Cannot update an archived form', 409);
    }

    if (form.status === 'published' && (data.sections || data.name)) {
      throw new AppError('CONFLICT', 'Cannot modify sections of a published form. Clone the form instead.', 409);
    }

    if (data.name && data.name !== form.name) {
      const existingForm = await ReviewForm.findOne({ name: data.name, _id: { $ne: id } });
      if (existingForm) {
        throw new AppError('CONFLICT', 'Review form with this name already exists', 409);
      }
    }

    Object.assign(form, data);
    await form.save();
    return form;
  }

  async deleteReviewForm(id: string): Promise<void> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status === 'published') {
      throw new AppError('CONFLICT', 'Cannot delete a published form. Archive it instead.', 409);
    }

    await form.deleteOne();
  }

  async publishReviewForm(id: string): Promise<ReviewFormDocument> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status !== 'draft') {
      throw new AppError('CONFLICT', `Cannot publish form with status: ${form.status}`, 409);
    }

    if (!form.sections || form.sections.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Form must have at least one section', 422);
    }

    form.status = 'published';
    form.publishedAt = new Date();
    await form.save();
    return form;
  }

  async archiveReviewForm(id: string): Promise<ReviewFormDocument> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    form.status = 'archived';
    form.archivedAt = new Date();
    await form.save();
    return form;
  }

  async cloneReviewForm(id: string, newName: string): Promise<ReviewFormDocument> {
    const originalForm = await ReviewForm.findById(id);

    if (!originalForm) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    const existingForm = await ReviewForm.findOne({ name: newName });
    if (existingForm) {
      throw new AppError('CONFLICT', 'Review form with this name already exists', 409);
    }

    const clonedForm = await ReviewForm.create({
      name: newName,
      description: originalForm.description,
      instructions: originalForm.instructions,
      sections: originalForm.sections,
      settings: originalForm.settings,
      isDefault: false,
      parentFormId: originalForm._id,
      status: 'draft',
      version: 1,
    });

    return clonedForm;
  }

  async assignDepartments(id: string, departments: Array<{ department_id: string; form_type: string; effective_date?: string }>): Promise<ReviewFormDocument> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status !== 'published') {
      throw new AppError('CONFLICT', 'Can only assign departments to published forms', 409);
    }

    form.departmentAssignments = departments.map(d => ({
      departmentId: d.department_id,
      formType: d.form_type,
      effectiveDate: d.effective_date ? new Date(d.effective_date) : undefined,
    }));
    await form.save();
    return form;
  }

  async getFormVersions(id: string): Promise<ReviewFormDocument[]> {
    const form = await ReviewForm.findById(id);

    if (!form) {
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    const parentId = form.parentFormId || form._id;
    const versions = await ReviewForm.find({
      $or: [
        { _id: parentId },
        { parentFormId: parentId },
      ],
    }).sort({ version: -1 });

    return versions;
  }
}

export const reviewFormService = new ReviewFormService();
