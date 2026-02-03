import { Context } from 'hono';
import { employeeService } from '@employees/services/index.js';
import {
  successResponse,
  errorResponse,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
} from '@pmt/shared';

const LOG_PREFIX = '[EmployeeController]';

export class EmployeeController {
  /**
   * GET /employees
   */
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /employees`);
    
    const query = c.req.query();
    const parsed = employeeQuerySchema.safeParse(query);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`);
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const { employees, total, pagination } = await employeeService.listEmployees(parsed.data);

    console.info(`${LOG_PREFIX} List response sent`, { total });
    
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
    console.info(`${LOG_PREFIX} GET /employees/${id}`);
    
    const employee = await employeeService.getEmployeeById(id);
    
    console.info(`${LOG_PREFIX} GetById response sent`, { employeeId: id });
    
    return c.json(successResponse(employee), 200);
  }

  /**
   * POST /employees
   */
  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /employees`);
    
    const body = await c.req.json();
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`);
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

    console.info(`${LOG_PREFIX} Create response sent`, { employeeId: employee._id.toString() });
    
    return c.json(successResponse(employee), 201);
  }

  /**
   * PUT /employees/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /employees/${id}`);
    
    const body = await c.req.json();
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Update validation failed`, { employeeId: id });
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
    
    console.info(`${LOG_PREFIX} Update response sent`, { employeeId: id });
    
    return c.json(successResponse(employee), 200);
  }

  /**
   * DELETE /employees/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /employees/${id}`);
    
    await employeeService.deleteEmployee(id);
    
    console.info(`${LOG_PREFIX} Delete response sent`, { employeeId: id });
    
    return c.json(successResponse({ message: 'Employee deleted successfully' }), 200);
  }

  /**
   * GET /employees/:id/team
   */
  async getTeam(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /employees/${id}/team`);
    
    const query = c.req.query();
    const parsed = employeeQuerySchema.safeParse(query);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} GetTeam validation failed`, { managerId: id });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const { employees, total, pagination } = await employeeService.getEmployeeTeam(id, parsed.data);

    console.info(`${LOG_PREFIX} GetTeam response sent`, { managerId: id, teamSize: total });
    
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
