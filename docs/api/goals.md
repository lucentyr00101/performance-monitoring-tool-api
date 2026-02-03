# Goals & OKRs API

## Overview

Goals and Objectives & Key Results (OKRs) management endpoints.

**Base Path:** `/goals`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/goals` | List goals | Yes | All |
| GET | `/goals/:id` | Get goal by ID | Yes | All |
| POST | `/goals` | Create goal | Yes | All |
| PUT | `/goals/:id` | Update goal | Yes | Owner/Manager |
| DELETE | `/goals/:id` | Delete goal | Yes | Owner/Manager |
| PATCH | `/goals/:id/progress` | Update progress | Yes | Owner |
| GET | `/goals/:id/key-results` | Get key results | Yes | All |
| POST | `/goals/:id/key-results` | Add key result | Yes | Owner |
| PUT | `/goals/:id/key-results/:krId` | Update key result | Yes | Owner |
| DELETE | `/goals/:id/key-results/:krId` | Delete key result | Yes | Owner |

---

## GET /goals

List goals with filtering and pagination.

### Request

```http
GET /api/v1/goals?type=individual&status=active&owner_id=uuid
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter: `individual`, `team`, `department`, `company` |
| `status` | string | Filter: `draft`, `active`, `completed`, `cancelled` |
| `owner_id` | uuid | Filter by goal owner |
| `department_id` | uuid | Filter by department |
| `parent_goal_id` | uuid | Filter by parent goal |
| `due_before` | date | Goals due before date |
| `due_after` | date | Goals due after date |
| `search` | string | Search in title/description |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 20) |
| `sort_by` | string | Sort field (default: `due_date`) |
| `sort_order` | string | `asc` or `desc` |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "title": "Increase team velocity by 20%",
      "description": "Improve sprint delivery and reduce blockers",
      "type": "team",
      "status": "active",
      "progress": 65,
      "owner": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://cdn.example.com/avatars/john.jpg"
      },
      "parent_goal": {
        "id": "550e8400-e29b-41d4-a716-446655440090",
        "title": "Improve Engineering Efficiency"
      },
      "start_date": "2026-01-01",
      "due_date": "2026-03-31",
      "key_results": {
        "total": 3,
        "completed": 1
      },
      "created_at": "2026-01-02T09:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "title": "Complete AWS Solutions Architect certification",
      "description": "Obtain AWS certification to improve cloud expertise",
      "type": "individual",
      "status": "active",
      "progress": 80,
      "owner": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Alice",
        "last_name": "Johnson",
        "avatar_url": null
      },
      "parent_goal": null,
      "start_date": "2026-01-15",
      "due_date": "2026-02-28",
      "key_results": {
        "total": 2,
        "completed": 1
      },
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 45,
      "total_pages": 3
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /goals/:id

Get a single goal with full details.

### Request

