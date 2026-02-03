# Performance Monitoring Tool API - UI Integration Guide

## Overview

This document provides implementation details for the UI to integrate with the Performance Monitoring Tool API.

## Base URL

```
Development: http://localhost:4000/api/v1
Production: https://api.yourcompany.com/api/v1
```

All requests go through the API Gateway on port 4000.

## Authentication

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "employee",
      "employee": {
        "id": "employee_id"
      }
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Using Tokens

Include the access token in all authenticated requests:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing credentials |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate, etc.) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Pagination

All list endpoints support pagination:

```http
GET /employees?page=1&per_page=20&sort_by=createdAt&sort_order=desc
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    }
  }
}
```

---

## Employees Module

### List Employees

```http
GET /employees
GET /employees?status=active&department_id=<id>&search=john
```

### Get Employee

```http
GET /employees/:id
```

### Create Employee

```http
POST /employees
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "position": "Software Engineer",
  "department_id": "<department_id>",
  "manager_id": "<manager_id>",
  "hire_date": "2024-01-15",
  "employment_type": "full-time",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94102",
    "country": "USA"
  },
  "emergency_contact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891"
  },
  "skills": ["JavaScript", "TypeScript", "Node.js"],
  "salary": {
    "amount": 100000,
    "currency": "USD",
    "effective_date": "2024-01-15"
  }
}
```

### Update Employee

```http
PUT /employees/:id
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "status": "active"
}
```

### Delete Employee

```http
DELETE /employees/:id
```

### Get Employee's Team

```http
GET /employees/:id/team
```

---

## Departments Module

### List Departments

```http
GET /departments
GET /departments?is_active=true&search=engineering
```

### Get Department Hierarchy

```http
GET /departments/hierarchy
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept_id",
      "name": "Engineering",
      "code": "ENG",
      "employee_count": 45,
      "children": [
        {
          "id": "sub_dept_id",
          "name": "Frontend",
          "code": "ENG-FE",
          "employee_count": 15,
          "children": []
        }
      ]
    }
  ]
}
```

### Create Department

```http
POST /departments
Content-Type: application/json

{
  "name": "Engineering",
  "code": "ENG",
  "description": "Engineering department",
  "parent_department_id": null,
  "head_id": "<employee_id>",
  "budget": {
    "amount": 5000000,
    "currency": "USD",
    "fiscal_year": 2024
  },
  "location": {
    "building": "HQ",
    "floor": "3",
    "room": "301"
  },
  "cost_center": "CC-001"
}
```

### Get Department Employees

```http
GET /departments/:id/employees
```

---

## Goals Module

### List Goals

```http
GET /goals
GET /goals?employee_id=<id>&status=active&category=performance
```

### Create Goal

```http
POST /goals
Content-Type: application/json

{
  "title": "Improve test coverage",
  "description": "Increase unit test coverage to 80%",
  "employee_id": "<employee_id>",
  "manager_id": "<manager_id>",
  "department_id": "<department_id>",
  "category": "performance",
  "priority": "high",
  "start_date": "2024-01-01",
  "due_date": "2024-03-31",
  "visibility": "team",
  "tags": ["testing", "quality"]
}
```

### Update Goal Progress

```http
PATCH /goals/:id/progress
Content-Type: application/json

{
  "progress": 75
}
```

### Key Results

```http
GET /goals/:id/key-results

POST /goals/:id/key-results
{
  "title": "Write unit tests for API",
  "target_value": 100,
  "current_value": 25,
  "unit": "tests",
  "weight": 50,
  "due_date": "2024-02-28"
}

PUT /goals/:id/key-results/:krId
{
  "current_value": 50
}

DELETE /goals/:id/key-results/:krId
```

---

## Reviews Module

### Review Cycles

```http
GET /review-cycles
GET /review-cycles/:id

POST /review-cycles
{
  "name": "Q1 2024 Performance Review",
  "description": "Quarterly performance review",
  "type": "quarterly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "self_review_deadline": "2024-01-15",
  "manager_review_deadline": "2024-01-25",
  "participating_departments": ["<dept_id1>", "<dept_id2>"],
  "review_form_id": "<form_id>",
  "settings": {
    "self_review_enabled": true,
    "peer_review_enabled": false,
    "include_goal_review": true,
    "require_calibration": true
  }
}

POST /review-cycles/:id/launch
POST /review-cycles/:id/complete
```

### Reviews

