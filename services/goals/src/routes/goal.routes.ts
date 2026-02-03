import { Hono } from 'hono';
import { goalController } from '@goals/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const goalRoutes = new Hono();

// Apply error handler to all routes
goalRoutes.use('*', errorHandler);

// All goal routes require authentication
goalRoutes.use('*', authMiddleware);

// GET /goals - list goals
goalRoutes.get('/', (c) => goalController.list(c));

// GET /goals/:id - get goal by ID
goalRoutes.get('/:id', (c) => goalController.getById(c));

// POST /goals - create goal
goalRoutes.post('/', (c) => goalController.create(c));

// PUT /goals/:id - update goal
goalRoutes.put('/:id', (c) => goalController.update(c));

// DELETE /goals/:id - delete goal (admin, hr, manager only)
goalRoutes.delete('/:id', requireRoles('admin', 'hr', 'manager'), (c) => goalController.delete(c));

// PATCH /goals/:id/progress - update goal progress
goalRoutes.patch('/:id/progress', (c) => goalController.updateProgress(c));

// Key Results routes
goalRoutes.get('/:id/key-results', (c) => goalController.getKeyResults(c));
goalRoutes.post('/:id/key-results', (c) => goalController.addKeyResult(c));
goalRoutes.put('/:id/key-results/:krId', (c) => goalController.updateKeyResult(c));
goalRoutes.delete('/:id/key-results/:krId', (c) => goalController.deleteKeyResult(c));

export { goalRoutes };