```http
GET /api/v1/goals/550e8400-e29b-41d4-a716-446655440100
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "title": "Increase team velocity by 20%",
    "description": "Improve sprint delivery and reduce blockers to achieve a 20% increase in story points completed per sprint.",
    "type": "team",
    "status": "active",
    "progress": 65,
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@company.com",
      "job_title": "Engineering Manager",
      "avatar_url": "https://cdn.example.com/avatars/john.jpg"
    },
    "parent_goal": {
      "id": "550e8400-e29b-41d4-a716-446655440090",
      "title": "Improve Engineering Efficiency",
      "type": "department",
      "status": "active"
    },
    "child_goals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440102",
        "title": "Reduce code review turnaround time",
        "type": "individual",
        "status": "active",
        "progress": 70
      }
    ],
    "key_results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440150",
        "title": "Average story points per sprint",
        "description": "Increase from 40 to 48 points per sprint",
        "target_value": 48,
        "current_value": 44,
        "unit": "points",
        "progress": 50,
        "status": "in_progress"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440151",
        "title": "Sprint completion rate",
        "description": "Achieve 95% sprint completion rate",
        "target_value": 95,
        "current_value": 92,
        "unit": "%",
        "progress": 80,
        "status": "in_progress"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440152",
        "title": "Reduce blocked tickets",
        "description": "Reduce average blocked tickets to under 2 per sprint",
        "target_value": 2,
        "current_value": 2,
        "unit": "tickets",
        "progress": 100,
        "status": "completed"
      }
    ],
    "start_date": "2026-01-01",
    "due_date": "2026-03-31",
    "completed_at": null,
    "created_at": "2026-01-02T09:00:00Z",
    "updated_at": "2026-01-25T14:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /goals

Create a new goal.

### Request

```http
POST /api/v1/goals
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Launch new product feature",
  "description": "Successfully launch the analytics dashboard feature by end of Q1",
  "type": "team",
  "owner_id": "550e8400-e29b-41d4-a716-446655440001",
  "parent_goal_id": "550e8400-e29b-41d4-a716-446655440090",
  "start_date": "2026-02-01",
  "due_date": "2026-03-31",
  "key_results": [
    {
      "title": "Feature development complete",
      "description": "All planned features developed and tested",
      "target_value": 100,
      "unit": "%"
    },
    {
      "title": "User adoption rate",
      "description": "Achieve 50% adoption within first week",
      "target_value": 50,
      "unit": "%"
    }
  ]
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Goal title (max 255 chars) |
| `description` | string | No | Detailed description |
| `type` | string | Yes | `individual`, `team`, `department`, `company` |
| `owner_id` | uuid | Yes | Goal owner's employee ID |
| `parent_goal_id` | uuid | No | Parent goal for alignment |
| `start_date` | date | No | Goal start date |
| `due_date` | date | No | Goal due date |
| `key_results` | array | No | Initial key results |

### Key Result Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Key result title |
| `description` | string | No | Description |
| `target_value` | number | Yes | Target value to achieve |
| `unit` | string | No | Unit of measurement |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440110",
    "title": "Launch new product feature",
    "description": "Successfully launch the analytics dashboard feature by end of Q1",
    "type": "team",
    "status": "draft",
    "progress": 0,
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe"
    },
    "parent_goal": {
      "id": "550e8400-e29b-41d4-a716-446655440090",
      "title": "Improve Engineering Efficiency"
    },
    "key_results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440160",
        "title": "Feature development complete",
        "target_value": 100,
        "current_value": 0,
        "unit": "%",
        "status": "in_progress"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440161",
        "title": "User adoption rate",
        "target_value": 50,
        "current_value": 0,
        "unit": "%",
        "status": "in_progress"
      }
    ],
    "start_date": "2026-02-01",
    "due_date": "2026-03-31",
    "created_at": "2026-01-28T10:30:00Z",
    "updated_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /goals/:id

Update an existing goal.

### Request

```http
PUT /api/v1/goals/550e8400-e29b-41d4-a716-446655440100
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Increase team velocity by 25%",
  "status": "active",
  "due_date": "2026-04-15"
}
```

### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Goal title |
| `description` | string | Description |
| `type` | string | Goal type |
| `status` | string | `draft`, `active`, `completed`, `cancelled` |
| `owner_id` | uuid | Owner's employee ID |
| `parent_goal_id` | uuid | Parent goal ID (null to remove) |
| `start_date` | date | Start date |
| `due_date` | date | Due date |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "title": "Increase team velocity by 25%",
    "status": "active",
    "due_date": "2026-04-15",
    "updated_at": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

---

## DELETE /goals/:id

Delete a goal.

### Request

```http
DELETE /api/v1/goals/550e8400-e29b-41d4-a716-446655440110
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

#### Error - Has Child Goals (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete goal with child goals. Delete child goals first."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PATCH /goals/:id/progress

Update goal progress (auto-calculated from key results or manual).

### Request

```http
PATCH /api/v1/goals/550e8400-e29b-41d4-a716-446655440100/progress
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "progress": 75,
  "note": "Completed sprint 3 ahead of schedule"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `progress` | integer | Yes | Progress percentage (0-100) |
| `note` | string | No | Progress update note |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "progress": 75,
    "status": "active",
    "updated_at": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

---

## GET /goals/:id/key-results

Get all key results for a goal.

### Request

