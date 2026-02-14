import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '@employees/services/employee.service.js';
import { DepartmentService } from '@employees/services/department.service.js';
import { Employee } from '@employees/models/employee.model.js';
import { Department } from '@employees/models/department.model.js';
import mongoose from 'mongoose';

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let departmentId: string;

  beforeEach(async () => {
    employeeService = new EmployeeService();
    
    // Create a department for testing
    const department = await Department.create({
      name: 'Engineering',
      status: 'active',
    });
    departmentId = department._id.toString();
  });

  describe('createEmployee', () => {
    it('should create an employee with valid data', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        departmentId,
        hireDate: new Date('2024-01-15'),
        employmentType: 'full-time' as const,
        phone: '+1234567890',
      };

      const employee = await employeeService.createEmployee(employeeData);

      expect(employee.firstName).toBe('John');
      expect(employee.lastName).toBe('Doe');
      expect(employee.email).toBe('john.doe@example.com');
      expect(employee.status).toBe('active');
    });

    it('should create an employee with rank', async () => {
      const employeeData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        jobTitle: 'Senior Software Engineer',
        rank: 'senior' as const,
        departmentId,
        hireDate: new Date('2024-01-15'),
      };

      const employee = await employeeService.createEmployee(employeeData);

      expect(employee.firstName).toBe('Jane');
      expect(employee.rank).toBe('senior');
    });

    it('should throw error for duplicate email', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        departmentId,
        hireDate: new Date('2024-01-15'),
      };

      await employeeService.createEmployee(employeeData);

      await expect(
        employeeService.createEmployee({
          ...employeeData,
          firstName: 'Jane',
        })
      ).rejects.toThrow('Employee with this email already exists');
    });
  });

  describe('updateEmployee', () => {
    let employeeId: string;

    beforeEach(async () => {
      const employee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        departmentId,
        hireDate: new Date('2024-01-15'),
      });
      employeeId = employee._id.toString();
    });

    it('should update employee with valid data', async () => {
      const updated = await employeeService.updateEmployee(employeeId, {
        jobTitle: 'Senior Software Engineer',
      });

      expect(updated.jobTitle).toBe('Senior Software Engineer');
    });

    it('should update employee rank', async () => {
      const updated = await employeeService.updateEmployee(employeeId, {
        rank: 'senior',
      });

      expect(updated.rank).toBe('senior');
    });

    it('should throw error for non-existent employee', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        employeeService.updateEmployee(fakeId, { jobTitle: 'Test' })
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('deleteEmployee', () => {
    it('should soft delete an employee', async () => {
      const employee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        departmentId,
        hireDate: new Date('2024-01-15'),
      });

      await employeeService.deleteEmployee(employee._id.toString());

      const found = await Employee.findById(employee._id);
      expect(found?.status).toBe('terminated');
    });
  });

  describe('getEmployeeTeam', () => {
    it('should return direct reports', async () => {
      const manager = await Employee.create({
        firstName: 'Manager',
        lastName: 'Person',
        email: 'manager@example.com',
        jobTitle: 'Manager',
        departmentId,
        hireDate: new Date('2024-01-15'),
      });

      await Employee.create([
        {
          firstName: 'Report',
          lastName: 'One',
          email: 'report1@example.com',
          jobTitle: 'Engineer',
          departmentId,
          managerId: manager._id,
          hireDate: new Date('2024-01-15'),
        },
        {
          firstName: 'Report',
          lastName: 'Two',
          email: 'report2@example.com',
          jobTitle: 'Engineer',
          departmentId,
          managerId: manager._id,
          hireDate: new Date('2024-01-15'),
        },
      ]);

      const result = await employeeService.getEmployeeTeam(
        manager._id.toString(),
        { page: 1, per_page: 10 }
      );

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('listEmployees', () => {
    beforeEach(async () => {
      await Employee.create([
        {
          firstName: 'Active',
          lastName: 'User',
          email: 'active@example.com',
          jobTitle: 'Engineer',
          departmentId,
          status: 'active',
          hireDate: new Date('2024-01-15'),
        },
        {
          firstName: 'Inactive',
          lastName: 'User',
          email: 'inactive@example.com',
          jobTitle: 'Engineer',
          departmentId,
          status: 'inactive',
          hireDate: new Date('2024-01-15'),
        },
      ]);
    });

    it('should list all employees', async () => {
      const result = await employeeService.listEmployees({
        page: 1,
        per_page: 10
      });

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const result = await employeeService.listEmployees({
        status: 'active',
        page: 1,
        per_page: 10
      });

      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].status).toBe('active');
    });

    it('should filter by rank', async () => {
      // Create employees with different ranks
      await Employee.create([
        {
          firstName: 'Junior',
          lastName: 'Dev',
          email: 'junior@example.com',
          jobTitle: 'Junior Engineer',
          rank: 'junior',
          departmentId,
          status: 'active',
          hireDate: new Date('2024-01-15'),
        },
        {
          firstName: 'Senior',
          lastName: 'Dev',
          email: 'senior@example.com',
          jobTitle: 'Senior Engineer',
          rank: 'senior',
          departmentId,
          status: 'active',
          hireDate: new Date('2024-01-15'),
        },
      ]);

      const result = await employeeService.listEmployees({
        rank: 'senior',
        page: 1,
        per_page: 10
      });

      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].rank).toBe('senior');
      expect(result.employees[0].email).toBe('senior@example.com');
    });
  });
});

describe('DepartmentService', () => {
  let departmentService: DepartmentService;

  beforeEach(() => {
    departmentService = new DepartmentService();
  });

  describe('createDepartment', () => {
    it('should create a department with valid data', async () => {
      const department = await departmentService.createDepartment({
        name: 'Engineering',
        description: 'Engineering department',
      });

      expect(department.name).toBe('Engineering');
      expect(department.status).toBe('active');
    });

    it('should throw error for duplicate name', async () => {
      await departmentService.createDepartment({
        name: 'Engineering',
      });

      await expect(
        departmentService.createDepartment({
          name: 'Engineering',
        })
      ).rejects.toThrow('Department with this name already exists');
    });
  });

  describe('deleteDepartment', () => {
    it('should soft delete a department', async () => {
      const department = await Department.create({
        name: 'To Delete',
      });

      await departmentService.deleteDepartment(department._id.toString());

      const found = await Department.findById(department._id);
      expect(found?.status).toBe('inactive');
    });

    it('should throw error if department has active employees', async () => {
      const department = await Department.create({
        name: 'With Employees',
      });

      await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        jobTitle: 'Engineer',
        departmentId: department._id,
        status: 'active',
        hireDate: new Date(),
      });

      await expect(
        departmentService.deleteDepartment(department._id.toString())
      ).rejects.toThrow('Cannot delete department with active employees');
    });
  });

  describe('getDepartmentHierarchy', () => {
    it('should return department hierarchy', async () => {
      const parent = await Department.create({
        name: 'Engineering',
        status: 'active',
      });

      await Department.create({
        name: 'Frontend',
        parentId: parent._id,
        status: 'active',
      });

      await Department.create({
        name: 'Backend',
        parentId: parent._id,
        status: 'active',
      });

      const hierarchy = await departmentService.getDepartmentHierarchy();

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].name).toBe('Engineering');
      expect(hierarchy[0].children).toHaveLength(2);
    });
  });
});