```http
GET /reviews
GET /reviews?review_cycle_id=<id>&employee_id=<id>&status=pending

GET /reviews/:id

PUT /reviews/:id
{
  "responses": [
    {
      "question_id": "<id>",
      "response": "Exceeded expectations",
      "rating": 5,
      "comment": "Great work on project X"
    }
  ],
  "overall_rating": 4,
  "overall_comment": "Strong performer",
  "strengths": ["Leadership", "Technical skills"],
  "areas_for_improvement": ["Time management"]
}

POST /reviews/:id/submit
POST /reviews/:id/acknowledge
{
  "employee_comments": "Thank you for the feedback"
}
```

### Ad-Hoc Reviews

```http
GET /adhoc-reviews
POST /adhoc-reviews
{
  "employee_id": "<employee_id>",
  "reviewer_id": "<reviewer_id>",
  "type": "recognition",
  "title": "Great presentation",
  "description": "Excellent presentation at the client meeting",
  "visibility": "employee",
  "rating": 5,
  "tags": ["presentation", "client"]
}

POST /adhoc-reviews/:id/submit
POST /adhoc-reviews/:id/acknowledge
```

### Review Forms

```http
GET /review-forms
GET /review-forms/:id

POST /review-forms
{
  "name": "Standard Performance Review",
  "description": "Standard review form for all employees",
  "type": "manager_review",
  "sections": [
    {
      "title": "Performance",
      "description": "Rate overall performance",
      "order": 1,
      "weight": 50,
      "questions": [
        {
          "text": "How would you rate the employee's overall performance?",
          "type": "rating",
          "required": true,
          "min_rating": 1,
          "max_rating": 5,
          "rating_labels": {
            "1": "Needs Improvement",
            "2": "Below Expectations",
            "3": "Meets Expectations",
            "4": "Exceeds Expectations",
            "5": "Outstanding"
          },
          "weight": 100,
          "order": 1
        }
      ]
    }
  ],
  "is_default": false
}

POST /review-forms/:id/publish
POST /review-forms/:id/archive
POST /review-forms/:id/clone
{
  "name": "Copy of Standard Performance Review"
}
```

---

## Analytics Module

### Dashboard

```http
GET /analytics/dashboard
```

Returns role-specific dashboard data.

### Goal Analytics

```http
GET /analytics/goals
GET /analytics/goals?department_id=<id>&start_date=2024-01-01&end_date=2024-03-31
```

### Review Analytics

```http
GET /analytics/reviews
GET /analytics/reviews?cycle_id=<id>&department_id=<id>
```

### Team Analytics

```http
GET /analytics/team/:managerId
```

### Department Analytics

```http
GET /analytics/department/:departmentId
```

### Export

```http
POST /analytics/export
{
  "type": "goals",
  "format": "csv",
  "filters": {
    "department_id": "<id>",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-03-31"
    }
  }
}
```

---

## Role-Based Access

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all resources |
| `hr` | Manage employees, departments, reviews, analytics |
| `manager` | Manage team goals, conduct reviews, view team analytics |
| `employee` | View own data, manage own goals, participate in reviews |

---

## TypeScript Types

```typescript
// User Roles
type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

// Employee Status
type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

// Employment Type
type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';

// Goal Status
type GoalStatus = 'draft' | 'pending_approval' | 'active' | 'completed' | 'cancelled';

// Goal Category
type GoalCategory = 'performance' | 'development' | 'project' | 'team' | 'personal';

// Goal Priority
type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

// Review Cycle Status
type ReviewCycleStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

// Review Cycle Type
type ReviewCycleType = 'annual' | 'semi_annual' | 'quarterly' | 'monthly' | 'probation' | 'project' | 'ad_hoc';

// Review Status
type ReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'acknowledged' | 'disputed' | 'finalized';

// Review Form Type
type ReviewFormType = 'self_review' | 'manager_review' | 'peer_review' | '360_review' | 'probation_review';

// Review Form Status
type ReviewFormStatus = 'draft' | 'published' | 'archived';

// Ad-Hoc Review Type
type AdhocReviewType = 'achievement' | 'feedback' | 'incident' | 'coaching' | 'recognition';
```

---

## Rate Limiting

- General API: 100 requests per minute
- Login: 5 requests per minute
- Password reset: 3 requests per hour

---

## Best Practices

1. **Token Storage**: Store tokens securely (HttpOnly cookies recommended)
2. **Token Refresh**: Implement automatic token refresh before expiry
3. **Error Handling**: Display user-friendly error messages
4. **Loading States**: Show loading indicators during API calls
5. **Optimistic Updates**: Update UI immediately, revert on error
6. **Pagination**: Implement infinite scroll or pagination for lists
7. **Search Debounce**: Debounce search inputs (300-500ms)
8. **Caching**: Cache frequently accessed data (departments, employees)