```http
GET /api/v1/goals/550e8400-e29b-41d4-a716-446655440100/key-results
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440150",
      "title": "Average story points per sprint",
      "description": "Increase from 40 to 48 points per sprint",
      "target_value": 48,
      "current_value": 44,
      "unit": "points",
      "progress": 50,
      "status": "in_progress",
      "created_at": "2026-01-02T09:00:00Z",
      "updated_at": "2026-01-25T14:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440151",
      "title": "Sprint completion rate",
      "description": "Achieve 95% sprint completion rate",
      "target_value": 95,
      "current_value": 92,
      "unit": "%",
      "progress": 80,
      "status": "in_progress",
      "created_at": "2026-01-02T09:00:00Z",
      "updated_at": "2026-01-25T14:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440152",
      "title": "Reduce blocked tickets",
      "description": "Reduce average blocked tickets to under 2 per sprint",
      "target_value": 2,
      "current_value": 2,
      "unit": "tickets",
      "progress": 100,
      "status": "completed",
      "created_at": "2026-01-02T09:00:00Z",
      "updated_at": "2026-01-20T11:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /goals/:id/key-results

Add a key result to a goal.

### Request

```http
POST /api/v1/goals/550e8400-e29b-41d4-a716-446655440100/key-results
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Reduce bug escape rate",
  "description": "Reduce bugs found in production to under 5%",
  "target_value": 5,
  "unit": "%"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Key result title |
| `description` | string | No | Description |
| `target_value` | number | Yes | Target value |
| `unit` | string | No | Unit of measurement |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440153",
    "goal_id": "550e8400-e29b-41d4-a716-446655440100",
    "title": "Reduce bug escape rate",
    "description": "Reduce bugs found in production to under 5%",
    "target_value": 5,
    "current_value": 0,
    "unit": "%",
    "progress": 0,
    "status": "in_progress",
    "created_at": "2026-01-28T10:30:00Z",
    "updated_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /goals/:id/key-results/:krId

Update a key result.

### Request

```http
PUT /api/v1/goals/550e8400-e29b-41d4-a716-446655440100/key-results/550e8400-e29b-41d4-a716-446655440150
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "current_value": 46,
  "status": "in_progress"
}
```

### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Key result title |
| `description` | string | Description |
| `target_value` | number | Target value |
| `current_value` | number | Current value |
| `unit` | string | Unit of measurement |
| `status` | string | `in_progress`, `completed`, `cancelled` |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440150",
    "title": "Average story points per sprint",
    "target_value": 48,
    "current_value": 46,
    "unit": "points",
    "progress": 75,
    "status": "in_progress",
    "updated_at": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

---

## DELETE /goals/:id/key-results/:krId

Delete a key result.

### Request

```http
DELETE /api/v1/goals/550e8400-e29b-41d4-a716-446655440100/key-results/550e8400-e29b-41d4-a716-446655440153
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

---

## Data Models

### Goal Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `title` | string | Goal title |
| `description` | string | Detailed description |
| `type` | string | individual, team, department, company |
| `status` | string | draft, active, completed, cancelled |
| `progress` | integer | Progress percentage (0-100) |
| `owner` | object | Goal owner info |
| `parent_goal` | object | Parent goal for alignment |
| `child_goals` | array | Aligned child goals |
| `key_results` | array | Key results |
| `start_date` | date | Start date |
| `due_date` | date | Due date |
| `completed_at` | datetime | Completion timestamp |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Key Result Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `goal_id` | uuid | Parent goal ID |
| `title` | string | Key result title |
| `description` | string | Description |
| `target_value` | number | Target value |
| `current_value` | number | Current progress value |
| `unit` | string | Unit of measurement |
| `progress` | integer | Calculated progress (0-100) |
| `status` | string | in_progress, completed, cancelled |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Goal Types

| Type | Description | Who Can Create |
|------|-------------|----------------|
| `individual` | Personal development goals | All employees |
| `team` | Team-level objectives | Managers |
| `department` | Department-wide goals | Dept heads, HR |
| `company` | Company-wide objectives | Admin, HR, C-suite |

## Goal Statuses

| Status | Description |
|--------|-------------|
| `draft` | Goal created but not yet active |
| `active` | Goal is in progress |
| `completed` | Goal achieved (progress = 100%) |
| `cancelled` | Goal was cancelled |
