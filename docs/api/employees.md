# Employees API

## Overview

Employee management endpoints for CRUD operations and employee-related queries.

**Base Path:** `/employees`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/employees` | List all employees | Yes | All |
| GET | `/employees/:id` | Get employee by ID | Yes | All |
| POST | `/employees` | Create employee | Yes | Admin, HR |
| PUT | `/employees/:id` | Update employee | Yes | Admin, HR |
| DELETE | `/employees/:id` | Delete employee | Yes | Admin |
| GET | `/employees/:id/goals` | Get employee goals | Yes | All |
| GET | `/employees/:id/reviews` | Get employee reviews | Yes | All |
| GET | `/employees/:id/team` | Get direct reports | Yes | Manager+ |

---

## GET /employees

List all employees with filtering and pagination.

### Request

```http
GET /api/v1/employees?page=1&per_page=20&status=active&department_id=uuid
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 20, max: 100) |
| `status` | string | No | Filter by status: `active`, `inactive` |
| `department_id` | uuid | No | Filter by department |
| `manager_id` | uuid | No | Filter by manager |
| `search` | string | No | Search by name or email |
| `sort_by` | string | No | Sort field (default: `last_name`) |
| `sort_order` | string | No | `asc` or `desc` (default: `asc`) |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "employee_code": "EMP-001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@company.com",
      "job_title": "Engineering Manager",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "hire_date": "2022-03-15",
      "status": "active",
      "avatar_url": "https://cdn.example.com/avatars/john-doe.jpg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "employee_code": "EMP-002",
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice.johnson@company.com",
      "job_title": "Senior Developer",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "hire_date": "2023-01-10",
      "status": "active",
      "avatar_url": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 156,
      "total_pages": 8
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id

Get a single employee by ID.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_code": "EMP-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-123-4567",
    "job_title": "Engineering Manager",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering",
      "parent": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "name": "Technology"
      }
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "first_name": "Jane",
      "last_name": "Smith",
      "job_title": "VP of Engineering",
      "email": "jane.smith@company.com"
    },
    "hire_date": "2022-03-15",
    "employment_type": "full-time",
    "status": "active",
    "avatar_url": "https://cdn.example.com/avatars/john-doe.jpg",
    "direct_reports_count": 5,
    "created_at": "2022-03-15T09:00:00Z",
    "updated_at": "2026-01-15T14:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /employees

Create a new employee.

### Request

```http
POST /api/v1/employees
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "first_name": "Bob",
  "last_name": "Williams",
  "email": "bob.williams@company.com",
  "phone": "+1-555-987-6543",
  "job_title": "Software Engineer",
  "department_id": "550e8400-e29b-41d4-a716-446655440010",
  "manager_id": "550e8400-e29b-41d4-a716-446655440001",
  "hire_date": "2026-02-01",
  "employment_type": "full-time",
  "create_user_account": true,
  "user_role": "employee"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | First name (max 100 chars) |
| `last_name` | string | Yes | Last name (max 100 chars) |
| `email` | string | Yes | Unique email address |
| `phone` | string | No | Phone number |
| `job_title` | string | No | Job title (max 100 chars) |
| `department_id` | uuid | No | Department ID |
| `manager_id` | uuid | No | Manager's employee ID |
| `hire_date` | date | No | Hire date (YYYY-MM-DD) |
| `employment_type` | string | No | `full-time`, `part-time`, `contract` |
| `avatar_url` | string | No | Avatar image URL |
| `create_user_account` | boolean | No | Create login account (default: true) |
| `user_role` | string | No | User role if creating account |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "user_id": "550e8400-e29b-41d4-a716-446655440051",
    "employee_code": "EMP-157",
    "first_name": "Bob",
    "last_name": "Williams",
    "email": "bob.williams@company.com",
    "phone": "+1-555-987-6543",
    "job_title": "Software Engineer",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe"
    },
    "hire_date": "2026-02-01",
    "employment_type": "full-time",
    "status": "active",
    "avatar_url": null,
    "created_at": "2026-01-28T10:30:00Z",
    "updated_at": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Validation (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Forbidden (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You do not have permission to create employees"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /employees/:id

Update an existing employee.

### Request

```http
PUT /api/v1/employees/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "job_title": "Senior Engineering Manager",
  "phone": "+1-555-111-2222",
  "department_id": "550e8400-e29b-41d4-a716-446655440011"
}
```

### Request Body

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `job_title` | string | Job title |
| `department_id` | uuid | Department ID |
| `manager_id` | uuid | Manager's employee ID |
| `employment_type` | string | Employment type |
| `status` | string | `active` or `inactive` |
| `avatar_url` | string | Avatar URL |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "employee_code": "EMP-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-111-2222",
    "job_title": "Senior Engineering Manager",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Platform Engineering"
    },
    "status": "active",
    "updated_at": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

---

## DELETE /employees/:id

Delete an employee (soft delete - sets status to inactive).

### Request

```http
DELETE /api/v1/employees/550e8400-e29b-41d4-a716-446655440050
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

#### Error - Has Direct Reports (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete employee with direct reports. Reassign employees first."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/goals

Get all goals for an employee.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/goals?status=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `draft`, `active`, `completed`, `cancelled` |
| `type` | string | Filter: `individual`, `team`, `department` |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "title": "Improve team velocity by 20%",
      "type": "team",
      "status": "active",
      "progress": 65,
      "due_date": "2026-03-31",
      "key_results_count": 3,
      "key_results_completed": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "title": "Complete AWS certification",
      "type": "individual",
      "status": "active",
      "progress": 80,
      "due_date": "2026-02-28",
      "key_results_count": 2,
      "key_results_completed": 1
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 5,
      "total_pages": 1
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/reviews

Get all reviews for an employee.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/reviews
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | uuid | Filter by review cycle |
| `type` | string | Filter: `self`, `manager`, `peer` |
| `status` | string | Filter: `pending`, `submitted`, `acknowledged` |

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
        "name": "Q4 2025 Review"
      },
      "type": "manager",
      "reviewer": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "status": "submitted",
      "rating": 4.5,
      "submitted_at": "2025-12-20T15:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/team

Get direct reports for a manager.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/team
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice.johnson@company.com",
      "job_title": "Senior Developer",
      "status": "active",
      "avatar_url": null,
      "active_goals_count": 3,
      "pending_reviews_count": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "first_name": "Bob",
      "last_name": "Williams",
      "email": "bob.williams@company.com",
      "job_title": "Software Engineer",
      "status": "active",
      "avatar_url": "https://cdn.example.com/avatars/bob.jpg",
      "active_goals_count": 2,
      "pending_reviews_count": 1
    }
  ],
  "meta": {
    "total_direct_reports": 5,
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Not a Manager (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You can only view your own team members"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Model

### Employee Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `user_id` | uuid | Associated user account ID |
| `employee_code` | string | Auto-generated employee code |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `job_title` | string | Job title |
| `department` | object | Department info |
| `manager` | object | Manager info |
| `hire_date` | date | Date of hire |
| `employment_type` | string | full-time, part-time, contract |
| `status` | string | active, inactive |
| `avatar_url` | string | Profile image URL |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |
