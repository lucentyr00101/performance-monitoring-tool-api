import { Employee, type EmployeeDocument } from '@employees/models/index.js';
import { AppError, parsePagination, type PaginationQuery } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';
import type { employeeQuerySchema } from '@pmt/shared';

const LOG_PREFIX = '[EmployeeService]';

export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  departmentId?: string;
  managerId?: string | null;
  hireDate?: Date;
  employmentType?: 'full-time' | 'part-time' | 'contract';
  avatarUrl?: string;
  createUserAccount?: boolean;
  userRole?: string;
}

export interface UpdateEmployeeDTO extends Partial<Omit<CreateEmployeeDTO, 'createUserAccount' | 'userRole'>> {
  status?: 'active' | 'inactive' | 'terminated';
}

type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>;

export class EmployeeService {
  /**
   * List employees with pagination and filtering
   */
  async listEmployees(
    params: EmployeeQueryParams
  ): Promise<{ employees: EmployeeDocument[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Listing employees`, { 
      page: params.page, 
      status: params.status, 
      departmentId: params.department_id,
      search: params.search 
    });
    
    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    const query: FilterQuery<EmployeeDocument> = {};

    if (params.status) {
      query.status = params.status;
    }
    if (params.department_id) {
      query.departmentId = params.department_id;
    }
    if (params.manager_id) {
      query.managerId = params.manager_id;
    }
    if (params.search) {
      query.$or = [
        { firstName: { $regex: params.search, $options: 'i' } },
        { lastName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
      ];
    }

    // Map snake_case sort field to camelCase model field
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
    };
    
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Special handling for department sorting (needs aggregation)
    if (sortBy === 'department') {
      const pipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: 'departments',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'department',
          },
        },
        {
          $lookup: {
            from: 'employees',
            localField: 'managerId',
            foreignField: '_id',
            as: 'manager',
          },
        },
        {
          $addFields: {
            departmentName: { $arrayElemAt: ['$department.name', 0] },
          },
        },
        { $sort: { departmentName: sortDirection } },
        { $skip: skip },
        { $limit: perPage },
        {
          $project: {
            department: 0,
            manager: 0,
            departmentName: 0,
          },
        },
      ];

      const [employees, countResult] = await Promise.all([
        Employee.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
        Employee.countDocuments(query),
      ]);

      // Manually populate after aggregation
      await Employee.populate(employees, [
        { path: 'departmentId', select: 'name' },
        { path: 'managerId', select: 'firstName lastName' },
      ]);

      console.info(`${LOG_PREFIX} Listed employees`, { total: countResult, page, perPage });
      
      return {
        employees: employees as EmployeeDocument[],
        total: countResult,
        pagination: { page, perPage, skip, sortBy: 'department', sortOrder },
      };
    }

    // Standard sorting for other fields
    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('departmentId', 'name')
        .populate('managerId', 'firstName lastName')
        .sort({ [sortField]: sortDirection })
        .collation({ locale: 'en', strength: 2 }) // Case-insensitive sorting
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments(query),
    ]);

    console.info(`${LOG_PREFIX} Listed employees`, { total, page, perPage });
    
    return {
      employees,
      total,
      pagination: { page, perPage, skip, sortBy: sortField, sortOrder },
    };
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<EmployeeDocument> {
    console.info(`${LOG_PREFIX} Getting employee by ID`, { employeeId: id });
    
    const employee = await Employee.findById(id)
      .populate('departmentId', 'name')
      .populate('managerId', 'firstName lastName jobTitle email');

    if (!employee) {
      console.warn(`${LOG_PREFIX} Employee not found`, { employeeId: id });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    console.info(`${LOG_PREFIX} Employee retrieved`, { 
      employeeId: id, 
      email: employee.email 
    });
    
    return employee;
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeDTO): Promise<EmployeeDocument> {
    console.info(`${LOG_PREFIX} Creating employee`, { 
      email: data.email, 
      firstName: data.firstName, 
      lastName: data.lastName 
    });
    
    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existingEmployee) {
      console.warn(`${LOG_PREFIX} Employee creation failed - email exists`, { email: data.email });
      throw new AppError('CONFLICT', 'Employee with this email already exists', 409);
    }

    const employee = await Employee.create({
      ...data,
      email: data.email.toLowerCase(),
    });

    console.info(`${LOG_PREFIX} Employee created successfully`, { 
      employeeId: employee._id.toString(), 
      email: employee.email 
    });
    
    return employee.populate([
      { path: 'departmentId', select: 'name' },
      { path: 'managerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Update an employee
   */
  async updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<EmployeeDocument> {
    console.info(`${LOG_PREFIX} Updating employee`, { employeeId: id, fields: Object.keys(data) });
    
    const employee = await Employee.findById(id);

    if (!employee) {
      console.warn(`${LOG_PREFIX} Update failed - employee not found`, { employeeId: id });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email.toLowerCase() !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmployee) {
        console.warn(`${LOG_PREFIX} Update failed - email exists`, { 
          employeeId: id, 
          email: data.email 
        });
        throw new AppError('CONFLICT', 'Employee with this email already exists', 409);
      }
      data.email = data.email.toLowerCase();
    }

    Object.assign(employee, data);
    await employee.save();

    console.info(`${LOG_PREFIX} Employee updated successfully`, { employeeId: id });
    
    return employee.populate([
      { path: 'departmentId', select: 'name' },
      { path: 'managerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Delete an employee (soft delete by setting status to terminated)
   */
  async deleteEmployee(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Deleting employee (soft)`, { employeeId: id });
    
    const employee = await Employee.findById(id);

    if (!employee) {
      console.warn(`${LOG_PREFIX} Delete failed - employee not found`, { employeeId: id });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    employee.status = 'terminated';
    await employee.save();
    
    console.info(`${LOG_PREFIX} Employee deleted successfully`, { 
      employeeId: id, 
      email: employee.email 
    });
  }

  /**
   * Get employee's team (direct reports)
   */
  async getEmployeeTeam(
    managerId: string,
    params: EmployeeQueryParams
  ): Promise<{ employees: EmployeeDocument[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Getting employee team`, { managerId });
    
    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    // Verify manager exists
    const manager = await Employee.findById(managerId);
    if (!manager) {
      console.warn(`${LOG_PREFIX} Get team failed - manager not found`, { managerId });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    // Map snake_case sort field to camelCase model field
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
    };
    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find({ managerId, status: { $ne: 'terminated' } })
        .populate('departmentId', 'name')
        .sort({ [sortField]: sortDirection })
        .collation({ locale: 'en', strength: 2 }) // Case-insensitive sorting
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments({ managerId, status: { $ne: 'terminated' } }),
    ]);

    console.info(`${LOG_PREFIX} Team retrieved`, { managerId, teamSize: total });
    
    return {
      employees,
      total,
      pagination: { page, perPage, skip, sortBy: sortField, sortOrder },
    };
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(
    departmentId: string,
    params: EmployeeQueryParams
  ): Promise<{ employees: EmployeeDocument[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Getting employees by department`, { departmentId });
    
    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    // Map snake_case sort field to camelCase model field
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
    };
    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find({ departmentId, status: { $ne: 'terminated' } })
        .populate('managerId', 'firstName lastName')
        .sort({ [sortField]: sortDirection })
        .collation({ locale: 'en', strength: 2 }) // Case-insensitive sorting
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments({ departmentId, status: { $ne: 'terminated' } }),
    ]);

    console.info(`${LOG_PREFIX} Department employees retrieved`, { departmentId, total });
    
    return {
      employees,
      total,
      pagination: { page, perPage, skip, sortBy: sortField, sortOrder },
    };
  }
}

export const employeeService = new EmployeeService();
