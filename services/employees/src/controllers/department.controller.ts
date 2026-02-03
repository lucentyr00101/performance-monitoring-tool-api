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

const LOG_PREFIX = '[DepartmentController]';

export class DepartmentController {
  /**
   * GET /departments
   */
  async list(c: Context) {
    console.info(`${LOG_PREFIX} GET /departments`);
    
    const query = c.req.query();
    const parsed = departmentQuerySchema.safeParse(query);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`);
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Invalid query parameters',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const departments = await departmentService.listDepartments(parsed.data);

    console.info(`${LOG_PREFIX} List response sent`, { count: departments.length });
    
    return c.json(successResponse(
      departments,
      { total_departments: departments.length }
    ), 200);
  }

  /**
   * GET /departments/hierarchy
   */
  async getHierarchy(c: Context) {
    console.info(`${LOG_PREFIX} GET /departments/hierarchy`);
    
    const hierarchy = await departmentService.getDepartmentHierarchy();
    
    console.info(`${LOG_PREFIX} Hierarchy response sent`, { rootCount: hierarchy.length });
    
    return c.json(successResponse(hierarchy), 200);
  }

  /**
   * GET /departments/:id
   */
  async getById(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /departments/${id}`);
    
    const department = await departmentService.getDepartmentById(id);
    
    console.info(`${LOG_PREFIX} GetById response sent`, { departmentId: id });
    
    return c.json(successResponse(department), 200);
  }

  /**
   * POST /departments
   */
  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /departments`);
    
    const body = await c.req.json();
    const parsed = createDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`);
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

    console.info(`${LOG_PREFIX} Create response sent`, { departmentId: department._id.toString() });
    
    return c.json(successResponse(department), 201);
  }

  /**
   * PUT /departments/:id
   */
  async update(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /departments/${id}`);
    
    const body = await c.req.json();
    const parsed = updateDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Update validation failed`, { departmentId: id });
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
    
    console.info(`${LOG_PREFIX} Update response sent`, { departmentId: id });
    
    return c.json(successResponse(department), 200);
  }

  /**
   * DELETE /departments/:id
   */
  async delete(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} DELETE /departments/${id}`);
    
    await departmentService.deleteDepartment(id);
    
    console.info(`${LOG_PREFIX} Delete response sent`, { departmentId: id });
    
    return c.json(successResponse({ message: 'Department deleted successfully' }), 200);
  }

  /**
   * GET /departments/:id/employees
   */
  async getEmployees(c: Context) {
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} GET /departments/${id}/employees`);
    
    const query = c.req.query();
    const parsed = employeeQuerySchema.safeParse(query);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} GetEmployees validation failed`, { departmentId: id });
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

    console.info(`${LOG_PREFIX} GetEmployees response sent`, { departmentId: id, employeeCount: total });
    
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
