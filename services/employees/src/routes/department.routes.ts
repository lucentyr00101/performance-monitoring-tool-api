import { Hono } from 'hono';
import { departmentController } from '@employees/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const departmentRoutes = new Hono();

// Apply error handler to all routes
departmentRoutes.use('*', errorHandler);

// All department routes require authentication
departmentRoutes.use('*', authMiddleware);

// GET /departments/hierarchy - get department hierarchy (must be before /:id)
departmentRoutes.get('/hierarchy', (c) => departmentController.getHierarchy(c));

// GET /departments - list departments (all roles)
departmentRoutes.get('/', (c) => departmentController.list(c));

// GET /departments/:id - get department by ID
departmentRoutes.get('/:id', (c) => departmentController.getById(c));

// POST /departments - create department (admin, hr)
departmentRoutes.post('/', requireRoles('admin', 'hr'), (c) => departmentController.create(c));

// PUT /departments/:id - update department (admin, hr)
departmentRoutes.put('/:id', requireRoles('admin', 'hr'), (c) => departmentController.update(c));

// DELETE /departments/:id - delete department (admin only)
departmentRoutes.delete('/:id', requireRoles('admin'), (c) => departmentController.delete(c));

// GET /departments/:id/employees - get employees in department
departmentRoutes.get('/:id/employees', (c) => departmentController.getEmployees(c));

export { departmentRoutes };
