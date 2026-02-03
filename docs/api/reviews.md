# Performance Reviews API

## Overview

Performance review management endpoints for review cycles, evaluations, and feedback.

**Base Path:** `/review-cycles` and `/reviews`

---

## Endpoints

### Review Cycles

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/review-cycles` | List review cycles | Yes | All |
| GET | `/review-cycles/:id` | Get cycle by ID | Yes | All |
| POST | `/review-cycles` | Create cycle | Yes | Admin, HR |
| PUT | `/review-cycles/:id` | Update cycle | Yes | Admin, HR |
| DELETE | `/review-cycles/:id` | Delete cycle | Yes | Admin |
| POST | `/review-cycles/:id/launch` | Launch cycle | Yes | Admin, HR |

### Reviews

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/reviews` | List reviews | Yes | All |
| GET | `/reviews/:id` | Get review by ID | Yes | Participant |
| PUT | `/reviews/:id` | Submit/update review | Yes | Reviewer |
| POST | `/reviews/:id/acknowledge` | Acknowledge review | Yes | Employee |

---

## GET /review-cycles

List all review cycles.

### Request

```http
GET /api/v1/review-cycles?status=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `draft`, `active`, `completed`, `cancelled` |
| `type` | string | Filter: `annual`, `semi-annual`, `quarterly`, `monthly` |
| `year` | integer | Filter by year |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "name": "Q4 2025 Performance Review",
      "description": "Quarterly performance evaluation for Q4 2025",
      "type": "quarterly",
      "start_date": "2025-12-01",
      "end_date": "2025-12-31",
      "status": "completed",
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "stats": {
        "total_reviews": 150,
        "completed": 142,
        "pending": 8,
        "completion_rate": 94.67
      },
      "created_at": "2025-11-15T09:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440301",
      "name": "Q1 2026 Performance Review",
      "description": "Quarterly performance evaluation for Q1 2026",
      "type": "quarterly",
      "start_date": "2026-03-01",
      "end_date": "2026-03-31",
      "status": "draft",
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "stats": {
        "total_reviews": 0,
        "completed": 0,
        "pending": 0,
        "completion_rate": 0
      },
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 8,
      "total_pages": 1
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /review-cycles/:id

Get a single review cycle with details.

### Request

```http
GET /api/v1/review-cycles/550e8400-e29b-41d4-a716-446655440300
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440300",
    "name": "Q4 2025 Performance Review",
    "description": "Quarterly performance evaluation for Q4 2025. All employees should complete self-assessments and managers should provide feedback.",
    "type": "quarterly",
    "start_date": "2025-12-01",
    "end_date": "2025-12-31",
    "status": "completed",
    "settings": {
      "include_self_assessment": true,
      "include_manager_review": true,
      "include_peer_review": false,
      "rating_scale": {
        "min": 1,
        "max": 5,
        "labels": {
          "1": "Needs Improvement",
          "2": "Below Expectations",
          "3": "Meets Expectations",
          "4": "Exceeds Expectations",
          "5": "Outstanding"
        }
      }
    },
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "first_name": "Lisa",
      "last_name": "HR",
      "email": "lisa.hr@company.com"
    },
    "stats": {
      "total_reviews": 150,
      "completed": 142,
      "pending": 8,
      "in_progress": 0,
      "completion_rate": 94.67,
      "average_rating": 3.8,
      "by_type": {
        "self": { "total": 75, "completed": 72 },
        "manager": { "total": 75, "completed": 70 }
      }
    },
    "created_at": "2025-11-15T09:00:00Z",
    "updated_at": "2026-01-05T14:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /review-cycles

Create a new review cycle.

### Request

