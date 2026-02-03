import { Hono } from 'hono';
import { reviewFormController } from '@reviews/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const reviewFormRoutes = new Hono();

reviewFormRoutes.use('*', errorHandler);
reviewFormRoutes.use('*', authMiddleware);

// List review forms
reviewFormRoutes.get('/', (c) => reviewFormController.list(c));

// Get review form by ID
reviewFormRoutes.get('/:id', (c) => reviewFormController.getById(c));

// Get form versions
reviewFormRoutes.get('/:id/versions', (c) => reviewFormController.getVersions(c));

// Create review form (admin, hr only)
reviewFormRoutes.post('/', requireRoles('admin', 'hr'), (c) => reviewFormController.create(c));

// Update review form (admin, hr only)
reviewFormRoutes.put('/:id', requireRoles('admin', 'hr'), (c) => reviewFormController.update(c));

// Delete review form (admin only)
reviewFormRoutes.delete('/:id', requireRoles('admin'), (c) => reviewFormController.delete(c));

// Publish review form (admin, hr only)
reviewFormRoutes.post('/:id/publish', requireRoles('admin', 'hr'), (c) => reviewFormController.publish(c));

// Archive review form (admin, hr only)
reviewFormRoutes.post('/:id/archive', requireRoles('admin', 'hr'), (c) => reviewFormController.archive(c));

// Clone review form (admin, hr only)
reviewFormRoutes.post('/:id/clone', requireRoles('admin', 'hr'), (c) => reviewFormController.clone(c));

// Assign departments to form (admin, hr only)
reviewFormRoutes.post('/:id/assign', requireRoles('admin', 'hr'), (c) => reviewFormController.assignDepartments(c));

export { reviewFormRoutes };
