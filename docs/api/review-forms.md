# Review Forms API

## Overview

API endpoints for managing department-specific performance review forms.

**Base Path:** `/review-forms`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/review-forms` | List review forms | Yes | HR, Admin |
| GET | `/review-forms/:id` | Get form by ID | Yes | HR, Admin, Dept Manager |
| POST | `/review-forms` | Create review form | Yes | HR, Admin |
| PUT | `/review-forms/:id` | Update review form | Yes | HR, Admin |
| DELETE | `/review-forms/:id` | Delete form (draft only) | Yes | Admin |
| POST | `/review-forms/:id/publish` | Publish form | Yes | HR, Admin |
| POST | `/review-forms/:id/archive` | Archive form | Yes | HR, Admin |
| POST | `/review-forms/:id/clone` | Clone form | Yes | HR, Admin |
| GET | `/review-forms/:id/preview` | Preview form | Yes | HR, Admin, Dept Manager |
| GET | `/review-forms/:id/versions` | Get form version history | Yes | HR, Admin |
| POST | `/review-forms/:id/assign` | Assign to departments | Yes | HR, Admin |
| GET | `/review-forms/default` | Get company default form | Yes | All |
| PUT | `/review-forms/:id/set-default` | Set as company default | Yes | Admin |

---

## GET /review-forms

List all review forms.

### Request

```http
GET /api/v1/review-forms?status=published
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `draft`, `published`, `archived` |
| `is_default` | boolean | Filter for default form |
| `search` | string | Search by name |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440500",
      "name": "Company Default Review Form",
      "description": "Standard review for all departments",
      "version": "2.1",
      "status": "published",
      "is_default": true,
      "sections_count": 5,
      "questions_count": 18,
      "assigned_departments": [],
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "published_at": "2026-01-15T09:00:00Z",
      "created_at": "2026-01-10T09:00:00Z",
      "updated_at": "2026-01-15T09:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440501",
      "name": "Engineering Performance Review",
      "description": "Technical skills and project delivery",
      "version": "1.3",
      "status": "published",
      "is_default": false,
      "sections_count": 6,
      "questions_count": 22,
      "assigned_departments": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Engineering"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440011",
          "name": "DevOps"
        }
      ],
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "published_at": "2026-01-20T10:00:00Z",
      "created_at": "2026-01-18T09:00:00Z",
      "updated_at": "2026-01-20T10:00:00Z"
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

## GET /review-forms/:id

Get a single review form with full details.

### Request

