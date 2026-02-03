import { Employee, type EmployeeDocument } from '@employees/models/index.js';
import { AppError, parsePagination, type PaginationQuery } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';
import type { employeeQuerySchema } from '@pmt/shared';

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

    const sortField = sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('departmentId', 'name')
        .populate('managerId', 'firstName lastName')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments(query),
    ]);

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
    const employee = await Employee.findById(id)
      .populate('departmentId', 'name')
      .populate('managerId', 'firstName lastName jobTitle email');

    if (!employee) {
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    return employee;
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeDTO): Promise<EmployeeDocument> {
    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existingEmployee) {
      throw new AppError('CONFLICT', 'Employee with this email already exists', 409);
    }

    const employee = await Employee.create({
      ...data,
      email: data.email.toLowerCase(),
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
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email.toLowerCase() !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmployee) {
        throw new AppError('CONFLICT', 'Employee with this email already exists', 409);
      }
      data.email = data.email.toLowerCase();
    }

    Object.assign(employee, data);
    await employee.save();

    return employee.populate([
      { path: 'departmentId', select: 'name' },
      { path: 'managerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Delete an employee (soft delete by setting status to terminated)
   */
  async deleteEmployee(id: string): Promise<void> {
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    employee.status = 'terminated';
    await employee.save();
  }

  /**
   * Get employee's team (direct reports)
   */
  async getEmployeeTeam(
    managerId: string,
    params: EmployeeQueryParams
  ): Promise<{ employees: EmployeeDocument[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    // Verify manager exists
    const manager = await Employee.findById(managerId);
    if (!manager) {
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    const sortField = sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find({ managerId, status: { $ne: 'terminated' } })
        .populate('departmentId', 'name')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments({ managerId, status: { $ne: 'terminated' } }),
    ]);

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
    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    const sortField = sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find({ departmentId, status: { $ne: 'terminated' } })
        .populate('managerId', 'firstName lastName')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(perPage),
      Employee.countDocuments({ departmentId, status: { $ne: 'terminated' } }),
    ]);

    return {
      employees,
      total,
      pagination: { page, perPage, skip, sortBy: sortField, sortOrder },
    };
  }
}

export const employeeService = new EmployeeService();
