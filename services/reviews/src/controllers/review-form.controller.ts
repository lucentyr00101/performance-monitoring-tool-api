import { Context } from 'hono';
import { reviewFormService } from '@reviews/services/index.js';
import {
  successResponse,
  errorResponse,
  createReviewFormSchema,
  updateReviewFormSchema,
  reviewFormQuerySchema,
  cloneFormSchema,
  assignDepartmentsSchema,
  parsePagination,
} from '@pmt/shared';

const LOG_PREFIX = '[ReviewFormController]';

export class ReviewFormController {
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /review-forms`);
    const query = c.req.query();

    const parsed = reviewFormQuerySchema.safeParse({
      page: query.page,
      per_page: query.per_page,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      status: query.status,
      is_default: query.is_default,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      status: parsed.data.status,
      isDefault: parsed.data.is_default,
    };

    const pagination = parsePagination({
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      sort_by: parsed.data.sort_by,
      sort_order: parsed.data.sort_order,
    });

    const { forms, total } = await reviewFormService.listReviewForms(filters, pagination);

    console.info(`${LOG_PREFIX} List response sent`, { total });
    return c.json(successResponse(forms, {
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
    console.info(`${LOG_PREFIX} GET /review-forms/${id}`);
    const form = await reviewFormService.getReviewFormById(id);
    console.info(`${LOG_PREFIX} GetById response sent`, { formId: id });
    return c.json(successResponse(form), 200);
  }

  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /review-forms`);
    const body = await c.req.json();
    const parsed = createReviewFormSchema.safeParse(body);

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

    const form = await reviewFormService.createReviewForm({
      name: parsed.data.name,
      description: parsed.data.description,
      instructions: parsed.data.instructions,
      sections: parsed.data.sections.map(s => ({
        title: s.title,
        description: s.description,
        order: s.order,
        collapsible: s.collapsible,
        forReviewer: s.for_reviewer,
        questions: s.questions.map(q => ({
          text: q.text,
          helpText: q.help_text,
          type: q.type,
          required: q.required,
          forReviewer: q.for_reviewer,
          weight: q.weight,
          config: q.config,
        })),
      })),
      settings: parsed.data.settings,
      createdBy: user.sub,
    });

    console.info(`${LOG_PREFIX} Create response sent`, { formId: form._id });
    return c.json(successResponse(form), 201);
  }

  async update(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /review-forms/${id}`);
    const body = await c.req.json();
    const parsed = updateReviewFormSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Update validation failed`, { formId: id, errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.instructions !== undefined) updateData.instructions = parsed.data.instructions;
    if (parsed.data.sections) updateData.sections = parsed.data.sections.map(s => ({
      title: s.title,
      description: s.description,
      order: s.order,
      collapsible: s.collapsible,
      forReviewer: s.for_reviewer,
      questions: s.questions.map(q => ({
        text: q.text,
        helpText: q.help_text,
        type: q.type,
        required: q.required,
        forReviewer: q.for_reviewer,
        weight: q.weight,
        config: q.config,
      })),
    }));
    if (parsed.data.settings) updateData.settings = parsed.data.settings;

    const form = await reviewFormService.updateReviewForm(id, updateData);
    console.info(`${LOG_PREFIX} Update response sent`, { formId: id });
    return c.json(successResponse(form), 200);
  }

  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /review-forms/${id}`);
    await reviewFormService.deleteReviewForm(id);
    console.info(`${LOG_PREFIX} Delete response sent`, { formId: id });
    return c.json(successResponse({ message: 'Review form deleted successfully' }), 200);
  }

  async publish(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-forms/${id}/publish`);
    const form = await reviewFormService.publishReviewForm(id);
    console.info(`${LOG_PREFIX} Publish response sent`, { formId: id });
    return c.json(successResponse(form), 200);
  }

  async archive(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-forms/${id}/archive`);
    const form = await reviewFormService.archiveReviewForm(id);
    console.info(`${LOG_PREFIX} Archive response sent`, { formId: id });
    return c.json(successResponse(form), 200);
  }

  async clone(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-forms/${id}/clone`);
    const body = await c.req.json();
    const parsed = cloneFormSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Clone validation failed`, { formId: id });
      return c.json(errorResponse('VALIDATION_ERROR', 'Name is required for cloning'), 422);
    }

    const form = await reviewFormService.cloneReviewForm(id, parsed.data.name);
    console.info(`${LOG_PREFIX} Clone response sent`, { sourceFormId: id, newFormId: form._id });
    return c.json(successResponse(form), 201);
  }

  async assignDepartments(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} POST /review-forms/${id}/departments`);
    const body = await c.req.json();
    const parsed = assignDepartmentsSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} AssignDepartments validation failed`, { formId: id, errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const form = await reviewFormService.assignDepartments(id, parsed.data.departments);
    console.info(`${LOG_PREFIX} AssignDepartments response sent`, { formId: id, departmentCount: parsed.data.departments.length });
    return c.json(successResponse(form), 200);
  }

  async getVersions(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /review-forms/${id}/versions`);
    const versions = await reviewFormService.getFormVersions(id);
    console.info(`${LOG_PREFIX} GetVersions response sent`, { formId: id, versionCount: versions.length });
    return c.json(successResponse(versions), 200);
  }
}

export const reviewFormController = new ReviewFormController();
