import { Context } from 'hono';
import { employeeService } from '@employees/services/index.js';
import {
  successResponse,
  errorResponse,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
} from '@pmt/shared';

export class EmployeeController {
  /**
   * GET /employees
   */
  async list(c: Context) {
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

    const { employees, total, pagination } = await employeeService.listEmployees(parsed.data);

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

  /**
   * GET /employees/:id
   */
  async getById(c: Context) {
    const id = c.req.param('id');
    const employee = await employeeService.getEmployeeById(id);
    return c.json(successResponse(employee), 200);
  }

  /**
   * POST /employees
   */
  async create(c: Context) {
    const body = await c.req.json();
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const employee = await employeeService.createEmployee({
      firstName: parsed.data.first_name,
      lastName: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      jobTitle: parsed.data.job_title,
      departmentId: parsed.data.department_id,
      managerId: parsed.data.manager_id,
      hireDate: parsed.data.hire_date ? new Date(parsed.data.hire_date) : undefined,
      employmentType: parsed.data.employment_type,
      avatarUrl: parsed.data.avatar_url,
      createUserAccount: parsed.data.create_user_account,
      userRole: parsed.data.user_role,
    });

    return c.json(successResponse(employee), 201);
  }

  /**
   * PUT /employees/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (parsed.data.first_name) updateData.firstName = parsed.data.first_name;
    if (parsed.data.last_name) updateData.lastName = parsed.data.last_name;
    if (parsed.data.email) updateData.email = parsed.data.email;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    if (parsed.data.job_title) updateData.jobTitle = parsed.data.job_title;
    if (parsed.data.department_id !== undefined) updateData.departmentId = parsed.data.department_id;
    if (parsed.data.manager_id !== undefined) updateData.managerId = parsed.data.manager_id;
    if (parsed.data.employment_type) updateData.employmentType = parsed.data.employment_type;
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.avatar_url !== undefined) updateData.avatarUrl = parsed.data.avatar_url;

    const employee = await employeeService.updateEmployee(id, updateData);
    return c.json(successResponse(employee), 200);
  }

  /**
   * DELETE /employees/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    await employeeService.deleteEmployee(id);
    return c.json(successResponse({ message: 'Employee deleted successfully' }), 200);
  }

  /**
   * GET /employees/:id/team
   */
  async getTeam(c: Context) {
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

    const { employees, total, pagination } = await employeeService.getEmployeeTeam(id, parsed.data);

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

export const employeeController = new EmployeeController();
