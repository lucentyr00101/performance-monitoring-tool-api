import { Hono } from 'hono';
import { notificationController } from '@notifications/controllers/index.js';
import { authMiddleware, errorHandler } from '@pmt/shared';

const notificationRoutes = new Hono();

notificationRoutes.use('*', errorHandler);
notificationRoutes.use('*', authMiddleware);

// List notifications for authenticated user
notificationRoutes.get('/', (c) => notificationController.list(c));

// Get unread counts
notificationRoutes.get('/counts', (c) => notificationController.getCounts(c));

// Mark all as read (must be before /:id/read to avoid route conflict)
notificationRoutes.put('/read-all', (c) => notificationController.markAllAsRead(c));

// Mark single notification as read
notificationRoutes.put('/:id/read', (c) => notificationController.markAsRead(c));

// Create notification (internal use)
notificationRoutes.post('/', (c) => notificationController.create(c));

export { notificationRoutes };
