import { Hono } from 'hono';
import { employeeController } from '@employees/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const employeeRoutes = new Hono();

// Apply error handler to all routes
employeeRoutes.use('*', errorHandler);

// All employee routes require authentication
employeeRoutes.use('*', authMiddleware);

// GET /employees - list employees (all roles)
employeeRoutes.get('/', (c) => employeeController.list(c));

// GET /employees/:id - get employee by ID
employeeRoutes.get('/:id', (c) => employeeController.getById(c));

// POST /employees - create employee (admin, hr only)
employeeRoutes.post('/', requireRoles('admin', 'hr'), (c) => employeeController.create(c));

// PUT /employees/:id - update employee (admin, hr, manager for their team)
employeeRoutes.put('/:id', requireRoles('admin', 'hr', 'manager'), (c) => employeeController.update(c));

// DELETE /employees/:id - delete employee (admin, hr only)
employeeRoutes.delete('/:id', requireRoles('admin', 'hr'), (c) => employeeController.delete(c));

// GET /employees/:id/team - get employee's team (direct reports)
employeeRoutes.get('/:id/team', (c) => employeeController.getTeam(c));

export { employeeRoutes };