```http
GET /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440501
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440501",
    "name": "Engineering Performance Review",
    "description": "Technical skills and project delivery assessment",
    "instructions": "Please complete all sections honestly. Rating scale: 1 = Needs Improvement, 5 = Outstanding.",
    "version": "1.3",
    "status": "published",
    "is_default": false,
    "sections": [
      {
        "id": "section-001",
        "title": "Technical Skills",
        "description": "Evaluate technical competencies",
        "order": 1,
        "collapsible": false,
        "for_reviewer": "both",
        "questions": [
          {
            "id": "q-001",
            "text": "Rate code quality and adherence to best practices",
            "help_text": "Consider code reviews, testing, documentation",
            "type": "rating_scale",
            "required": true,
            "for_reviewer": "both",
            "weight": 1,
            "config": {
              "scale_type": "numeric",
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
          {
            "id": "q-002",
            "text": "Rate problem-solving and debugging skills",
            "help_text": "Consider complexity of issues resolved",
            "type": "rating_scale",
            "required": true,
            "for_reviewer": "both",
            "weight": 1,
            "config": {
              "scale_type": "numeric",
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
          }
        ]
      },
      {
        "id": "section-002",
        "title": "Goals Review",
        "description": "Review progress on assigned goals",
        "order": 2,
        "collapsible": true,
        "for_reviewer": "both",
        "questions": [
          {
            "id": "q-003",
            "text": "Rate overall goal achievement",
            "type": "goal_rating",
            "required": true,
            "for_reviewer": "both",
            "config": {
              "include_active_goals": true,
              "include_completed_goals": true
            }
          }
        ]
      },
      {
        "id": "section-003",
        "title": "Strengths & Development",
        "description": "Identify strengths and areas for improvement",
        "order": 3,
        "collapsible": false,
        "for_reviewer": "both",
        "questions": [
          {
            "id": "q-004",
            "text": "What are the top strengths demonstrated this period?",
            "type": "text_long",
            "required": true,
            "for_reviewer": "both",
            "config": {
              "min_length": 50,
              "max_length": 2000
            }
          },
          {
            "id": "q-005",
            "text": "What areas need improvement?",
            "type": "text_long",
            "required": true,
            "for_reviewer": "both",
            "config": {
              "min_length": 50,
              "max_length": 2000
            }
          }
        ]
      }
    ],
    "settings": {
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
    "assigned_departments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering",
        "form_type": "both",
        "effective_date": "2026-01-20"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "name": "DevOps",
        "form_type": "both",
        "effective_date": "2026-01-20"
      }
    ],
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "first_name": "Lisa",
      "last_name": "HR"
    },
    "published_at": "2026-01-20T10:00:00Z",
    "created_at": "2026-01-18T09:00:00Z",
    "updated_at": "2026-01-20T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## POST /review-forms

Create a new review form.

### Request

```http
POST /api/v1/review-forms
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Customer Support Review",
  "description": "Support metrics and customer satisfaction",
  "instructions": "Please rate performance based on the last quarter.",
  "sections": [
    {
      "title": "Support Metrics",
      "description": "Evaluate key support metrics",
      "order": 1,
      "for_reviewer": "both",
      "questions": [
        {
          "text": "Rate ticket resolution time",
          "type": "rating_scale",
          "required": true,
          "for_reviewer": "both",
          "config": {
            "scale_type": "numeric",
            "min": 1,
            "max": 5
          }
        },
        {
          "text": "Rate customer satisfaction scores",
          "type": "rating_scale",
          "required": true,
          "for_reviewer": "both",
          "config": {
            "scale_type": "numeric",
            "min": 1,
            "max": 5
          }
        }
      ]
    }
  ],
  "settings": {
    "rating_scale": {
      "min": 1,
      "max": 5
    }
  }
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Form name (max 255 chars) |
| `description` | string | No | Form description |
| `instructions` | string | No | Completion instructions |
| `sections` | array | Yes | Form sections with questions |
| `settings` | object | No | Form configuration |

### Section Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Section title |
| `description` | string | No | Section description |
| `order` | number | No | Display order |
| `collapsible` | boolean | No | Can be collapsed (default: false) |
| `for_reviewer` | string | No | `self`, `manager`, `both` (default: both) |
| `questions` | array | Yes | Section questions |

### Question Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Question text |
| `help_text` | string | No | Additional guidance |
| `type` | string | Yes | Question type |
| `required` | boolean | No | Must be answered (default: false) |
| `for_reviewer` | string | No | `self`, `manager`, `both` (default: both) |
| `weight` | number | No | For score calculation (default: 1) |
| `config` | object | No | Type-specific configuration |

### Question Types

| Type | Description | Config Options |
|------|-------------|----------------|
| `rating_scale` | Numeric rating | `min`, `max`, `labels` |
| `text_short` | Single line text | `max_length` |
| `text_long` | Multi-line text | `min_length`, `max_length` |
| `multiple_choice` | Select one option | `options` array |
| `checkbox` | Select multiple | `options` array |
| `yes_no` | Binary question | - |
| `goal_rating` | Rate linked goals | `include_active_goals`, `include_completed_goals` |
| `number` | Numeric input | `min`, `max` |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440502",
    "name": "Customer Support Review",
    "version": "0.1",
    "status": "draft",
    "sections_count": 1,
    "questions_count": 2,
    "created_at": "2026-02-02T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

## PUT /review-forms/:id

Update a review form. Editing a published form creates a new version.

### Request

```http
PUT /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440502
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Customer Support Review - Updated",
  "sections": [
    {
      "title": "Support Metrics",
      "order": 1,
      "questions": [
        {
          "text": "Rate ticket resolution time",
          "type": "rating_scale",
          "required": true
        }
      ]
    },
    {
      "title": "Customer Satisfaction",
      "order": 2,
      "questions": [
        {
          "text": "Rate overall customer feedback",
          "type": "rating_scale",
          "required": true
        }
      ]
    }
  ]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440502",
    "name": "Customer Support Review - Updated",
    "version": "0.2",
    "status": "draft",
    "updated_at": "2026-02-02T11:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T11:00:00Z"
  }
}
```

---

## DELETE /review-forms/:id

Delete a review form (only draft status).

### Request

```http
DELETE /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440502
Authorization: Bearer <token>
```

### Response (204 No Content)

