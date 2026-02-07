import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { notificationService } from '@notifications/services/notification.service.js';

const testUserId = new mongoose.Types.ObjectId().toString();

describe('NotificationService', () => {
  describe('createNotification', () => {
    it('should create a notification with required fields', async () => {
      const notification = await notificationService.createNotification({
        userId: testUserId,
        type: 'review_assigned',
        title: 'New Review Assigned',
        message: 'You have been assigned a review for John Doe',
      });

      expect(notification).toBeDefined();
      expect(notification.userId.toString()).toBe(testUserId);
      expect(notification.type).toBe('review_assigned');
      expect(notification.title).toBe('New Review Assigned');
      expect(notification.status).toBe('unread');
      expect(notification.priority).toBe('normal');
    });

    it('should create a notification with optional fields', async () => {
      const notification = await notificationService.createNotification({
        userId: testUserId,
        type: 'goal_due',
        title: 'Goal Due Soon',
        message: 'Your goal is due in 3 days',
        priority: 'high',
        actionUrl: '/goals/123',
        metadata: { goalId: '123' },
      });

      expect(notification.priority).toBe('high');
      expect(notification.actionUrl).toBe('/goals/123');
      expect(notification.metadata).toEqual({ goalId: '123' });
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications for a user', async () => {
      // Create test notifications
      for (let i = 0; i < 5; i++) {
        await notificationService.createNotification({
          userId: testUserId,
          type: 'system',
          title: `Notification ${i}`,
          message: `Message ${i}`,
        });
      }

      const result = await notificationService.getNotifications(
        testUserId,
        {},
        { page: 1, perPage: 3, skip: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );

      expect(result.notifications).toHaveLength(3);
      expect(result.total).toBe(5);
    });

    it('should filter by status', async () => {
      const n1 = await notificationService.createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Unread',
        message: 'Unread notification',
      });

      await notificationService.markAsRead(n1._id.toString(), testUserId);

      await notificationService.createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Still Unread',
        message: 'Another notification',
      });

      const result = await notificationService.getNotifications(
        testUserId,
        { status: 'unread' },
        { page: 1, perPage: 10, skip: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].title).toBe('Still Unread');
    });

    it('should filter by type', async () => {
      await notificationService.createNotification({
        userId: testUserId,
        type: 'review_assigned',
        title: 'Review',
        message: 'Review notification',
      });

      await notificationService.createNotification({
        userId: testUserId,
        type: 'goal_due',
        title: 'Goal',
        message: 'Goal notification',
      });

      const result = await notificationService.getNotifications(
        testUserId,
        { type: 'review_assigned' },
        { page: 1, perPage: 10, skip: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe('review_assigned');
    });

    it('should not return notifications from other users', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();

      await notificationService.createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Mine',
        message: 'My notification',
      });

      await notificationService.createNotification({
        userId: otherUserId,
        type: 'system',
        title: 'Theirs',
        message: 'Their notification',
      });

      const result = await notificationService.getNotifications(
        testUserId,
        {},
        { page: 1, perPage: 10, skip: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].title).toBe('Mine');
    });
  });

  describe('getNotificationCounts', () => {
    it('should return counts grouped by type', async () => {
      await notificationService.createNotification({
        userId: testUserId,
        type: 'review_assigned',
        title: 'R1',
        message: 'Review 1',
      });

      await notificationService.createNotification({
        userId: testUserId,
        type: 'review_assigned',
        title: 'R2',
        message: 'Review 2',
      });

      await notificationService.createNotification({
        userId: testUserId,
        type: 'goal_due',
        title: 'G1',
        message: 'Goal 1',
      });

      const counts = await notificationService.getNotificationCounts(testUserId);

      expect(counts.total).toBe(3);
      expect(counts.unread).toBe(3);
      expect(counts.byType.review_assigned).toBe(2);
      expect(counts.byType.goal_due).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = await notificationService.createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Test',
        message: 'Test message',
      });

      const updated = await notificationService.markAsRead(
        notification._id.toString(),
        testUserId,
      );

      expect(updated.status).toBe('read');
      expect(updated.readAt).toBeDefined();
    });

    it('should throw error for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        notificationService.markAsRead(fakeId, testUserId),
      ).rejects.toThrow('Notification not found');
    });

    it('should deny access to another user\'s notification', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const notification = await notificationService.createNotification({
        userId: otherUserId,
        type: 'system',
        title: 'Not mine',
        message: 'Not my notification',
      });

      await expect(
        notificationService.markAsRead(notification._id.toString(), testUserId),
      ).rejects.toThrow('Access denied');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      for (let i = 0; i < 3; i++) {
        await notificationService.createNotification({
          userId: testUserId,
          type: 'system',
          title: `Test ${i}`,
          message: `Message ${i}`,
        });
      }

      const count = await notificationService.markAllAsRead(testUserId);
      expect(count).toBe(3);

      const counts = await notificationService.getNotificationCounts(testUserId);
      expect(counts.unread).toBe(0);
    });
  });
});
