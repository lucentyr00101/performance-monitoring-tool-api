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

export class ReviewFormController {
  async list(c: Context) {
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
    const form = await reviewFormService.getReviewFormById(id);
    return c.json(successResponse(form), 200);
  }

  async create(c: Context) {
    const body = await c.req.json();
    const parsed = createReviewFormSchema.safeParse(body);

    if (!parsed.success) {
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

    return c.json(successResponse(form), 201);
  }

  async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateReviewFormSchema.safeParse(body);

    if (!parsed.success) {
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
    return c.json(successResponse(form), 200);
  }

  async delete(c: Context) {
    const id = c.req.param('id');
    await reviewFormService.deleteReviewForm(id);
    return c.json(successResponse({ message: 'Review form deleted successfully' }), 200);
  }

  async publish(c: Context) {
    const id = c.req.param('id');
    const form = await reviewFormService.publishReviewForm(id);
    return c.json(successResponse(form), 200);
  }

  async archive(c: Context) {
    const id = c.req.param('id');
    const form = await reviewFormService.archiveReviewForm(id);
    return c.json(successResponse(form), 200);
  }

  async clone(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = cloneFormSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(errorResponse('VALIDATION_ERROR', 'Name is required for cloning'), 422);
    }

    const form = await reviewFormService.cloneReviewForm(id, parsed.data.name);
    return c.json(successResponse(form), 201);
  }

  async assignDepartments(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = assignDepartmentsSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const form = await reviewFormService.assignDepartments(id, parsed.data.departments);
    return c.json(successResponse(form), 200);
  }

  async getVersions(c: Context) {
    const id = c.req.param('id');
    const versions = await reviewFormService.getFormVersions(id);
    return c.json(successResponse(versions), 200);
  }
}

export const reviewFormController = new ReviewFormController();
