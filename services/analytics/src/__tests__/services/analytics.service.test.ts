import { describe, it, expect } from 'vitest';
import { analyticsService } from '@analytics/services/index.js';
import { Types } from 'mongoose';

describe('AnalyticsService', () => {
  describe('getDashboard', () => {
    it('should return dashboard data with expected structure', async () => {
      const mockUser = {
        sub: new Types.ObjectId().toString(),
        email: 'test@example.com',
        roles: ['employee'] as ['admin' | 'hr' | 'manager' | 'employee'],
      };

      const dashboard = await analyticsService.getDashboard(mockUser);

      expect(dashboard).toBeDefined();
      expect(dashboard.overview).toBeDefined();
      expect(dashboard.overview).toHaveProperty('totalEmployees');
      expect(dashboard.overview).toHaveProperty('activeGoals');
      expect(dashboard.overview).toHaveProperty('completedGoals');
      expect(dashboard.overview).toHaveProperty('pendingReviews');
      expect(dashboard.overview).toHaveProperty('averagePerformanceRating');
      expect(dashboard.goalProgress).toBeDefined();
      expect(dashboard.goalProgress).toHaveProperty('onTrack');
      expect(dashboard.goalProgress).toHaveProperty('atRisk');
      expect(dashboard.goalProgress).toHaveProperty('behind');
      expect(dashboard.reviewStatus).toBeDefined();
      expect(dashboard.reviewStatus).toHaveProperty('pending');
      expect(dashboard.reviewStatus).toHaveProperty('inProgress');
      expect(dashboard.reviewStatus).toHaveProperty('completed');
      expect(Array.isArray(dashboard.recentActivity)).toBe(true);
    });
  });

  describe('getGoalAnalytics', () => {
    it('should return goal analytics with expected structure', async () => {
      const analytics = await analyticsService.getGoalAnalytics({});

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary).toHaveProperty('total');
      expect(analytics.summary).toHaveProperty('byStatus');
      expect(analytics.summary).toHaveProperty('byCategory');
      expect(analytics.summary).toHaveProperty('byPriority');
      expect(typeof analytics.averageProgress).toBe('number');
      expect(typeof analytics.completionRate).toBe('number');
      expect(typeof analytics.overdueCount).toBe('number');
      expect(Array.isArray(analytics.trends)).toBe(true);
    });

    it('should accept filter parameters', async () => {
      const analytics = await analyticsService.getGoalAnalytics({
        department_id: new Types.ObjectId().toString(),
        employee_id: new Types.ObjectId().toString(),
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      });

      expect(analytics).toBeDefined();
    });
  });

  describe('getReviewAnalytics', () => {
    it('should return review analytics with expected structure', async () => {
      const analytics = await analyticsService.getReviewAnalytics({});

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary).toHaveProperty('totalCycles');
      expect(analytics.summary).toHaveProperty('activeCycles');
      expect(analytics.summary).toHaveProperty('totalReviews');
      expect(analytics.summary).toHaveProperty('completedReviews');
      expect(analytics.ratingDistribution).toBeDefined();
      expect(typeof analytics.averageRating).toBe('number');
      expect(typeof analytics.completionRate).toBe('number');
      expect(Array.isArray(analytics.byDepartment)).toBe(true);
    });

    it('should accept filter parameters', async () => {
      const analytics = await analyticsService.getReviewAnalytics({
        cycle_id: new Types.ObjectId().toString(),
        department_id: new Types.ObjectId().toString(),
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      });

      expect(analytics).toBeDefined();
    });
  });

  describe('getTeamAnalytics', () => {
    it('should return team analytics with expected structure', async () => {
      const managerId = new Types.ObjectId().toString();
      const analytics = await analyticsService.getTeamAnalytics(managerId);

      expect(analytics).toBeDefined();
      expect(typeof analytics.teamSize).toBe('number');
      expect(typeof analytics.directReports).toBe('number');
      expect(typeof analytics.averagePerformanceRating).toBe('number');
      expect(typeof analytics.goalCompletionRate).toBe('number');
      expect(Array.isArray(analytics.members)).toBe(true);
    });
  });

  describe('getDepartmentAnalytics', () => {
    it('should return department analytics with expected structure', async () => {
      const departmentId = new Types.ObjectId().toString();
      const analytics = await analyticsService.getDepartmentAnalytics(departmentId);

      expect(analytics).toBeDefined();
      expect(analytics.departmentId).toBe(departmentId);
      expect(typeof analytics.departmentName).toBe('string');
      expect(typeof analytics.employeeCount).toBe('number');
      expect(typeof analytics.averagePerformanceRating).toBe('number');
      expect(analytics.goalMetrics).toBeDefined();
      expect(analytics.goalMetrics).toHaveProperty('total');
      expect(analytics.goalMetrics).toHaveProperty('completed');
      expect(analytics.goalMetrics).toHaveProperty('inProgress');
      expect(analytics.goalMetrics).toHaveProperty('averageProgress');
      expect(analytics.reviewMetrics).toBeDefined();
      expect(analytics.reviewMetrics).toHaveProperty('total');
      expect(analytics.reviewMetrics).toHaveProperty('completed');
      expect(analytics.reviewMetrics).toHaveProperty('averageRating');
      expect(Array.isArray(analytics.topPerformers)).toBe(true);
    });
  });

  describe('exportAnalytics', () => {
    it('should return export url for goals', async () => {
      const result = await analyticsService.exportAnalytics({
        type: 'goals',
        format: 'csv',
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should return export url for reviews', async () => {
      const result = await analyticsService.exportAnalytics({
        type: 'reviews',
        format: 'json',
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    });

    it('should return export url for all data', async () => {
      const result = await analyticsService.exportAnalytics({
        type: 'all',
        format: 'xlsx',
        filters: { department_id: new Types.ObjectId().toString() },
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    });
  });
});
