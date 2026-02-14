import { Employee, type EmployeeDocument } from '@employees/models/index.js';
import { AppError, parsePagination, type PaginationQuery } from '@pmt/shared';
import mongoose, { type FilterQuery } from 'mongoose';
import type { z } from 'zod';
import type { employeeQuerySchema } from '@pmt/shared';

const LOG_PREFIX = '[EmployeeService]';

export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  rank?: 'junior' | 'mid' | 'senior' | 'manager' | 'lead' | 'ceo';
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
  ): Promise<{ employees: any[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Listing employees`, {
      page: params.page,
      status: params.status,
      departmentId: params.department_id,
      search: params.search
    });

    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    const matchConditions: any = {};

    if (params.status) {
      matchConditions.status = params.status;
    }
    if (params.department_id) {
      matchConditions.departmentId = new mongoose.Types.ObjectId(params.department_id);
    }
    if (params.manager_id) {
      matchConditions.managerId = new mongoose.Types.ObjectId(params.manager_id);
    }
    if (params.rank) {
      matchConditions.rank = params.rank;
    }
    if (params.search) {
      matchConditions.$or = [
        { firstName: { $regex: params.search, $options: 'i' } },
        { lastName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
      ];
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Lookup department
    pipeline.push({
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department'
      }
    });

    pipeline.push({
      $unwind: {
        path: '$department',
        preserveNullAndEmptyArrays: true
      }
    });

    // Lookup manager from department
    pipeline.push({
      $lookup: {
        from: 'employees',
        localField: 'department.managerId',
        foreignField: '_id',
        as: 'manager'
      }
    });

    // Add computed fields
    pipeline.push({
      $addFields: {
        departmentName: '$department.name',
        managerFullName: {
          $cond: {
            if: { $gt: [{ $size: '$manager' }, 0] },
            then: {
              $concat: [
                { $arrayElemAt: ['$manager.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$manager.lastName', 0] }
              ]
            },
            else: null
          }
        }
      }
    });

    // Map snake_case sort field to camelCase or special fields
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'department': 'departmentName',
    };

    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Sort stage
    pipeline.push({ $sort: { [sortField]: sortDirection } });

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: perPage });

    // Project out temporary fields
    pipeline.push({
      $project: {
        department: 0,
        manager: 0
      }
    });

    // Execute aggregation and count in parallel
    const [employees, total] = await Promise.all([
      Employee.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      Employee.countDocuments(matchConditions),
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
  async getEmployeeById(id: string): Promise<any> {
    console.info(`${LOG_PREFIX} Getting employee by ID`, { employeeId: id });

    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'department.managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $addFields: {
          managerFullName: {
            $cond: {
              if: { $gt: [{ $size: '$manager' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$manager.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$manager.lastName', 0] }
                ]
              },
              else: null
            }
          },
          departmentName: '$department.name'
        }
      },
      {
        $project: {
          department: 0,
          manager: 0
        }
      }
    ];

    const result = await Employee.aggregate(pipeline);

    if (!result || result.length === 0) {
      console.warn(`${LOG_PREFIX} Employee not found`, { employeeId: id });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    const employee = result[0];

    console.info(`${LOG_PREFIX} Employee retrieved`, {
      employeeId: id,
      email: employee.email,
      managerFullName: employee.managerFullName
    });

    return employee;
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeDTO): Promise<any> {
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

    // Fetch with aggregation to get departmentName and managerFullName
    return this.getEmployeeById(employee._id.toString());
  }

  /**
   * Update an employee
   */
  async updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<any> {
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

    // Fetch with aggregation to get departmentName and managerFullName
    return this.getEmployeeById(id);
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
  ): Promise<{ employees: any[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Getting employee team`, { managerId });

    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    // Verify manager exists
    const manager = await Employee.findById(managerId);
    if (!manager) {
      console.warn(`${LOG_PREFIX} Get team failed - manager not found`, { managerId });
      throw new AppError('NOT_FOUND', 'Employee not found', 404);
    }

    const matchConditions: any = {
      managerId: new mongoose.Types.ObjectId(managerId),
      status: { $ne: 'terminated' }
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'department.managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $addFields: {
          departmentName: '$department.name',
          managerFullName: {
            $cond: {
              if: { $gt: [{ $size: '$manager' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$manager.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$manager.lastName', 0] }
                ]
              },
              else: null
            }
          }
        }
      }
    ];

    // Map snake_case sort field to camelCase model field
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'department': 'departmentName',
    };
    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    pipeline.push({ $sort: { [sortField]: sortDirection } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: perPage });
    pipeline.push({
      $project: {
        department: 0,
        manager: 0
      }
    });

    const [employees, total] = await Promise.all([
      Employee.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      Employee.countDocuments(matchConditions),
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
  ): Promise<{ employees: any[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Getting employees by department`, { departmentId });

    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    const matchConditions: any = {
      departmentId: new mongoose.Types.ObjectId(departmentId),
      status: { $ne: 'terminated' }
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'department.managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $addFields: {
          departmentName: '$department.name',
          managerFullName: {
            $cond: {
              if: { $gt: [{ $size: '$manager' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$manager.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$manager.lastName', 0] }
                ]
              },
              else: null
            }
          }
        }
      }
    ];

    // Map snake_case sort field to camelCase model field
    const sortFieldMap: Record<string, string> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'job_title': 'jobTitle',
      'hire_date': 'hireDate',
      'employment_type': 'employmentType',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'department': 'departmentName',
    };
    const sortField = sortFieldMap[sortBy] || sortBy || 'lastName';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    pipeline.push({ $sort: { [sortField]: sortDirection } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: perPage });
    pipeline.push({
      $project: {
        department: 0,
        manager: 0
      }
    });

    const [employees, total] = await Promise.all([
      Employee.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      Employee.countDocuments(matchConditions),
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