```http
POST /api/v1/review-cycles
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Q1 2026 Performance Review",
  "description": "Quarterly performance evaluation for Q1 2026",
  "type": "quarterly",
  "start_date": "2026-03-01",
  "end_date": "2026-03-31",
  "settings": {
    "include_self_assessment": true,
    "include_manager_review": true,
    "include_peer_review": false,
    "rating_scale": {
      "min": 1,
      "max": 5
    }
  },
  "departments": ["550e8400-e29b-41d4-a716-446655440010", "550e8400-e29b-41d4-a716-446655440011"]
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Cycle name |
| `description` | string | No | Description |
| `type` | string | Yes | `annual`, `semi-annual`, `quarterly`, `monthly` |
| `start_date` | date | Yes | Cycle start date |
| `end_date` | date | Yes | Cycle end date |
| `settings` | object | No | Cycle configuration |
| `departments` | array | No | Limit to specific departments (null = all) |

### Settings Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `include_self_assessment` | boolean | true | Include self-review |
| `include_manager_review` | boolean | true | Include manager review |
| `include_peer_review` | boolean | false | Include peer reviews |
| `rating_scale.min` | integer | 1 | Minimum rating |
| `rating_scale.max` | integer | 5 | Maximum rating |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440302",
    "name": "Q1 2026 Performance Review",
    "description": "Quarterly performance evaluation for Q1 2026",
    "type": "quarterly",
    "start_date": "2026-03-01",
    "end_date": "2026-03-31",
    "status": "draft",
    "settings": {
      "include_self_assessment": true,
      "include_manager_review": true,
      "include_peer_review": false,
      "rating_scale": {
        "min": 1,
        "max": 5
      }
    },
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "first_name": "Lisa",
      "last_name": "HR"
    },
    "created_at": "2026-01-28T10:30:00Z",
    "updated_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /review-cycles/:id

Update a review cycle (only when status is `draft`).

### Request

```http
PUT /api/v1/review-cycles/550e8400-e29b-41d4-a716-446655440302
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Q1 2026 Performance Review - Updated",
  "end_date": "2026-04-15"
}
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440302",
    "name": "Q1 2026 Performance Review - Updated",
    "end_date": "2026-04-15",
    "updated_at": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

#### Error - Cycle Already Active (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot modify an active or completed review cycle"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## DELETE /review-cycles/:id

Delete a review cycle (only when status is `draft`).

### Request

```http
DELETE /api/v1/review-cycles/550e8400-e29b-41d4-a716-446655440302
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

---

## POST /review-cycles/:id/launch

Launch a review cycle, creating all review assignments.

### Request

```http
POST /api/v1/review-cycles/550e8400-e29b-41d4-a716-446655440302/launch
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440302",
    "name": "Q1 2026 Performance Review",
    "status": "active",
    "reviews_created": {
      "self": 75,
      "manager": 75,
      "total": 150
    },
    "notifications_sent": 150,
    "launched_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /reviews

List reviews with filtering.

### Request

```http
GET /api/v1/reviews?cycle_id=uuid&status=pending
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | uuid | Filter by review cycle |
| `employee_id` | uuid | Filter by employee being reviewed |
| `reviewer_id` | uuid | Filter by reviewer |
| `type` | string | Filter: `self`, `manager`, `peer` |
| `status` | string | Filter: `pending`, `in_progress`, `submitted`, `acknowledged` |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "cycle": {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "name": "Q4 2025 Performance Review"
      },
      "employee": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Alice",
        "last_name": "Johnson",
        "job_title": "Senior Developer",
        "avatar_url": null
      },
      "reviewer": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "type": "manager",
      "status": "submitted",
      "rating": 4.5,
      "submitted_at": "2025-12-20T15:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440201",
      "cycle": {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "name": "Q4 2025 Performance Review"
      },
      "employee": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Alice",
        "last_name": "Johnson",
        "job_title": "Senior Developer",
        "avatar_url": null
      },
      "reviewer": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Alice",
        "last_name": "Johnson"
      },
      "type": "self",
      "status": "submitted",
      "rating": 4.0,
      "submitted_at": "2025-12-18T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /reviews/:id

Get a single review with full details.

### Request

```http
GET /api/v1/reviews/550e8400-e29b-41d4-a716-446655440200
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "cycle": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "name": "Q4 2025 Performance Review",
      "type": "quarterly"
    },
    "employee": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice.johnson@company.com",
      "job_title": "Senior Developer",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      },
      "hire_date": "2023-01-10"
    },
    "reviewer": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "job_title": "Engineering Manager"
    },
    "type": "manager",
    "status": "submitted",
    "rating": 4.5,
    "ratings_breakdown": {
      "technical_skills": 5,
      "communication": 4,
      "teamwork": 4,
      "problem_solving": 5,
      "initiative": 4
    },
    "strengths": "Alice demonstrates exceptional technical skills and problem-solving abilities. She consistently delivers high-quality code and has been instrumental in improving our testing coverage.",
    "improvements": "Could improve on documentation and knowledge sharing with the team. Would benefit from taking more initiative in cross-team collaboration.",
    "goals_achieved": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440101",
        "title": "Complete AWS certification",
        "progress": 100
      }
    ],
    "comments": "Overall, Alice has had an excellent quarter. She exceeded expectations on her technical deliverables and has shown strong growth potential.",
    "submitted_at": "2025-12-20T15:00:00Z",
    "acknowledged_at": null,
    "created_at": "2025-12-01T00:00:00Z",
    "updated_at": "2025-12-20T15:00:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /reviews/:id

