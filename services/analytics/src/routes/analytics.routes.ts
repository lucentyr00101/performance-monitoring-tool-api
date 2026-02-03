import { Hono } from 'hono';
import { analyticsController } from '@analytics/controllers/index.js';
import { authMiddleware, requireRoles, errorHandler } from '@pmt/shared';

const analyticsRoutes = new Hono();

analyticsRoutes.use('*', errorHandler);
analyticsRoutes.use('*', authMiddleware);

// Dashboard - role-specific data
analyticsRoutes.get('/dashboard', (c) => analyticsController.getDashboard(c));

// Goal analytics
analyticsRoutes.get('/goals', (c) => analyticsController.getGoalAnalytics(c));

// Review analytics
analyticsRoutes.get('/reviews', (c) => analyticsController.getReviewAnalytics(c));

// Team analytics (managers only)
analyticsRoutes.get('/team/:id', requireRoles('admin', 'hr', 'manager'), (c) => analyticsController.getTeamAnalytics(c));

// Department analytics (admin, hr, managers only)
analyticsRoutes.get('/department/:id', requireRoles('admin', 'hr', 'manager'), (c) => analyticsController.getDepartmentAnalytics(c));

// Export analytics (admin, hr only)
analyticsRoutes.post('/export', requireRoles('admin', 'hr'), (c) => analyticsController.exportAnalytics(c));

export { analyticsRoutes };
