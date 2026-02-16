# Backend API Recommendations

> Recommendations from the frontend team based on findings during the Performance Monitoring Tool UI implementation.
> These items would unblock frontend features that are currently stubbed or mocked.

---

## 1. Notifications API

**Status:** Returns 404 — endpoint does not exist yet.

The frontend has a complete notification system ready (service, store, composable, UI) that expects these endpoints:

### `GET /api/v1/notifications`

List notifications for the authenticated user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `type` | string | Filter by type: `review_assigned`, `review_completed`, `review_reminder`, `goal_updated`, `goal_due`, `system`, `announcement` |
| `status` | string | Filter: `unread`, `read`, `all` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "review_assigned",
      "title": "New Review Assigned",
      "message": "You have been assigned a review for John Doe",
      "status": "unread",
      "priority": "normal",
      "actionUrl": "/reviews/adhoc/uuid",
      "metadata": {},
      "createdAt": "2025-01-01T00:00:00Z",
      "readAt": null
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### `GET /api/v1/notifications/counts`

Get unread notification counts for badge display.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "unread": 5,
    "byType": {
      "review_assigned": 2,
      "review_reminder": 1,
      "goal_due": 2
    }
  }
}
```

### `PUT /api/v1/notifications/:id/read`

Mark a single notification as read.

### `PUT /api/v1/notifications/read-all`

Mark all notifications as read for the authenticated user.

---

## 2. KPI / Analytics API

**Status:** Returns 404 — endpoint does not exist yet.

The dashboard and analytics pages reference KPI data but have no backend source.

### `GET /api/v1/analytics/kpis`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `period` | string | `monthly`, `quarterly`, `yearly` |
| `department` | string | Filter by department |

**Suggested Response:**
```json
{
  "success": true,
  "data": {
    "averagePerformanceScore": 4.2,
    "goalsCompletionRate": 0.78,
    "reviewCompletionRate": 0.92,
    "employeeCount": 150,
    "activeReviewCycles": 3,
    "trends": {
      "performanceScore": [4.0, 4.1, 4.2],
      "goalsCompletion": [0.70, 0.75, 0.78]
    }
  }
}
```

---

## 3. `GET /api/v1/users/me` Endpoint

**Status:** Returns 404. Currently using `GET /api/v1/auth/me` which works.

**Recommendation:** Either:
- **(A)** Add a dedicated `GET /api/v1/users/me` endpoint that returns the full user profile with employee details, OR
- **(B)** Ensure `GET /api/v1/auth/me` always includes the nested `employee` object with all fields.

The frontend needs these fields on the `user.employee` object:
```typescript
{
  id: string           // Employee entity ID (used for review ownership checks)
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  hireDate: string
  managerId?: string
}
```

**Critical:** The `employee.id` field is essential. The frontend compares `review.employee.id === currentUser.employee.id` to determine review ownership. If this field is missing or is the user account ID instead of the employee entity ID, the review workflow will break.

---

## 4. Review Submission Response Shape

The frontend expects these response shapes from the review endpoints:

### `PUT /api/v1/adhoc-reviews/:id/self-review`

**Request:**
```json
{
  "answers": [
    { "questionId": "uuid", "value": "string | number | boolean | string[]" }
  ],
  "status": "submitted" | "in_progress"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "self_review_submitted",
    "selfReview": {
      "status": "submitted",
      "submittedAt": "2025-01-01T00:00:00Z",
      "answers": [...]
    }
  }
}
```

### `PUT /api/v1/adhoc-reviews/:id/manager-review`

Same shape as self-review, but updates `managerReview` instead.

### `PUT /api/v1/adhoc-reviews/:id/acknowledge`

**Request:**
```json
{
  "comments": "Optional acknowledgment comments"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "acknowledged",
    "acknowledgedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## 5. Auth Token Security — httpOnly Cookie Support

**Current:** The refresh token is returned in the login response body and stored client-side.

**Recommendation:** Support httpOnly cookie for refresh tokens server-side:

1. On `POST /auth/login` response, optionally set a `Set-Cookie` header with the refresh token as an httpOnly, secure, sameSite=strict cookie.
2. On `POST /auth/refresh`, read the refresh token from the cookie header instead of the request body.
3. On `POST /auth/logout`, clear the cookie.

**Note:** The frontend has already implemented Nuxt server routes (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`) that proxy to the backend and handle cookie setting/clearing. However, native backend cookie support would be even more secure and simplify the architecture.

---

## 6. Suggested Field Additions

### On `AdhocReview` entity:
- `acknowledgedAt: string | null` — Timestamp when employee acknowledged the review
- `acknowledgmentComments: string | null` — Employee's comments during acknowledgment

### On Login Response:
- Ensure `user.employee` is always populated (not just `user.employee_id`)
- Include `employee.department` and `employee.position` for display purposes

### On Dashboard API (`GET /api/v1/dashboard`):
- Add `notifications` array (or reference the notifications endpoint) so the dashboard can show recent alerts
- Add `kpis` object for quick stats

---

## 7. Filtering Enhancements

### `GET /api/v1/adhoc-reviews`

The frontend convenience methods need server-side filtering:

| Param | Type | Description |
|-------|------|-------------|
| `employeeId` | string | Filter reviews where the employee matches |
| `managerId` | string | Filter reviews where the manager matches |
| `status` | string | Filter by review status |

Currently the frontend fetches all reviews and filters client-side, which won't scale.

---

## Summary Priority

| # | Item | Priority | Impact |
|---|------|----------|--------|
| 1 | Notifications API | High | Enables real-time alerts, notification bell, notification page |
| 2 | `users/me` or `auth/me` with employee data | High | Fixes identity comparison bugs |
| 3 | KPI/Analytics API | Medium | Enables analytics dashboards |
| 4 | httpOnly cookie support | Medium | Security improvement |
| 5 | Review response shapes | Low | Frontend already handles gracefully |
| 6 | Field additions | Low | Nice-to-have for richer UI |
| 7 | Server-side filtering | Medium | Performance at scale |
