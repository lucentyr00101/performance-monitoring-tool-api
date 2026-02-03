import { Department, type DepartmentDocument } from '@employees/models/index.js';
import { Employee } from '@employees/models/index.js';
import { AppError } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';
import type { departmentQuerySchema } from '@pmt/shared';

export interface CreateDepartmentDTO {
  name: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
}

export interface UpdateDepartmentDTO extends Partial<CreateDepartmentDTO> {
  status?: 'active' | 'inactive';
}

type DepartmentQueryParams = z.infer<typeof departmentQuerySchema>;

interface DepartmentHierarchyNode {
  id: string;
  name: string;
  description?: string;
  manager?: { id: string; first_name: string; last_name: string } | null;
  employee_count: number;
  children: DepartmentHierarchyNode[];
}

export class DepartmentService {
  /**
   * List departments with filtering
   */
  async listDepartments(params: DepartmentQueryParams): Promise<DepartmentDocument[]> {
    const query: FilterQuery<DepartmentDocument> = {};

    if (params.status) {
      query.status = params.status;
    }
    if (params.parent_id) {
      query.parentId = params.parent_id;
    }
    if (params.search) {
      query.name = { $regex: params.search, $options: 'i' };
    }

    const departments = await Department.find(query)
      .populate('parentId', 'name')
      .populate('managerId', 'firstName lastName')
      .sort({ name: 1 });

    return departments;
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<DepartmentDocument & { employeeCount: number }> {
    const department = await Department.findById(id)
      .populate('parentId', 'name')
      .populate('managerId', 'firstName lastName');

    if (!department) {
      throw new AppError('NOT_FOUND', 'Department not found', 404);
    }

    // Get employee count
    const employeeCount = await Employee.countDocuments({
      departmentId: id,
      status: { $ne: 'terminated' },
    });

    return Object.assign(department.toObject(), { employeeCount });
  }

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentDTO): Promise<DepartmentDocument> {
    // Check for duplicate name
    const existingDepartment = await Department.findOne({ name: data.name });
    if (existingDepartment) {
      throw new AppError('CONFLICT', 'Department with this name already exists', 409);
    }

    // Verify parent department exists if provided
    if (data.parentId) {
      const parentDept = await Department.findById(data.parentId);
      if (!parentDept) {
        throw new AppError('NOT_FOUND', 'Parent department not found', 404);
      }
    }

    // Verify manager employee exists if provided
    if (data.managerId) {
      const manager = await Employee.findById(data.managerId);
      if (!manager) {
        throw new AppError('NOT_FOUND', 'Manager employee not found', 404);
      }
    }

    const department = await Department.create(data);

    return department.populate([
      { path: 'parentId', select: 'name' },
      { path: 'managerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Update a department
   */
  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<DepartmentDocument> {
    const department = await Department.findById(id);

    if (!department) {
      throw new AppError('NOT_FOUND', 'Department not found', 404);
    }

    // Check for duplicate name if being updated
    if (data.name && data.name !== department.name) {
      const existingDepartment = await Department.findOne({
        name: data.name,
        _id: { $ne: id },
      });
      if (existingDepartment) {
        throw new AppError('CONFLICT', 'Department with this name already exists', 409);
      }
    }

    // Validate parent department
    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === id) {
        throw new AppError('VALIDATION_ERROR', 'Department cannot be its own parent', 422);
      }
      const parentDept = await Department.findById(data.parentId);
      if (!parentDept) {
        throw new AppError('NOT_FOUND', 'Parent department not found', 404);
      }
    }

    // Validate manager employee
    if (data.managerId !== undefined && data.managerId !== null) {
      const manager = await Employee.findById(data.managerId);
      if (!manager) {
        throw new AppError('NOT_FOUND', 'Manager employee not found', 404);
      }
    }

    Object.assign(department, data);
    await department.save();

    return department.populate([
      { path: 'parentId', select: 'name' },
      { path: 'managerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Delete a department (soft delete by setting status to inactive)
   */
  async deleteDepartment(id: string): Promise<void> {
    const department = await Department.findById(id);

    if (!department) {
      throw new AppError('NOT_FOUND', 'Department not found', 404);
    }

    // Check if there are active employees in this department
    const employeeCount = await Employee.countDocuments({
      departmentId: id,
      status: { $ne: 'terminated' },
    });

    if (employeeCount > 0) {
      throw new AppError('CONFLICT', 'Cannot delete department with active employees', 409);
    }

    // Check if there are child departments
    const childCount = await Department.countDocuments({
      parentId: id,
      status: 'active',
    });

    if (childCount > 0) {
      throw new AppError('CONFLICT', 'Cannot delete department with active child departments', 409);
    }

    department.status = 'inactive';
    await department.save();
  }

  /**
   * Get department hierarchy
   */
  async getDepartmentHierarchy(): Promise<DepartmentHierarchyNode[]> {
    const departments = await Department.find({ status: 'active' })
      .select('name description parentId managerId')
      .populate('managerId', 'firstName lastName')
      .lean();

    // Get employee counts for all departments
    const employeeCounts = await Employee.aggregate([
      { $match: { status: { $ne: 'terminated' } } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    employeeCounts.forEach((item: { _id: unknown; count: number }) => {
      countMap.set((item._id as object).toString(), item.count);
    });

    // Build hierarchy
    const departmentMap = new Map<string, DepartmentHierarchyNode>();
    const rootDepartments: DepartmentHierarchyNode[] = [];

    // First pass: create all nodes
    departments.forEach((dept: Record<string, unknown>) => {
      const manager = dept.managerId as { _id?: unknown; firstName?: string; lastName?: string } | null;
      const node: DepartmentHierarchyNode = {
        id: (dept._id as object).toString(),
        name: dept.name as string,
        description: dept.description as string | undefined,
        manager: manager ? {
          id: (manager._id as object).toString(),
          first_name: manager.firstName || '',
          last_name: manager.lastName || '',
        } : null,
        employee_count: countMap.get((dept._id as object).toString()) || 0,
        children: [],
      };
      departmentMap.set((dept._id as object).toString(), node);
    });

    // Second pass: build tree structure
    departments.forEach((dept: Record<string, unknown>) => {
      const node = departmentMap.get((dept._id as object).toString())!;
      if (dept.parentId) {
        const parent = departmentMap.get((dept.parentId as object).toString());
        if (parent) {
          parent.children.push(node);
        } else {
          rootDepartments.push(node);
        }
      } else {
        rootDepartments.push(node);
      }
    });

    return rootDepartments;
  }
}

export const departmentService = new DepartmentService();
