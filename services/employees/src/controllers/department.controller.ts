import { Context } from 'hono';
import { departmentService, employeeService } from '@employees/services/index.js';
import {
  successResponse,
  errorResponse,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
  employeeQuerySchema,
} from '@pmt/shared';

export class DepartmentController {
  /**
   * GET /departments
   */
  async list(c: Context) {
    const query = c.req.query();
    const parsed = departmentQuerySchema.safeParse(query);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const departments = await departmentService.listDepartments(parsed.data);

    return c.json(successResponse(
      departments,
      { total_departments: departments.length }
    ), 200);
  }

  /**
   * GET /departments/hierarchy
   */
  async getHierarchy(c: Context) {
    const hierarchy = await departmentService.getDepartmentHierarchy();
    return c.json(successResponse(hierarchy), 200);
  }

  /**
   * GET /departments/:id
   */
  async getById(c: Context) {
    const id = c.req.param('id');
    const department = await departmentService.getDepartmentById(id);
    return c.json(successResponse(department), 200);
  }

  /**
   * POST /departments
   */
  async create(c: Context) {
    const body = await c.req.json();
    const parsed = createDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const department = await departmentService.createDepartment({
      name: parsed.data.name,
      description: parsed.data.description,
      parentId: parsed.data.parent_id,
      managerId: parsed.data.manager_id,
    });

    return c.json(successResponse(department), 201);
  }

  /**
   * PUT /departments/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateDepartmentSchema.safeParse(body);

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
    if (parsed.data.parent_id !== undefined) updateData.parentId = parsed.data.parent_id;
    if (parsed.data.manager_id !== undefined) updateData.managerId = parsed.data.manager_id;
    if (parsed.data.status) updateData.status = parsed.data.status;

    const department = await departmentService.updateDepartment(id, updateData);
    return c.json(successResponse(department), 200);
  }

  /**
   * DELETE /departments/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    await departmentService.deleteDepartment(id);
    return c.json(successResponse({ message: 'Department deleted successfully' }), 200);
  }

  /**
   * GET /departments/:id/employees
   */
  async getEmployees(c: Context) {
    const id = c.req.param('id');
    const query = c.req.query();
    const parsed = employeeQuerySchema.safeParse(query);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    // Verify department exists
    await departmentService.getDepartmentById(id);

    const { employees, total, pagination } = await employeeService.getEmployeesByDepartment(id, parsed.data);

    return c.json(successResponse(
      employees,
      {
        pagination: {
          page: pagination.page,
          per_page: pagination.perPage,
          total_items: total,
          total_pages: Math.ceil(total / pagination.perPage),
        },
      }
    ), 200);
  }
}

export const departmentController = new DepartmentController();
