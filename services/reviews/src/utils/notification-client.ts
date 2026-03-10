const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:4006';
const LOG_PREFIX = '[NotificationClient]';

export interface CreateNotificationDTO {
  userId: string;
  type:
    | 'review_assigned'
    | 'review_completed'
    | 'review_reminder'
    | 'goal_updated'
    | 'goal_due'
    | 'system'
    | 'announcement';
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget notification sender. Never throws.
 */
export function sendNotification(data: CreateNotificationDTO): void {
  fetch(`${NOTIFICATIONS_SERVICE_URL}/api/v1/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority ?? 'normal',
      action_url: data.actionUrl,
      metadata: data.metadata,
    }),
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`${LOG_PREFIX} Non-OK response from notifications service`, {
          status: res.status,
          userId: data.userId,
          type: data.type,
        });
      }
    })
    .catch((err) => {
      console.error(`${LOG_PREFIX} Failed to send notification`, {
        error: err instanceof Error ? err.message : String(err),
        userId: data.userId,
        type: data.type,
      });
    });
}
