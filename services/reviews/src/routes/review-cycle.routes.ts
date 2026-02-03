import { Hono } from 'hono';
import { reviewCycleController } from '@reviews/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const reviewCycleRoutes = new Hono();

reviewCycleRoutes.use('*', errorHandler);
reviewCycleRoutes.use('*', authMiddleware);

// List review cycles
reviewCycleRoutes.get('/', (c) => reviewCycleController.list(c));

// Get review cycle by ID
reviewCycleRoutes.get('/:id', (c) => reviewCycleController.getById(c));

// Create review cycle (admin, hr only)
reviewCycleRoutes.post('/', requireRoles('admin', 'hr'), (c) => reviewCycleController.create(c));

// Update review cycle (admin, hr only)
reviewCycleRoutes.put('/:id', requireRoles('admin', 'hr'), (c) => reviewCycleController.update(c));

// Delete review cycle (admin only)
reviewCycleRoutes.delete('/:id', requireRoles('admin'), (c) => reviewCycleController.delete(c));

// Launch review cycle (admin, hr only)
reviewCycleRoutes.post('/:id/launch', requireRoles('admin', 'hr'), (c) => reviewCycleController.launch(c));

// Complete review cycle (admin, hr only)
reviewCycleRoutes.post('/:id/complete', requireRoles('admin', 'hr'), (c) => reviewCycleController.complete(c));

export { reviewCycleRoutes };
