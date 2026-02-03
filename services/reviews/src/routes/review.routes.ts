import { Hono } from 'hono';
import { reviewController } from '@reviews/controllers/index.js';
import { authMiddleware, errorHandler } from '@pmt/shared';

const reviewRoutes = new Hono();

reviewRoutes.use('*', errorHandler);
reviewRoutes.use('*', authMiddleware);

// List reviews
reviewRoutes.get('/', (c) => reviewController.list(c));

// Get review by ID
reviewRoutes.get('/:id', (c) => reviewController.getById(c));

// Update review
reviewRoutes.put('/:id', (c) => reviewController.update(c));

// Submit review
reviewRoutes.post('/:id/submit', (c) => reviewController.submit(c));

// Acknowledge review
reviewRoutes.post('/:id/acknowledge', (c) => reviewController.acknowledge(c));

export { reviewRoutes };
