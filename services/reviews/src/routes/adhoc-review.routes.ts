import { Hono } from 'hono';
import { adhocReviewController } from '@reviews/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const adhocReviewRoutes = new Hono();

adhocReviewRoutes.use('*', errorHandler);
adhocReviewRoutes.use('*', authMiddleware);

// List ad-hoc reviews
adhocReviewRoutes.get('/', (c) => adhocReviewController.list(c));

// Get ad-hoc review by ID
adhocReviewRoutes.get('/:id', (c) => adhocReviewController.getById(c));

// Create ad-hoc review (admin, hr, manager)
adhocReviewRoutes.post('/', requireRoles('admin', 'hr', 'manager'), (c) => adhocReviewController.create(c));

// Delete ad-hoc review (admin, hr only)
adhocReviewRoutes.delete('/:id', requireRoles('admin', 'hr'), (c) => adhocReviewController.delete(c));

// Send reminder (admin, hr, manager)
adhocReviewRoutes.post('/:id/remind', requireRoles('admin', 'hr', 'manager'), (c) => adhocReviewController.remind(c));

// Cancel ad-hoc review (admin, hr, manager)
adhocReviewRoutes.post('/:id/cancel', requireRoles('admin', 'hr', 'manager'), (c) => adhocReviewController.cancel(c));

// Acknowledge ad-hoc review
adhocReviewRoutes.post('/:id/acknowledge', (c) => adhocReviewController.acknowledge(c));

export { adhocReviewRoutes };
