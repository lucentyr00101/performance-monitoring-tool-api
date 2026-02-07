import { Context } from 'hono';
import { notificationService } from '@notifications/services/index.js';
import {
  successResponse,
  errorResponse,
  notificationQuerySchema,
  createNotificationSchema,
  parsePagination,
  createError,
  type JwtPayload,
} from '@pmt/shared';

const LOG_PREFIX = '[NotificationController]';

export class NotificationController {
  /**
   * GET /notifications
   */
  async list(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /notifications`, { userId: user.sub });

    const query = c.req.query();
    const parsed = notificationQuerySchema.safeParse({
      page: query.page,
      per_page: query.per_page ?? query.limit,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      type: query.type,
      status: query.status,
    });

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} List validation failed`, { errors: parsed.error.errors });
      return c.json(errorResponse('VALIDATION_ERROR', 'Invalid query parameters'), 422);
    }

    const filters = {
      type: parsed.data.type,
      status: parsed.data.status,
    };

    const pagination = parsePagination({
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      sort_by: parsed.data.sort_by,
      sort_order: parsed.data.sort_order,
    });

    const { notifications, total } = await notificationService.getNotifications(
      user.sub,
      filters,
      pagination,
    );

    console.info(`${LOG_PREFIX} List response sent`, { userId: user.sub, total });
    return c.json(successResponse(notifications, {
      pagination: {
        page: pagination.page,
        per_page: pagination.perPage,
        total_items: total,
        total_pages: Math.ceil(total / pagination.perPage),
      },
    }), 200);
  }

  /**
   * GET /notifications/counts
   */
  async getCounts(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /notifications/counts`, { userId: user.sub });

    const counts = await notificationService.getNotificationCounts(user.sub);

    console.info(`${LOG_PREFIX} Counts response sent`, { userId: user.sub, unread: counts.unread });
    return c.json(successResponse(counts), 200);
  }

  /**
   * PUT /notifications/:id/read
   */
  async markAsRead(c: Context) {
    const user = c.get('user') as JwtPayload;
    const id = c.req.param('id');
    console.info(`${LOG_PREFIX} PUT /notifications/${id}/read`, { userId: user.sub });

    const notification = await notificationService.markAsRead(id, user.sub);

    console.info(`${LOG_PREFIX} Mark read response sent`, { notificationId: id, userId: user.sub });
    return c.json(successResponse(notification), 200);
  }

  /**
   * PUT /notifications/read-all
   */
  async markAllAsRead(c: Context) {
    const user = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} PUT /notifications/read-all`, { userId: user.sub });

    const modifiedCount = await notificationService.markAllAsRead(user.sub);

    console.info(`${LOG_PREFIX} Mark all read response sent`, { userId: user.sub, modifiedCount });
    return c.json(successResponse({ modifiedCount }), 200);
  }

  /**
   * POST /notifications (internal - for other services to create notifications)
   */
  async create(c: Context) {
    console.info(`${LOG_PREFIX} POST /notifications`);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch (e) {
      throw createError.badRequest('Invalid JSON in request body');
    }

    const parsed = createNotificationSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Create validation failed`, { errors: parsed.error.errors });
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map((e: { path: (string | number)[]; message: string }) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        ),
        422
      );
    }

    const notification = await notificationService.createNotification({
      userId: parsed.data.user_id,
      type: parsed.data.type,
      title: parsed.data.title,
      message: parsed.data.message,
      priority: parsed.data.priority,
      actionUrl: parsed.data.action_url,
      metadata: parsed.data.metadata,
    });

    console.info(`${LOG_PREFIX} Create response sent`, { notificationId: notification._id });
    return c.json(successResponse(notification), 201);
  }
}

export const notificationController = new NotificationController();