Submit or update a review.

### Request

```http
PUT /api/v1/reviews/550e8400-e29b-41d4-a716-446655440200
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "rating": 4.5,
  "ratings_breakdown": {
    "technical_skills": 5,
    "communication": 4,
    "teamwork": 4,
    "problem_solving": 5,
    "initiative": 4
  },
  "strengths": "Alice demonstrates exceptional technical skills...",
  "improvements": "Could improve on documentation...",
  "comments": "Overall, Alice has had an excellent quarter...",
  "status": "submitted"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number | No | Overall rating (1-5) |
| `ratings_breakdown` | object | No | Category ratings |
| `strengths` | string | No | Strengths feedback |
| `improvements` | string | No | Areas for improvement |
| `comments` | string | No | Additional comments |
| `status` | string | No | `in_progress` or `submitted` |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "rating": 4.5,
    "status": "submitted",
    "submitted_at": "2026-01-28T10:30:00Z",
    "updated_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Not Reviewer (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You are not authorized to submit this review"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /reviews/:id/acknowledge

Employee acknowledges receiving the review.

### Request

```http
POST /api/v1/reviews/550e8400-e29b-41d4-a716-446655440200/acknowledge
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "employee_comments": "Thank you for the feedback. I agree with the areas for improvement and will work on better documentation."
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee_comments` | string | No | Employee's response to the review |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "status": "acknowledged",
    "employee_comments": "Thank you for the feedback...",
    "acknowledged_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Models

### Review Cycle Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name` | string | Cycle name |
| `description` | string | Description |
| `type` | string | annual, semi-annual, quarterly, monthly |
| `start_date` | date | Cycle start date |
| `end_date` | date | Cycle end date |
| `status` | string | draft, active, completed, cancelled |
| `settings` | object | Cycle configuration |
| `created_by` | object | Creator info |
| `stats` | object | Review statistics |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Review Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `cycle` | object | Review cycle info |
| `employee` | object | Employee being reviewed |
| `reviewer` | object | Person conducting review |
| `type` | string | self, manager, peer |
| `status` | string | pending, in_progress, submitted, acknowledged |
| `rating` | number | Overall rating (1-5) |
| `ratings_breakdown` | object | Category ratings |
| `strengths` | string | Strengths feedback |
| `improvements` | string | Improvement areas |
| `comments` | string | Additional comments |
| `employee_comments` | string | Employee response |
| `submitted_at` | datetime | Submission timestamp |
| `acknowledged_at` | datetime | Acknowledgment timestamp |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Review Statuses

| Status | Description |
|--------|-------------|
| `pending` | Review assigned but not started |
| `in_progress` | Reviewer has started but not submitted |
| `submitted` | Review submitted, awaiting acknowledgment |
| `acknowledged` | Employee has acknowledged the review |

## Review Types

| Type | Description |
|------|-------------|
| `self` | Self-assessment by the employee |
| `manager` | Evaluation by direct manager |
| `peer` | Feedback from peers (optional) |

---

## Ad-Hoc Reviews

Ad-hoc reviews are on-demand performance reviews triggered outside of scheduled review cycles. They follow the same self-review + manager-review workflow.

