import { Hono } from 'hono';
import { authController } from '@auth/controllers/index.js';
import { authMiddleware, errorHandler } from '@pmt/shared';

const authRoutes = new Hono();

// Apply error handler to all routes
authRoutes.use('*', errorHandler);

// Public routes (no auth required)
authRoutes.post('/login', (c) => authController.login(c));
authRoutes.post('/refresh', (c) => authController.refresh(c));
authRoutes.post('/forgot-password', (c) => authController.forgotPassword(c));
authRoutes.post('/reset-password', (c) => authController.resetPassword(c));

// Protected routes
authRoutes.post('/logout', authMiddleware, (c) => authController.logout(c));
authRoutes.get('/me', authMiddleware, (c) => authController.me(c));

export { authRoutes };
