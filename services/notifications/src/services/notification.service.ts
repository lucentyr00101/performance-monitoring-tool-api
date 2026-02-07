import { Notification, type NotificationDocument } from '@notifications/models/index.js';
import { AppError } from '@pmt/shared';
import mongoose, { type FilterQuery } from 'mongoose';
import type { NotificationType, NotificationPriority } from '@pmt/shared';

const LOG_PREFIX = '[NotificationService]';

export interface NotificationFilters {
  type?: string;
  status?: string; // 'unread' | 'read' | 'all'
}

export interface NotificationPagination {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export class NotificationService {
  /**
   * List notifications for a user with pagination and filters.
   */
  async getNotifications(
    userId: string,
    filters: NotificationFilters,
    pagination: NotificationPagination,
  ): Promise<{ notifications: NotificationDocument[]; total: number }> {
    console.info(`${LOG_PREFIX} Listing notifications`, { userId, filters, page: pagination.page });

    const query: FilterQuery<NotificationDocument> = { userId };

    if (filters.type) query.type = filters.type;
    if (filters.status && filters.status !== 'all') query.status = filters.status;

    const sortField = pagination.sortBy || 'createdAt';
    const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(pagination.skip)
        .limit(pagination.perPage),
      Notification.countDocuments(query),
    ]);

    console.info(`${LOG_PREFIX} Notifications listed`, { userId, count: notifications.length, total });
    return { notifications, total };
  }

  /**
   * Get unread notification counts grouped by type.
   */
  async getNotificationCounts(userId: string): Promise<NotificationCounts> {
    console.info(`${LOG_PREFIX} Getting notification counts`, { userId });

    const [total, unread, byTypeAgg] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, status: 'unread' }),
      Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'unread' } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const byType: Record<string, number> = {};
    for (const item of byTypeAgg) {
      byType[item._id as string] = item.count as number;
    }

    const counts = { total, unread, byType };
    console.info(`${LOG_PREFIX} Notification counts retrieved`, { userId, total, unread });
    return counts;
  }

  /**
   * Mark a single notification as read. Enforces ownership.
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument> {
    console.info(`${LOG_PREFIX} Marking notification as read`, { notificationId, userId });

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      console.warn(`${LOG_PREFIX} Notification not found`, { notificationId });
      throw new AppError('NOT_FOUND', 'Notification not found', 404);
    }

    if (notification.userId.toString() !== userId) {
      console.warn(`${LOG_PREFIX} Access denied to notification`, { notificationId, userId });
      throw new AppError('AUTHORIZATION_ERROR', 'Access denied', 403);
    }

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    console.info(`${LOG_PREFIX} Notification marked as read`, { notificationId, userId });
    return notification;
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<number> {
    console.info(`${LOG_PREFIX} Marking all notifications as read`, { userId });

    const result = await Notification.updateMany(
      { userId, status: 'unread' },
      { status: 'read', readAt: new Date() },
    );

    console.info(`${LOG_PREFIX} All notifications marked as read`, { userId, modifiedCount: result.modifiedCount });
    return result.modifiedCount;
  }

  /**
   * Create a new notification (internal use by other services).
   */
  async createNotification(data: CreateNotificationDTO): Promise<NotificationDocument> {
    console.info(`${LOG_PREFIX} Creating notification`, { userId: data.userId, type: data.type, title: data.title });

    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      actionUrl: data.actionUrl,
      metadata: data.metadata,
      status: 'unread',
    });

    console.info(`${LOG_PREFIX} Notification created`, { notificationId: notification._id, userId: data.userId });
    return notification;
  }
}

export const notificationService = new NotificationService();