See [API Reference: Ad-Hoc Reviews](#ad-hoc-reviews-endpoints) below.

---

## Ad-Hoc Reviews Endpoints

### GET /adhoc-reviews

List ad-hoc reviews with filtering.

#### Request

```http
GET /api/v1/adhoc-reviews?status=initiated&employee_id=uuid
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `initiated`, `pending_acknowledgment`, `completed`, `cancelled` |
| `employee_id` | uuid | Filter by employee being reviewed |
| `manager_id` | uuid | Filter by employee's manager |
| `triggered_by` | uuid | Filter by who triggered the review |
| `due_before` | date | Filter by due date (before) |
| `overdue` | boolean | Filter to show only overdue reviews |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440400",
      "employee": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Alice",
        "last_name": "Johnson",
        "job_title": "Senior Developer",
        "department": {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Engineering"
        }
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "triggered_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "reason": "Mid-project performance check-in",
      "due_date": "2026-02-16",
      "review_form": {
        "id": "550e8400-e29b-41d4-a716-446655440500",
        "name": "Engineering Performance Review"
      },
      "status": "initiated",
      "self_review_status": "pending",
      "manager_review_status": "pending",
      "triggered_at": "2026-02-02T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 5,
      "total_pages": 1
    },
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

### POST /adhoc-reviews

Trigger a new ad-hoc review.

#### Request

```http
POST /api/v1/adhoc-reviews
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440003",
  "due_date": "2026-02-16",
  "reason": "Mid-project performance check-in",
  "review_form_id": null,
  "settings": {
    "self_review_required": true,
    "manager_review_required": true,
    "include_goals": true
  }
}
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee_id` | uuid | Yes | Employee to review |
| `due_date` | date | No | Deadline (default: 14 days from now) |
| `reason` | string | No | Context for the review (max 500 chars) |
| `review_form_id` | uuid | No | Specific form (null = use department form) |
| `settings.self_review_required` | boolean | No | Require self-review (default: true) |
| `settings.manager_review_required` | boolean | No | Require manager review (default: true) |
| `settings.include_goals` | boolean | No | Include employee goals (default: true) |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "employee": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "first_name": "Alice",
      "last_name": "Johnson"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe"
    },
    "due_date": "2026-02-16",
    "reason": "Mid-project performance check-in",
    "review_form": {
      "id": "550e8400-e29b-41d4-a716-446655440500",
      "name": "Engineering Performance Review",
      "version": "1.3"
    },
    "status": "initiated",
    "self_review_id": "550e8400-e29b-41d4-a716-446655440401",
    "manager_review_id": "550e8400-e29b-41d4-a716-446655440402",
    "notifications_sent": {
      "employee": true,
      "manager": true
    },
    "triggered_at": "2026-02-02T10:00:00Z",
    "created_at": "2026-02-02T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

#### Error - Employee Already Has Active Review (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Employee already has an active ad-hoc review"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

#### Error - Not Authorized (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You can only trigger reviews for employees in your reporting hierarchy"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

### GET /adhoc-reviews/:id

Get a single ad-hoc review with full details.

#### Request

```http
GET /api/v1/adhoc-reviews/550e8400-e29b-41d4-a716-446655440400
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "employee": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice.johnson@company.com",
      "job_title": "Senior Developer",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      }
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "job_title": "Engineering Manager"
    },
    "triggered_by": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "first_name": "Lisa",
      "last_name": "HR",
      "role": "hr"
    },
    "reason": "Mid-project performance check-in",
    "due_date": "2026-02-16",
    "review_form": {
      "id": "550e8400-e29b-41d4-a716-446655440500",
      "name": "Engineering Performance Review",
      "version": "1.3"
    },
    "settings": {
      "self_review_required": true,
      "manager_review_required": true,
      "include_goals": true
    },
    "status": "initiated",
    "self_review": {
      "id": "550e8400-e29b-41d4-a716-446655440401",
      "status": "submitted",
      "submitted_at": "2026-02-10T14:00:00Z"
    },
    "manager_review": {
      "id": "550e8400-e29b-41d4-a716-446655440402",
      "status": "pending",
      "submitted_at": null
    },
    "triggered_at": "2026-02-02T10:00:00Z",
    "completed_at": null,
    "created_at": "2026-02-02T10:00:00Z",
    "updated_at": "2026-02-10T14:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

### DELETE /adhoc-reviews/:id

Cancel an ad-hoc review (only if not completed).

#### Request

```http
DELETE /api/v1/adhoc-reviews/550e8400-e29b-41d4-a716-446655440400
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "status": "cancelled",
    "cancelled_at": "2026-02-02T11:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T11:00:00Z"
  }
}
```

---

### POST /adhoc-reviews/:id/remind

Send reminder notifications for an ad-hoc review.

#### Request

```http
POST /api/v1/adhoc-reviews/550e8400-e29b-41d4-a716-446655440400/remind
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "reminders_sent": {
      "employee": false,
      "manager": true
    },
    "message": "Reminder sent to manager (employee has already completed their review)"
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## Ad-Hoc Review Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `employee` | object | Employee being reviewed |
| `manager` | object | Employee's direct manager |
| `triggered_by` | object | User who triggered the review |
| `reason` | string | Context for the review |
| `due_date` | date | Deadline for completion |
| `review_form` | object | Review form used |
| `settings` | object | Review configuration |
| `status` | string | initiated, pending_acknowledgment, completed, cancelled |
| `self_review` | object | Self-review details |
| `manager_review` | object | Manager review details |
| `triggered_at` | datetime | When review was triggered |
| `completed_at` | datetime | When review was completed |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Related Documents

- [API Reference: Review Forms](/docs/api/review-forms.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)
- [PRD: Department Review Forms](/docs/prd/09-review-forms.md)
