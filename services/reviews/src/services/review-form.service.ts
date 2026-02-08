import { ReviewForm, type ReviewFormDocument } from '@reviews/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';

const LOG_PREFIX = '[ReviewFormService]';

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
    console.info(`${LOG_PREFIX} Listing review forms`, { filters, page: pagination.page, perPage: pagination.perPage });

    const query: FilterQuery<ReviewFormDocument> = {};

    if (filters.status) query.status = filters.status;
    if (typeof filters.isDefault === 'boolean') query.isDefault = filters.isDefault;

    const sortField = pagination.sortBy || 'name';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [forms, total] = await Promise.all([
      ReviewForm.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage)
        .lean(),
      ReviewForm.countDocuments(query),
    ]);

    // Transform forms to exclude questions but include counts
    const transformedForms = forms.map((form: any) => {
      const sectionsCount = form.sections?.length || 0;
      const questionsCount = form.sections?.reduce((total: number, section: any) => {
        return total + (section.questions?.length || 0);
      }, 0) || 0;

      // Remove questions from sections for list response
      const sectionsWithoutQuestions = form.sections?.map((section: any) => {
        const { questions, ...sectionWithoutQuestions } = section;
        return sectionWithoutQuestions;
      });

      return {
        ...form,
        sections: sectionsWithoutQuestions,
        sectionsCount,
        questionsCount,
        id: form._id.toString(),
        _id: undefined,
        __v: undefined,
      };
    });

    console.info(`${LOG_PREFIX} Review forms listed`, { count: forms.length, total });
    return { forms: transformedForms as any, total };
  }

  async getReviewFormById(id: string): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Getting review form by ID`, { formId: id });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    console.info(`${LOG_PREFIX} Review form retrieved`, { formId: id, name: form.name, status: form.status });
    return form;
  }

  async createReviewForm(data: CreateReviewFormDTO): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Creating review form`, { name: data.name, sectionsCount: data.sections?.length });

    const existingForm = await ReviewForm.findOne({ name: data.name });
    if (existingForm) {
      console.warn(`${LOG_PREFIX} Review form with this name already exists`, { name: data.name });
      throw new AppError('CONFLICT', 'Review form with this name already exists', 409);
    }

    const form = await ReviewForm.create({
      ...data,
      status: 'draft',
      version: 1,
    });

    console.info(`${LOG_PREFIX} Review form created`, { formId: form._id, name: form.name });
    return form;
  }

  async updateReviewForm(id: string, data: Record<string, unknown>): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Updating review form`, { formId: id, updateFields: Object.keys(data) });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status === 'archived') {
      console.warn(`${LOG_PREFIX} Cannot update archived form`, { formId: id, status: form.status });
      throw new AppError('CONFLICT', 'Cannot update an archived form', 409);
    }

    if (form.status === 'published' && (data.sections || data.name)) {
      console.warn(`${LOG_PREFIX} Cannot modify sections of a published form`, { formId: id, status: form.status });
      throw new AppError('CONFLICT', 'Cannot modify sections of a published form. Clone the form instead.', 409);
    }

    if (data.name && data.name !== form.name) {
      const existingForm = await ReviewForm.findOne({ name: data.name, _id: { $ne: id } });
      if (existingForm) {
        console.warn(`${LOG_PREFIX} Review form with this name already exists`, { name: data.name });
        throw new AppError('CONFLICT', 'Review form with this name already exists', 409);
      }
    }

    Object.assign(form, data);
    await form.save();

    console.info(`${LOG_PREFIX} Review form updated`, { formId: id, name: form.name });
    return form;
  }

  async deleteReviewForm(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Deleting review form`, { formId: id });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status === 'published') {
      console.warn(`${LOG_PREFIX} Cannot delete a published form`, { formId: id, status: form.status });
      throw new AppError('CONFLICT', 'Cannot delete a published form. Archive it instead.', 409);
    }

    await form.deleteOne();
    console.info(`${LOG_PREFIX} Review form deleted`, { formId: id, name: form.name });
  }

  async publishReviewForm(id: string): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Publishing review form`, { formId: id });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status !== 'draft') {
      console.warn(`${LOG_PREFIX} Cannot publish form with invalid status`, { formId: id, status: form.status });
      throw new AppError('CONFLICT', `Cannot publish form with status: ${form.status}`, 409);
    }

    if (!form.sections || form.sections.length === 0) {
      console.warn(`${LOG_PREFIX} Form must have at least one section`, { formId: id, sectionsCount: form.sections?.length });
      throw new AppError('VALIDATION_ERROR', 'Form must have at least one section', 422);
    }

    form.status = 'published';
    form.publishedAt = new Date();
    await form.save();

    console.info(`${LOG_PREFIX} Review form published`, { formId: id, name: form.name, publishedAt: form.publishedAt });
    return form;
  }

  async archiveReviewForm(id: string): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Archiving review form`, { formId: id });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    form.status = 'archived';
    form.archivedAt = new Date();
    await form.save();

    console.info(`${LOG_PREFIX} Review form archived`, { formId: id, name: form.name, archivedAt: form.archivedAt });
    return form;
  }

  async cloneReviewForm(id: string, newName: string): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Cloning review form`, { formId: id, newName });

    const originalForm = await ReviewForm.findById(id);

    if (!originalForm) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    const existingForm = await ReviewForm.findOne({ name: newName });
    if (existingForm) {
      console.warn(`${LOG_PREFIX} Review form with this name already exists`, { name: newName });
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

    console.info(`${LOG_PREFIX} Review form cloned`, { originalFormId: id, clonedFormId: clonedForm._id, newName });
    return clonedForm;
  }

  async assignDepartments(id: string, departments: Array<{ department_id: string; form_type: string; effective_date?: string }>): Promise<ReviewFormDocument> {
    console.info(`${LOG_PREFIX} Assigning departments to review form`, { formId: id, departmentsCount: departments.length });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    if (form.status !== 'published') {
      console.warn(`${LOG_PREFIX} Can only assign departments to published forms`, { formId: id, status: form.status });
      throw new AppError('CONFLICT', 'Can only assign departments to published forms', 409);
    }

    form.departmentAssignments = departments.map(d => ({
      departmentId: d.department_id,
      formType: d.form_type,
      effectiveDate: d.effective_date ? new Date(d.effective_date) : undefined,
    }));
    await form.save();

    console.info(`${LOG_PREFIX} Departments assigned to review form`, { formId: id, assignmentsCount: form.departmentAssignments.length });
    return form;
  }

  async getFormVersions(id: string): Promise<ReviewFormDocument[]> {
    console.info(`${LOG_PREFIX} Getting form versions`, { formId: id });

    const form = await ReviewForm.findById(id);

    if (!form) {
      console.warn(`${LOG_PREFIX} Review form not found`, { formId: id });
      throw new AppError('NOT_FOUND', 'Review form not found', 404);
    }

    const parentId = form.parentFormId || form._id;
    const versions = await ReviewForm.find({
      $or: [
        { _id: parentId },
        { parentFormId: parentId },
      ],
    }).sort({ version: -1 });

    console.info(`${LOG_PREFIX} Form versions retrieved`, { formId: id, versionsCount: versions.length });
    return versions;
  }
}

export const reviewFormService = new ReviewFormService();
