# Analytics API

## Overview

Analytics and reporting endpoints for performance insights and metrics.

**Base Path:** `/analytics`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/analytics/dashboard` | Dashboard metrics | Yes | All |
| GET | `/analytics/goals` | Goal analytics | Yes | Manager+ |
| GET | `/analytics/reviews` | Review analytics | Yes | Manager+ |
| GET | `/analytics/team/:id` | Team performance | Yes | Manager+ |
| GET | `/analytics/department/:id` | Department metrics | Yes | Manager+ |
| GET | `/analytics/export` | Export report data | Yes | HR+ |

---

## GET /analytics/dashboard

Get role-specific dashboard metrics.

### Request

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer <token>
```

### Response - Employee View

```json
{
  "success": true,
  "data": {
    "user_role": "employee",
    "overview": {
      "active_goals": 3,
      "completed_goals": 5,
      "pending_reviews": 1,
      "average_goal_progress": 65
    },
    "goals_summary": {
      "total": 8,
      "by_status": {
        "active": 3,
        "completed": 5,
        "draft": 0
      },
      "upcoming_deadlines": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440101",
          "title": "Complete AWS certification",
          "due_date": "2026-02-28",
          "progress": 80,
          "days_remaining": 31
        }
      ]
    },
    "reviews_summary": {
      "pending_self_assessments": 1,
      "recent_reviews": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440200",
          "cycle_name": "Q4 2025 Performance Review",
          "rating": 4.5,
          "status": "acknowledged"
        }
      ]
    },
    "notifications": {
      "unread_count": 3,
      "recent": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440400",
          "type": "review_reminder",
          "title": "Self-assessment due soon",
          "message": "Your Q1 2026 self-assessment is due in 3 days",
          "created_at": "2026-01-28T08:00:00Z"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### Response - Manager View

```json
{
  "success": true,
  "data": {
    "user_role": "manager",
    "overview": {
      "direct_reports": 5,
      "team_active_goals": 12,
      "pending_reviews_to_complete": 3,
      "team_avg_goal_progress": 58
    },
    "team_summary": {
      "members": 5,
      "by_status": {
        "on_track": 4,
        "at_risk": 1,
        "needs_attention": 0
      }
    },
    "goals_summary": {
      "team_goals": {
        "total": 12,
        "active": 8,
        "completed_this_quarter": 4,
        "average_progress": 58
      },
      "personal_goals": {
        "active": 2,
        "average_progress": 70
      }
    },
    "reviews_summary": {
      "pending_to_complete": 3,
      "completed_this_cycle": 2,
      "team_average_rating": 4.2
    },
    "quick_actions": [
      {
        "type": "review_pending",
        "title": "Complete review for Alice Johnson",
        "link": "/reviews/550e8400-e29b-41d4-a716-446655440201"
      },
      {
        "type": "goal_overdue",
        "title": "Bob's goal is overdue",
        "link": "/goals/550e8400-e29b-41d4-a716-446655440102"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### Response - HR/Admin View

```json
{
  "success": true,
  "data": {
    "user_role": "hr",
    "overview": {
      "total_employees": 156,
      "active_review_cycles": 1,
      "organization_goal_completion": 72,
      "review_completion_rate": 94.5
    },
    "employees_summary": {
      "total": 156,
      "by_status": {
        "active": 150,
        "inactive": 6
      },
      "new_this_month": 3,
      "departures_this_month": 1
    },
    "goals_summary": {
      "organization_wide": {
        "total_active": 245,
        "average_progress": 62,
        "by_type": {
          "individual": 180,
          "team": 45,
          "department": 15,
          "company": 5
        }
      }
    },
    "reviews_summary": {
      "active_cycle": {
        "id": "550e8400-e29b-41d4-a716-446655440301",
        "name": "Q1 2026 Performance Review",
        "completion_rate": 45,
        "days_remaining": 62
      },
      "organization_average_rating": 3.9
    },
    "departments_overview": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering",
        "employee_count": 25,
        "goal_completion": 68,
        "avg_review_rating": 4.1
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "name": "Product",
        "employee_count": 12,
        "goal_completion": 75,
        "avg_review_rating": 4.0
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/goals

Get organization-wide goal analytics.

### Request

```http
GET /api/v1/analytics/goals?period=quarter&year=2026&quarter=1
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `month`, `quarter`, `year` |
| `year` | integer | Year (e.g., 2026) |
| `quarter` | integer | Quarter (1-4) |
| `month` | integer | Month (1-12) |
| `department_id` | uuid | Filter by department |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "type": "quarter",
      "year": 2026,
      "quarter": 1,
      "start_date": "2026-01-01",
      "end_date": "2026-03-31"
    },
    "summary": {
      "total_goals": 245,
      "completed": 45,
      "active": 180,
      "cancelled": 20,
      "completion_rate": 18.4,
      "average_progress": 42
    },
    "by_type": [
      { "type": "individual", "count": 180, "completion_rate": 22, "avg_progress": 45 },
      { "type": "team", "count": 45, "completion_rate": 15, "avg_progress": 38 },
      { "type": "department", "count": 15, "completion_rate": 10, "avg_progress": 35 },
      { "type": "company", "count": 5, "completion_rate": 0, "avg_progress": 30 }
    ],
    "by_department": [
      { "department": "Engineering", "total": 65, "completion_rate": 25, "avg_progress": 48 },
      { "department": "Product", "total": 35, "completion_rate": 20, "avg_progress": 42 },
      { "department": "Sales", "total": 50, "completion_rate": 18, "avg_progress": 40 },
      { "department": "Marketing", "total": 30, "completion_rate": 15, "avg_progress": 38 }
    ],
    "trends": {
      "monthly": [
        { "month": "2026-01", "created": 80, "completed": 15, "avg_progress": 25 },
        { "month": "2026-02", "created": 45, "completed": 20, "avg_progress": 38 },
        { "month": "2026-03", "created": 30, "completed": 10, "avg_progress": 42 }
      ]
    },
    "top_performers": [
      {
        "employee": { "id": "uuid", "name": "Alice Johnson", "department": "Engineering" },
        "goals_completed": 4,
        "avg_completion_time_days": 25
      },
      {
        "employee": { "id": "uuid", "name": "Bob Williams", "department": "Product" },
        "goals_completed": 3,
        "avg_completion_time_days": 30
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/reviews

Get review cycle analytics.

### Request

```http
GET /api/v1/analytics/reviews?cycle_id=uuid
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | uuid | Specific review cycle (optional) |
| `year` | integer | Filter by year |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "cycle": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "name": "Q4 2025 Performance Review",
      "status": "completed"
    },
    "summary": {
      "total_reviews": 150,
      "completed": 142,
      "pending": 8,
      "completion_rate": 94.67,
      "average_rating": 3.85,
      "rating_distribution": {
        "1": 2,
        "2": 8,
        "3": 45,
        "4": 65,
        "5": 30
      }
    },
    "by_type": [
      { "type": "self", "total": 75, "completed": 72, "avg_rating": 3.9 },
      { "type": "manager", "total": 75, "completed": 70, "avg_rating": 3.8 }
    ],
    "by_department": [
      {
        "department": "Engineering",
        "total": 50,
        "completed": 48,
        "completion_rate": 96,
        "avg_rating": 4.1
      },
      {
        "department": "Product",
        "total": 24,
        "completed": 24,
        "completion_rate": 100,
        "avg_rating": 3.9
      },
      {
        "department": "Sales",
        "total": 40,
        "completed": 36,
        "completion_rate": 90,
        "avg_rating": 3.7
      }
    ],
    "timeline": {
      "daily_completions": [
        { "date": "2025-12-01", "completed": 5 },
        { "date": "2025-12-02", "completed": 12 },
        { "date": "2025-12-03", "completed": 18 }
      ]
    },
    "categories_breakdown": {
      "technical_skills": { "avg": 4.0, "distribution": { "1": 1, "2": 5, "3": 20, "4": 50, "5": 66 } },
      "communication": { "avg": 3.8, "distribution": { "1": 2, "2": 8, "3": 30, "4": 55, "5": 47 } },
      "teamwork": { "avg": 3.9, "distribution": { "1": 1, "2": 6, "3": 25, "4": 58, "5": 52 } }
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/team/:id

Get team performance analytics for a manager.

### Request

```http
GET /api/v1/analytics/team/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "job_title": "Engineering Manager"
    },
    "team_size": 5,
    "summary": {
      "total_active_goals": 12,
      "avg_goal_progress": 58,
      "goals_completed_this_quarter": 4,
      "pending_reviews": 2,
      "team_avg_rating": 4.2
    },
    "members": [
      {
        "employee": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Alice Johnson",
          "job_title": "Senior Developer",
          "avatar_url": null
        },
        "goals": {
          "active": 3,
          "completed": 2,
          "avg_progress": 75
        },
        "latest_review": {
          "rating": 4.5,
          "cycle": "Q4 2025"
        },
        "status": "on_track"
      },
      {
        "employee": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "Bob Williams",
          "job_title": "Software Engineer",
          "avatar_url": "https://cdn.example.com/bob.jpg"
        },
        "goals": {
          "active": 2,
          "completed": 1,
          "avg_progress": 45
        },
        "latest_review": {
          "rating": 3.8,
          "cycle": "Q4 2025"
        },
        "status": "at_risk"
      }
    ],
    "goals_by_status": {
      "active": 8,
      "completed": 4,
      "overdue": 1
    },
    "performance_trend": [
      { "period": "Q2 2025", "avg_rating": 3.9, "goal_completion": 70 },
      { "period": "Q3 2025", "avg_rating": 4.0, "goal_completion": 75 },
      { "period": "Q4 2025", "avg_rating": 4.2, "goal_completion": 80 }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/department/:id

Get department performance analytics.

### Request

```http
GET /api/v1/analytics/department/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering",
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe"
      }
    },
    "employee_count": 25,
    "summary": {
      "total_goals": 65,
      "goal_completion_rate": 68,
      "avg_goal_progress": 58,
      "review_completion_rate": 96,
      "avg_review_rating": 4.1
    },
    "sub_departments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "name": "Frontend Engineering",
        "employee_count": 8,
        "goal_completion": 72,
        "avg_rating": 4.2
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440013",
        "name": "Backend Engineering",
        "employee_count": 10,
        "goal_completion": 65,
        "avg_rating": 4.0
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440014",
        "name": "DevOps",
        "employee_count": 5,
        "goal_completion": 70,
        "avg_rating": 4.1
      }
    ],
    "goals_breakdown": {
      "by_type": [
        { "type": "individual", "count": 45, "avg_progress": 60 },
        { "type": "team", "count": 15, "avg_progress": 55 },
        { "type": "department", "count": 5, "avg_progress": 50 }
      ],
      "by_status": {
        "active": 40,
        "completed": 20,
        "cancelled": 5
      }
    },
    "reviews_breakdown": {
      "avg_rating": 4.1,
      "by_category": {
        "technical_skills": 4.3,
        "communication": 3.9,
        "teamwork": 4.0,
        "problem_solving": 4.2
      }
    },
    "trend": [
      { "quarter": "Q1 2025", "goal_completion": 60, "avg_rating": 3.8 },
      { "quarter": "Q2 2025", "goal_completion": 65, "avg_rating": 3.9 },
      { "quarter": "Q3 2025", "goal_completion": 68, "avg_rating": 4.0 },
      { "quarter": "Q4 2025", "goal_completion": 72, "avg_rating": 4.1 }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/export

Export analytics data as downloadable file.

### Request

```http
GET /api/v1/analytics/export?type=goals&format=csv&period=quarter&year=2026&quarter=1
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `goals`, `reviews`, `employees` |
| `format` | string | No | `csv`, `xlsx`, `pdf` (default: csv) |
| `period` | string | No | `month`, `quarter`, `year` |
| `year` | integer | No | Year |
| `quarter` | integer | No | Quarter (1-4) |
| `department_id` | uuid | No | Filter by department |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "download_url": "https://api.example.com/downloads/report-abc123.csv",
    "expires_at": "2026-01-28T11:30:00Z",
    "file_name": "goals-report-q1-2026.csv",
    "file_size": "125KB",
    "record_count": 245
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Notes

### Performance Status

| Status | Description | Criteria |
|--------|-------------|----------|
| `on_track` | Employee performing well | Goals > 50% progress, positive reviews |
| `at_risk` | May need attention | Goals < 30% progress or overdue |
| `needs_attention` | Requires immediate intervention | Multiple overdue goals, low ratings |

### Time Periods

| Period | Description |
|--------|-------------|
| `month` | Single month data |
| `quarter` | Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec) |
| `year` | Full calendar year |

### Rate Limiting

Analytics endpoints are rate-limited to prevent abuse:
- Dashboard: 60 requests/minute
- Export: 10 requests/hour