No response body.

### Error - Cannot Delete Published Form (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete a published form. Archive it instead."
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## POST /review-forms/:id/publish

Publish a draft form, making it available for use.

### Request

```http
POST /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440502/publish
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440502",
    "name": "Customer Support Review",
    "version": "1.0",
    "status": "published",
    "published_at": "2026-02-02T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

## POST /review-forms/:id/archive

Archive a published form (retire from active use).

### Request

```http
POST /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440502/archive
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440502",
    "status": "archived",
    "archived_at": "2026-02-02T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

### Error - Cannot Archive Default Form (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot archive the company default form. Set another form as default first."
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## POST /review-forms/:id/clone

Clone an existing form.

### Request

```http
POST /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440501/clone
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Engineering Review - Q2 2026"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440503",
    "name": "Engineering Review - Q2 2026",
    "version": "0.1",
    "status": "draft",
    "cloned_from": {
      "id": "550e8400-e29b-41d4-a716-446655440501",
      "name": "Engineering Performance Review",
      "version": "1.3"
    },
    "created_at": "2026-02-02T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

## GET /review-forms/:id/versions

Get form version history.

### Request

```http
GET /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440501/versions
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "version": "1.3",
      "changed_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "change_summary": "Added new technical skills questions",
      "created_at": "2026-01-20T10:00:00Z",
      "reviews_using": 12
    },
    {
      "version": "1.2",
      "changed_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "change_summary": "Updated rating scale labels",
      "created_at": "2026-01-15T09:00:00Z",
      "reviews_using": 45
    },
    {
      "version": "1.1",
      "changed_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "change_summary": "Added goals review section",
      "created_at": "2026-01-10T09:00:00Z",
      "reviews_using": 78
    },
    {
      "version": "1.0",
      "changed_by": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "first_name": "Lisa",
        "last_name": "HR"
      },
      "change_summary": "Initial version",
      "created_at": "2026-01-05T09:00:00Z",
      "reviews_using": 150
    }
  ],
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## POST /review-forms/:id/assign

Assign form to departments.

### Request

```http
POST /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440501/assign
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "departments": [
    {
      "department_id": "550e8400-e29b-41d4-a716-446655440010",
      "form_type": "both",
      "effective_date": "2026-02-01"
    },
    {
      "department_id": "550e8400-e29b-41d4-a716-446655440011",
      "form_type": "both",
      "effective_date": "2026-02-01"
    }
  ]
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `departments` | array | Yes | Department assignments |
| `departments[].department_id` | uuid | Yes | Department ID |
| `departments[].form_type` | string | No | `self`, `manager`, `both` (default: both) |
| `departments[].effective_date` | date | No | When active (default: today) |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "assigned": 2,
    "departments": [
      {
        "department_id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering",
        "status": "assigned"
      },
      {
        "department_id": "550e8400-e29b-41d4-a716-446655440011",
        "name": "DevOps",
        "status": "assigned"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

## GET /review-forms/default

Get the company default form.

### Request

```http
GET /api/v1/review-forms/default
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440500",
    "name": "Company Default Review Form",
    "version": "2.1",
    "status": "published",
    "is_default": true,
    "sections": [
      // ... full form structure
    ]
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
```

---

## PUT /review-forms/:id/set-default

Set a form as the company default.

### Request

```http
PUT /api/v1/review-forms/550e8400-e29b-41d4-a716-446655440500/set-default
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440500",
    "is_default": true,
    "message": "Form set as company default"
  },
  "meta": {
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

---

## Data Models

### Review Form Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name` | string | Form name |
| `description` | string | Form description |
| `instructions` | string | Completion instructions |
| `version` | string | Version number |
| `status` | string | draft, published, archived |
| `is_default` | boolean | Company default form |
| `sections` | array | Form sections |
| `sections_count` | integer | Total number of sections |
| `questions_count` | integer | Total number of questions across all sections |
| `settings` | object | Form configuration |
| `assigned_departments` | array | Departments using this form |
| `created_by` | object | Creator info |
| `published_at` | datetime | When published |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Form Status

| Status | Description |
|--------|-------------|
| `draft` | Being edited, not available for use |
| `published` | Active and available for reviews |
| `archived` | Retired, kept for historical records |

---

## Related Documents

- [API Reference: Reviews](/docs/api/reviews.md)
- [PRD: Department Review Forms](/docs/prd/09-review-forms.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)
