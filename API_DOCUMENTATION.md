# Performance Monitoring Tool — API Documentation

> **Purpose:** Complete reference for frontend integration. Covers all endpoints, payloads, responses, role requirements, and recommended workflows.
>
> **Base URL (all requests go through the Gateway):** `http://localhost:4000`
>
> **All API paths are prefixed with** `/api/v1/`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Common Conventions](#2-common-conventions)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Auth Service](#4-auth-service)
5. [Employees Service](#5-employees-service)
6. [Departments](#6-departments)
7. [Goals Service](#7-goals-service)
8. [Reviews Service](#8-reviews-service)
   - [Review Cycles](#81-review-cycles)
   - [Reviews](#82-reviews)
   - [Ad-Hoc Reviews](#83-ad-hoc-reviews)
   - [Review Forms](#84-review-forms)
9. [Analytics Service](#9-analytics-service)
10. [Notifications Service](#10-notifications-service)
11. [Recommended Workflows](#11-recommended-workflows)
12. [Role Permission Matrix](#12-role-permission-matrix)
13. [Enum Reference](#13-enum-reference)

---

## 1. Architecture Overview

All requests are sent to the **Gateway** on port `4000`. The gateway proxies them to the appropriate microservice — no path transformation occurs; the full path is forwarded as-is.

| Gateway Path Prefix         | Microservice         | Port |
|-----------------------------|----------------------|------|
| `/api/v1/auth/*`            | Auth Service         | 4001 |
| `/api/v1/employees/*`       | Employees Service    | 4002 |
| `/api/v1/departments/*`     | Employees Service    | 4002 |
| `/api/v1/goals/*`           | Goals Service        | 4003 |
| `/api/v1/review-cycles/*`   | Reviews Service      | 4004 |
| `/api/v1/reviews/*`         | Reviews Service      | 4004 |
| `/api/v1/adhoc-reviews/*`   | Reviews Service      | 4004 |
| `/api/v1/review-forms/*`    | Reviews Service      | 4004 |
| `/api/v1/analytics/*`       | Analytics Service    | 4005 |
| `/api/v1/notifications/*`   | Notifications Service| 4006 |

**Health check:** `GET /health` (gateway only, no auth)

---

## 2. Common Conventions

### Request Headers

```
Authorization: Bearer <access_token>   // Required for all protected routes
Content-Type: application/json          // Required for all POST/PUT/PATCH requests
```

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-10T12:00:00.000Z",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 100,
      "total_pages": 5
    }
  }
}
```

> `pagination` is only present in list responses.

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK — success |
| 201  | Created — resource was created |
| 400  | Bad Request — malformed request |
| 401  | Unauthorized — missing or invalid token |
| 403  | Forbidden — authenticated but insufficient role |
| 404  | Not Found — resource does not exist |
| 409  | Conflict — duplicate resource |
| 422  | Unprocessable Entity — validation error |
| 429  | Too Many Requests — rate limit exceeded (100 req/min) |
| 503  | Service Unavailable — downstream service down |

### Pagination Query Parameters

All list endpoints accept these query parameters:

| Parameter   | Type   | Default | Description |
|-------------|--------|---------|-------------|
| `page`      | number | `1`     | Page number (min 1) |
| `per_page`  | number | `20`    | Items per page (max 100) |
| `sort_by`   | string | —       | Field to sort by |
| `sort_order`| string | `desc`  | `asc` or `desc` |

### Field Naming Convention

- **Query parameters and request bodies:** `snake_case` (e.g., `department_id`, `sort_by`)
- **TypeScript / MongoDB models:** `camelCase`
- **Response data:** generally `camelCase` (matching model field names)

---

## 3. Authentication & Authorization

### User Roles (lowest to highest privilege)

| Role       | Description |
|------------|-------------|
| `employee` | Regular employee — can only see and act on their own data |
| `manager`  | Can manage their direct reports and team data |
| `hr`       | HR staff — broad read/write across employees, reviews, goals |
| `csuite`   | C-Suite executives — read access to analytics and all data |
| `admin`    | Full access to all operations including destructive actions |

### JWT Token Flow

1. Call `POST /api/v1/auth/login` → receive `access_token` (short-lived) + `refresh_token` (long-lived, also set in httpOnly cookie)
2. Attach `Authorization: Bearer <access_token>` to every subsequent request
3. When the access token expires, call `POST /api/v1/auth/refresh` with the refresh token to get new tokens
4. Call `POST /api/v1/auth/logout` to invalidate the session

### JWT Payload Shape

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "employee | manager | hr | csuite | admin",
  "employeeId": "employee_object_id | null",
  "iat": 1710000000,
  "exp": 1710003600
}
```

---

## 4. Auth Service

**Base path:** `/api/v1/auth`

---

### 4.1 Login

```
POST /api/v1/auth/login
```

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",    // required, valid email
  "password": "password123"       // required
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "64abc...",
      "email": "user@example.com",
      "role": "employee",
      "employee": { "id": "64def..." }
    }
  }
}
```

> Also sets an httpOnly cookie with the refresh token.

---

### 4.2 Refresh Token

```
POST /api/v1/auth/refresh
```

**Auth required:** No

**Request body:** *(can also use the httpOnly cookie — body is optional)*

```json
{
  "refresh_token": "eyJhbGci..."    // optional if cookie is present
}
```

**Response 200:** Same shape as login response.

---

### 4.3 Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com"    // required
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, a password reset link has been sent."
  }
}
```

> Always returns 200 to prevent email enumeration attacks.

---

### 4.4 Reset Password

```
POST /api/v1/auth/reset-password
```

**Auth required:** No

**Request body:**

```json
{
  "token": "reset_token_from_email",      // required
  "password": "NewPassword1",             // required, min 8 chars, 1 upper, 1 lower, 1 number
  "password_confirmation": "NewPassword1" // required, must match password
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully. Please login with your new password."
  }
}
```

---

### 4.5 Logout

```
POST /api/v1/auth/logout
```

**Auth required:** Yes (any role)

**Request body:** None

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Successfully logged out" }
}
```

> Clears the httpOnly refresh token cookie.

---

### 4.6 Get Current User

```
GET /api/v1/auth/me
```

**Auth required:** Yes (any role)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "64abc...",
    "email": "user@example.com",
    "role": "employee",
    "status": "active",
    "last_login_at": "2026-03-10T10:00:00.000Z",
    "employee": {
      "id": "64def...",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "user@example.com",
      "jobTitle": "Software Engineer",
      "departmentId": "64ghi...",
      "managerId": "64jkl..."
    }
  }
}
```

---

### 4.7 Create Internal User *(Service-to-Service Only)*

```
POST /api/v1/auth/internal/users
```

**Auth required:** No (internal network only — not exposed via gateway for external clients)

**Request body:**

```json
{
  "email": "user@example.com",    // required
  "password": "TempPass123",      // required, min 8 chars
  "role": "employee",             // optional, default "employee"
  "employee_id": "64abc..."       // optional, links user to an employee record
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "64abc...",
    "email": "user@example.com",
    "role": "employee",
    "status": "active"
  }
}
```

---

## 5. Employees Service

**Base path:** `/api/v1/employees`

---

### 5.1 List Employees

```
GET /api/v1/employees
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter       | Type    | Description |
|-----------------|---------|-------------|
| `page`          | number  | Page number |
| `per_page`      | number  | Items per page |
| `sort_by`       | string  | Field to sort by |
| `sort_order`    | string  | `asc` or `desc` |
| `status`        | string  | `active` \| `inactive` \| `terminated` |
| `department_id` | string  | Filter by department ObjectId |
| `manager_id`    | string  | Filter by manager ObjectId |
| `rank`          | string  | `junior` \| `mid` \| `senior` \| `manager` \| `lead` \| `ceo` |
| `search`        | string  | Full-text search (name, email, job title) |
| `first_name`    | string  | Filter by first name |
| `last_name`     | string  | Filter by last name |
| `hire_date`     | date    | `YYYY-MM-DD` |
| `department`    | string  | Department name filter |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc...",
      "employeeCode": "EMP-001",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@company.com",
      "phone": "+1234567890",
      "jobTitle": "Software Engineer",
      "rank": "senior",
      "departmentId": "64ghi...",
      "managerId": "64jkl...",
      "managerName": "John Smith",
      "hireDate": "2023-01-15T00:00:00.000Z",
      "employmentType": "full-time",
      "status": "active",
      "avatarUrl": null,
      "createdAt": "2023-01-15T00:00:00.000Z",
      "updatedAt": "2026-03-10T00:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "...",
    "pagination": { "page": 1, "per_page": 20, "total_items": 42, "total_pages": 3 }
  }
}
```

---

### 5.2 Get Employee by ID

```
GET /api/v1/employees/:id
```

**Auth required:** Yes (any role)

**Path params:** `id` — MongoDB ObjectId

**Response 200:** Same employee object as in the list (single item in `data`).

---

### 5.3 Create Employee

```
POST /api/v1/employees
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "first_name": "Jane",              // required, 1–100 chars
  "last_name": "Doe",                // required, 1–100 chars
  "email": "jane.doe@company.com",   // required, valid email
  "phone": "+1234567890",            // optional
  "job_title": "Software Engineer",  // optional, max 100 chars
  "rank": "senior",                  // optional: junior|mid|senior|manager|lead|ceo
  "department_id": "64ghi...",       // optional, ObjectId
  "manager_id": "64jkl...",          // optional, ObjectId
  "hire_date": "2023-01-15",         // optional, YYYY-MM-DD
  "employment_type": "full-time",    // optional: full-time|part-time|contract, default full-time
  "avatar_url": "https://...",       // optional
  "create_user_account": true,       // optional, default true — creates a login in Auth Service
  "user_role": "employee"            // optional: admin|hr|manager|employee|csuite, default employee
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "employeeCode": "EMP-043",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@company.com",
    "status": "active",
    "temporaryPassword": "Abc123xyz"  // only present if create_user_account=true
  }
}
```

> `temporaryPassword` is returned once and not stored. Store or display it to the admin immediately.

---

### 5.4 Update Employee

```
PUT /api/v1/employees/:id
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Path params:** `id` — MongoDB ObjectId

**Request body:** *(all fields optional)*

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.new@company.com",
  "phone": null,                     // null to clear
  "job_title": "Senior Engineer",
  "rank": "senior",
  "department_id": "64ghi...",
  "department_id": null,             // null to unset
  "manager_id": "64jkl...",
  "manager_id": null,                // null to unset
  "employment_type": "full-time",
  "status": "active",               // active|inactive|terminated
  "avatar_url": null
}
```

**Response 200:** Updated employee object.

---

### 5.5 Delete Employee

```
DELETE /api/v1/employees/:id
```

**Auth required:** Yes — `admin`, `hr`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Employee deleted successfully" }
}
```

---

### 5.6 Get Employee's Team (Direct Reports)

```
GET /api/v1/employees/:id/team
```

**Auth required:** Yes (any role)

**Path params:** `id` — manager's employee ObjectId

**Query parameters:** Same as List Employees.

**Response 200:** Paginated list of employees who report to this manager.

---

### 5.7 Get Employee's Goals

```
GET /api/v1/employees/:id/goals
```

**Auth required:** Yes (any role)

**Path params:** `id` — employee ObjectId

**Query parameters:** Same as List Goals (forwarded to Goals Service).

**Response 200:** Paginated list of goals for this employee.

---

### 5.8 Get Employee's Reviews

```
GET /api/v1/employees/:id/reviews
```

**Auth required:** Yes (any role)

**Path params:** `id` — employee ObjectId

**Query parameters:** Same as List Reviews (forwarded to Reviews Service).

**Response 200:** Paginated list of reviews for this employee.

---

## 6. Departments

**Base path:** `/api/v1/departments`

---

### 6.1 List Departments

```
GET /api/v1/departments
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `page`      | number | Page number |
| `per_page`  | number | Items per page |
| `sort_by`   | string | Field to sort |
| `sort_order`| string | `asc` or `desc` |
| `status`    | string | `active` \| `inactive` |
| `parent_id` | string | Filter by parent department ObjectId |
| `search`    | string | Search by department name |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64ghi...",
      "name": "Engineering",
      "description": "Software engineering department",
      "status": "active",
      "parentId": null,
      "managerId": "64jkl...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

### 6.2 Get Department Hierarchy

```
GET /api/v1/departments/hierarchy
```

**Auth required:** Yes (any role)

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "64ghi...",
      "name": "Engineering",
      "children": [
        {
          "id": "64xyz...",
          "name": "Frontend",
          "children": []
        }
      ]
    }
  ]
}
```

---

### 6.3 Get Department by ID

```
GET /api/v1/departments/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single department object.

---

### 6.4 Create Department

```
POST /api/v1/departments
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "name": "Engineering",           // required, 1–100 chars
  "description": "...",           // optional
  "parent_id": "64ghi...",        // optional, ObjectId
  "manager_id": "64jkl..."        // optional, ObjectId (employee who manages this dept)
}
```

**Response 201:** Created department object.

---

### 6.5 Update Department

```
PUT /api/v1/departments/:id
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** *(all optional)*

```json
{
  "name": "Engineering",
  "description": null,       // null to clear
  "parent_id": null,         // null to unset parent
  "manager_id": null,        // null to unset manager
  "status": "active"         // active|inactive
}
```

**Response 200:** Updated department object.

---

### 6.6 Delete Department

```
DELETE /api/v1/departments/:id
```

**Auth required:** Yes — `admin`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Department deleted successfully" }
}
```

---

### 6.7 Get Department's Employees

```
GET /api/v1/departments/:id/employees
```

**Auth required:** Yes (any role)

**Path params:** `id` — department ObjectId

**Query parameters:** Same as List Employees.

**Response 200:** Paginated list of employees in this department.

---

## 7. Goals Service

**Base path:** `/api/v1/goals`

---

### 7.1 List Goals

```
GET /api/v1/goals
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter        | Type   | Description |
|------------------|--------|-------------|
| `page`           | number | Page number |
| `per_page`       | number | Items per page |
| `sort_by`        | string | Field to sort |
| `sort_order`     | string | `asc` or `desc` |
| `type`           | string | `individual` \| `team` \| `department` \| `company` |
| `status`         | string | `draft` \| `active` \| `completed` \| `cancelled` |
| `owner_id`       | string | Filter by owner employee ObjectId |
| `department_id`  | string | Filter by department ObjectId |
| `parent_goal_id` | string | Filter by parent goal ObjectId |
| `due_before`     | date   | `YYYY-MM-DD` — goals due before this date |
| `due_after`      | date   | `YYYY-MM-DD` — goals due after this date |
| `search`         | string | Full-text search |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc...",
      "title": "Improve API response time",
      "description": "Reduce P95 latency to under 200ms",
      "type": "individual",
      "status": "active",
      "progress": 60,
      "ownerId": "64def...",
      "parentGoalId": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "dueDate": "2026-06-30T00:00:00.000Z",
      "completedAt": null,
      "keyResults": [
        {
          "_id": "64kr1...",
          "title": "Reduce average response time",
          "targetValue": 200,
          "currentValue": 250,
          "unit": "ms",
          "status": "in_progress"
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

### 7.2 Get Goal by ID

```
GET /api/v1/goals/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single goal object with full `keyResults` array.

---

### 7.3 Create Goal

```
POST /api/v1/goals
```

**Auth required:** Yes (any role)

**Request body:**

```json
{
  "title": "Improve API response time",    // required, 1–255 chars
  "description": "...",                    // optional
  "type": "individual",                    // required: individual|team|department|company
  "owner_id": "64def...",                  // required, ObjectId of owning employee
  "parent_goal_id": null,                  // optional, ObjectId of parent goal
  "start_date": "2026-01-01",              // optional, YYYY-MM-DD
  "due_date": "2026-06-30",                // optional, YYYY-MM-DD
  "key_results": [                         // optional
    {
      "title": "Reduce average response time", // required
      "description": "...",                    // optional
      "target_value": 200,                     // required, number
      "unit": "ms"                             // optional
    }
  ]
}
```

**Response 201:** Created goal object.

---

### 7.4 Update Goal

```
PUT /api/v1/goals/:id
```

**Auth required:** Yes (any role)

**Request body:** *(all optional)*

```json
{
  "title": "...",
  "description": null,
  "type": "team",
  "status": "completed",      // draft|active|completed|cancelled
  "owner_id": "64def...",
  "parent_goal_id": null,
  "start_date": "2026-01-01",
  "due_date": "2026-06-30"
}
```

**Response 200:** Updated goal object.

---

### 7.5 Delete Goal

```
DELETE /api/v1/goals/:id
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Goal deleted successfully" }
}
```

---

### 7.6 Update Goal Progress

```
PATCH /api/v1/goals/:id/progress
```

**Auth required:** Yes (any role)

**Request body:**

```json
{
  "progress": 75,              // required, integer 0–100
  "note": "Completed phase 2"  // optional
}
```

**Response 200:** Updated goal with new `progress` value.

---

### 7.7 List Key Results for a Goal

```
GET /api/v1/goals/:id/key-results
```

**Auth required:** Yes (any role)

**Response 200:** Array of key result objects.

---

### 7.8 Add Key Result to Goal

```
POST /api/v1/goals/:id/key-results
```

**Auth required:** Yes (any role)

**Request body:**

```json
{
  "title": "Reduce p95 latency",  // required, 1–255 chars
  "description": "...",           // optional
  "target_value": 150,            // required, number
  "unit": "ms"                    // optional
}
```

**Response 201:** Updated goal object with new key result appended.

---

### 7.9 Update Key Result

```
PUT /api/v1/goals/:id/key-results/:krId
```

**Auth required:** Yes (any role)

**Path params:** `id` — goal ObjectId, `krId` — key result ObjectId

**Request body:** *(all optional)*

```json
{
  "title": "...",
  "description": null,
  "target_value": 200,
  "current_value": 180,        // actual progress value
  "unit": "ms",
  "status": "completed"        // in_progress|completed|cancelled
}
```

**Response 200:** Updated goal object.

---

### 7.10 Delete Key Result

```
DELETE /api/v1/goals/:id/key-results/:krId
```

**Auth required:** Yes (any role)

**Response 200:** Updated goal object without the deleted key result.

---

## 8. Reviews Service

### 8.1 Review Cycles

**Base path:** `/api/v1/review-cycles`

A Review Cycle is a formal performance review period (e.g., Annual, Q1). It controls which employees are reviewed, the timeline, and the review form settings.

**Lifecycle:** `draft` → `scheduled` → `active` (via launch) → `completed`

---

#### 8.1.1 List Review Cycles

```
GET /api/v1/review-cycles
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `page`      | number | Page number |
| `per_page`  | number | Items per page |
| `sort_by`   | string | Field to sort |
| `sort_order`| string | `asc` or `desc` |
| `status`    | string | `draft` \| `scheduled` \| `active` \| `completed` \| `cancelled` |
| `type`      | string | `annual` \| `semi_annual` \| `quarterly` \| `monthly` \| `probation` \| `project` \| `ad_hoc` |
| `year`      | number | Integer year filter |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64rc1...",
      "name": "2026 Annual Review",
      "description": "...",
      "type": "annual",
      "status": "active",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-03-31T00:00:00.000Z",
      "launchedAt": "2026-01-05T09:00:00.000Z",
      "completedAt": null,
      "settings": {
        "selfReviewEnabled": true,
        "peerReviewEnabled": false,
        "includeGoalReview": true,
        "requireCalibration": false,
        "allowEmployeeViewBeforeRelease": false
      },
      "departments": ["64ghi...", "64xyz..."],
      "createdBy": "64usr...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

#### 8.1.2 Get Review Cycle by ID

```
GET /api/v1/review-cycles/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single review cycle object.

---

#### 8.1.3 Create Review Cycle

```
POST /api/v1/review-cycles
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "name": "2026 Annual Review",        // required, 1–255 chars
  "description": "...",                // optional
  "type": "annual",                    // required: annual|semi_annual|quarterly|monthly|probation|project|ad_hoc
  "start_date": "2026-01-01",          // required, YYYY-MM-DD
  "end_date": "2026-03-31",            // required, YYYY-MM-DD
  "settings": {                        // optional
    "self_review_enabled": true,       // default true
    "peer_review_enabled": false,      // default false
    "include_goal_review": true,       // default true
    "require_calibration": false,      // default false
    "allow_employee_view_before_release": false  // default false
  },
  "departments": ["64ghi...", "64xyz..."]  // optional, restrict cycle to specific departments
}
```

**Response 201:** Created review cycle (status = `draft`).

---

#### 8.1.4 Update Review Cycle

```
PUT /api/v1/review-cycles/:id
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** *(all optional, same fields as create)*

**Response 200:** Updated review cycle.

---

#### 8.1.5 Delete Review Cycle

```
DELETE /api/v1/review-cycles/:id
```

**Auth required:** Yes — `admin`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Review cycle deleted successfully" }
}
```

---

#### 8.1.6 Launch Review Cycle

```
POST /api/v1/review-cycles/:id/launch
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** None

**Response 200:** Updated cycle with `status: "active"` and `launchedAt` timestamp.

**Side effects:**
- Sets `status` to `active`
- Auto-generates manager reviews for all employees in scope
- If `peerReviewEnabled = true`, generates peer reviews based on team structure
- Sends notifications to employees and managers

---

#### 8.1.7 Complete Review Cycle

```
POST /api/v1/review-cycles/:id/complete
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** None

**Response 200:** Updated cycle with `status: "completed"` and `completedAt` timestamp.

---

### 8.2 Reviews

**Base path:** `/api/v1/reviews`

Individual review records (self, manager, peer, HR). Reviews are typically auto-generated when a cycle is launched.

---

#### 8.2.1 List Reviews

```
GET /api/v1/reviews
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter     | Type   | Description |
|---------------|--------|-------------|
| `page`        | number | Page number |
| `per_page`    | number | Items per page |
| `sort_by`     | string | Field to sort |
| `sort_order`  | string | `asc` or `desc` |
| `cycle_id`    | string | Filter by review cycle ObjectId |
| `employee_id` | string | Filter by employee being reviewed |
| `reviewer_id` | string | Filter by reviewer employee ObjectId |
| `type`        | string | `self` \| `manager` \| `peer` \| `hr` |
| `status`      | string | `pending` \| `in_progress` \| `submitted` \| `acknowledged` \| `disputed` \| `finalized` |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64rv1...",
      "reviewCycleId": "64rc1...",
      "adhocReviewId": null,
      "employeeId": "64def...",
      "reviewerId": "64jkl...",
      "reviewerType": "manager",
      "status": "pending",
      "responses": [],
      "goalReviews": [],
      "overallRating": null,
      "ratingsBreakdown": {},
      "overallComment": null,
      "strengths": [],
      "areasForImprovement": [],
      "developmentGoals": [],
      "privateNotes": null,
      "submittedAt": null,
      "acknowledgedAt": null,
      "employeeComments": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

#### 8.2.2 Get Review by ID

```
GET /api/v1/reviews/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single review object.

---

#### 8.2.3 Update Review (Save Draft)

```
PUT /api/v1/reviews/:id
```

**Auth required:** Yes — reviewer must be the authenticated user

**Request body:** *(all optional)*

```json
{
  "rating": 4,                          // 1–5
  "ratings_breakdown": {                // key-value ratings per competency
    "communication": 4,
    "technical_skills": 5
  },
  "strengths": "Excellent communicator",
  "improvements": "Needs to work on time management",
  "comments": "Overall solid performance",
  "status": "in_progress"               // in_progress|submitted
}
```

**Response 200:** Updated review object.

---

#### 8.2.4 Submit Review

```
POST /api/v1/reviews/:id/submit
```

**Auth required:** Yes — reviewer must be the authenticated user

**Request body:** None

**Response 200:** Review with `status: "submitted"` and `submittedAt` timestamp.

---

#### 8.2.5 Acknowledge Review

```
POST /api/v1/reviews/:id/acknowledge
```

**Auth required:** Yes — the employee being reviewed

**Request body:** *(optional)*

```json
{
  "employee_comments": "I agree with the feedback and will work on the areas mentioned."  // optional
}
```

**Response 200:** Review with `status: "acknowledged"` and `acknowledgedAt` timestamp.

---

### 8.3 Ad-Hoc Reviews

**Base path:** `/api/v1/adhoc-reviews`

Ad-hoc reviews are triggered outside of normal review cycles — e.g., for a probation check, PIP initiation, or a specific event. They have their own two-phase workflow (self-review → manager review → acknowledgment).

**Lifecycle:** `initiated` → `self_review_pending` → `self_review_submitted` → `manager_review_pending` → `manager_review_submitted` → `pending_acknowledgment` → `acknowledged` → `completed`

---

#### 8.3.1 List Ad-Hoc Reviews

```
GET /api/v1/adhoc-reviews
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter      | Type    | Description |
|----------------|---------|-------------|
| `page`         | number  | Page number |
| `per_page`     | number  | Items per page |
| `sort_by`      | string  | Field to sort |
| `sort_order`   | string  | `asc` or `desc` |
| `status`       | string  | Any status value from the lifecycle |
| `employee_id`  | string  | Filter by employee ObjectId |
| `manager_id`   | string  | Filter by manager ObjectId |
| `triggered_by` | string  | Filter by initiating user ObjectId |
| `due_before`   | date    | `YYYY-MM-DD` |
| `overdue`      | boolean | `true` to filter only overdue reviews |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64ahr...",
      "employeeId": "64def...",
      "managerId": "64jkl...",
      "triggeredBy": "64usr...",
      "reason": "6-month probation check",
      "dueDate": "2026-04-01T00:00:00.000Z",
      "reviewFormId": null,
      "selfReviewId": null,
      "managerReviewId": null,
      "status": "initiated",
      "settings": {
        "selfReviewRequired": true,
        "managerReviewRequired": true,
        "includeGoals": true
      },
      "triggeredAt": "2026-03-10T00:00:00.000Z",
      "completedAt": null,
      "acknowledgedAt": null,
      "acknowledgmentComments": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

#### 8.3.2 Get Ad-Hoc Review by ID

```
GET /api/v1/adhoc-reviews/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single ad-hoc review object.

---

#### 8.3.3 Create Ad-Hoc Review

```
POST /api/v1/adhoc-reviews
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Request body:**

```json
{
  "employee_id": "64def...",        // required, ObjectId
  "due_date": "2026-04-01",         // optional, YYYY-MM-DD
  "reason": "Probation check",      // optional, max 500 chars
  "review_form_id": null,           // optional, ObjectId of a published Review Form
  "settings": {                     // optional
    "self_review_required": true,   // default true
    "manager_review_required": true,// default true
    "include_goals": true           // default true
  }
}
```

**Response 201:** Created ad-hoc review (status = `initiated`).

---

#### 8.3.4 Cancel Ad-Hoc Review

```
POST /api/v1/adhoc-reviews/:id/cancel
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Request body:** None

**Response 200:** Ad-hoc review with `status: "cancelled"`.

---

#### 8.3.5 Delete Ad-Hoc Review

```
DELETE /api/v1/adhoc-reviews/:id
```

**Auth required:** Yes — `admin`, `hr`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Ad-hoc review deleted successfully" }
}
```

---

#### 8.3.6 Send Reminder

```
POST /api/v1/adhoc-reviews/:id/remind
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Request body:** None

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Reminder sent successfully" }
}
```

---

#### 8.3.7 Submit Self-Review (Employee)

```
PUT /api/v1/adhoc-reviews/:id/self-review
```

**Auth required:** Yes — must be the employee assigned to the review (`user.employeeId === review.employeeId`)

**Request body:**

```json
{
  "answers": [                          // required, min 1
    {
      "questionId": "64q1...",          // ObjectId of the form question
      "value": "I improved my skills in X"  // string|number|boolean|array
    },
    {
      "questionId": "64q2...",
      "value": 4
    }
  ],
  "status": "submitted"                 // optional: submitted|in_progress, default submitted
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "64ahr...",
    "status": "self_review_submitted",
    "selfReview": {
      "status": "submitted",
      "submittedAt": "2026-03-10T12:00:00.000Z",
      "answers": [ ... ]
    }
  }
}
```

---

#### 8.3.8 Submit Manager Review

```
PUT /api/v1/adhoc-reviews/:id/manager-review
```

**Auth required:** Yes — must be the manager assigned to the review (`user.employeeId === review.managerId`)

**Request body:** Same as self-review.

**Response 200:** Same structure as self-review response, with `managerReview` instead.

---

#### 8.3.9 Acknowledge Ad-Hoc Review (Employee)

```
POST /api/v1/adhoc-reviews/:id/acknowledge
```

**Auth required:** Yes — the employee being reviewed

**Request body:** *(optional)*

```json
{
  "comments": "I acknowledge this review and will address the feedback."  // optional, max 2000 chars
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "64ahr...",
    "status": "acknowledged",
    "acknowledgedAt": "2026-03-10T15:00:00.000Z"
  }
}
```

---

### 8.4 Review Forms

**Base path:** `/api/v1/review-forms`

Review Forms define the question structure used in reviews. They are created by HR/Admin, published, and then linked to review cycles or ad-hoc reviews.

**Lifecycle:** `draft` → `published` → `archived`

---

#### 8.4.1 List Review Forms

```
GET /api/v1/review-forms
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter   | Type    | Description |
|-------------|---------|-------------|
| `page`      | number  | Page number |
| `per_page`  | number  | Items per page |
| `sort_by`   | string  | Field to sort |
| `sort_order`| string  | `asc` or `desc` |
| `status`    | string  | `draft` \| `published` \| `archived` |
| `is_default`| boolean | Filter for default forms only |
| `search`    | string  | Search by form name |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64rf1...",
      "name": "Standard Annual Review Form",
      "description": "...",
      "instructions": "Please complete all sections honestly.",
      "version": 1,
      "status": "published",
      "isDefault": true,
      "sections": [ ... ],
      "settings": {
        "rating_scale": { "min": 1, "max": 5 }
      },
      "createdBy": "64usr...",
      "publishedAt": "2026-01-01T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

#### 8.4.2 Get Review Form by ID

```
GET /api/v1/review-forms/:id
```

**Auth required:** Yes (any role)

**Response 200:** Single review form with full `sections` and `questions`.

---

#### 8.4.3 Get Review Form Versions

```
GET /api/v1/review-forms/:id/versions
```

**Auth required:** Yes (any role)

**Response 200:** Array of version history objects for the form.

---

#### 8.4.4 Create Review Form

```
POST /api/v1/review-forms
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "name": "Standard Annual Review",    // required, 1–255 chars
  "description": "...",                // optional
  "instructions": "...",               // optional
  "sections": [                        // required, min 1 section
    {
      "title": "Performance",          // required
      "description": "...",            // optional
      "order": 1,                      // optional
      "collapsible": false,            // optional, default false
      "for_reviewer": "both",          // required: self|manager|both
      "questions": [                   // required, min 1 question
        {
          "text": "Rate your technical skills", // required
          "help_text": "...",                   // optional
          "type": "rating_scale",               // required — see question types below
          "required": true,                     // optional, default false
          "for_reviewer": "both",               // optional: self|manager|both, default both
          "weight": 1,                          // optional, default 1
          "config": {                           // optional — see config by type
            "min": 1,
            "max": 5,
            "labels": { "1": "Poor", "5": "Excellent" }
          }
        }
      ]
    }
  ],
  "settings": {                        // optional
    "rating_scale": { "min": 1, "max": 5 }
  }
}
```

**Question types:**

| Type              | Description |
|-------------------|-------------|
| `rating_scale`    | Numeric rating (configurable min/max) |
| `text_short`      | Single-line text answer |
| `text_long`       | Multi-line text answer |
| `multiple_choice` | Select one option |
| `checkbox`        | Select multiple options |
| `yes_no`          | Boolean yes/no |
| `goal_rating`     | Links to employee's goals for rating |
| `number`          | Numeric input |

**Response 201:** Created form (status = `draft`).

---

#### 8.4.5 Update Review Form

```
PUT /api/v1/review-forms/:id
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** *(all optional, same fields as create)*

**Response 200:** Updated form.

---

#### 8.4.6 Delete Review Form

```
DELETE /api/v1/review-forms/:id
```

**Auth required:** Yes — `admin`

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Review form deleted successfully" }
}
```

---

#### 8.4.7 Publish Review Form

```
POST /api/v1/review-forms/:id/publish
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** None

**Response 200:** Form with `status: "published"` and `publishedAt` timestamp.

---

#### 8.4.8 Archive Review Form

```
POST /api/v1/review-forms/:id/archive
```

**Auth required:** Yes — `admin`, `hr`

**Request body:** None

**Response 200:** Form with `status: "archived"`.

---

#### 8.4.9 Clone Review Form

```
POST /api/v1/review-forms/:id/clone
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "name": "Standard Annual Review v2"  // required, 1–255 chars
}
```

**Response 201:** New form (copy of original, status = `draft`).

---

#### 8.4.10 Assign Form to Departments

```
POST /api/v1/review-forms/:id/assign
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "departments": [                          // required
    {
      "department_id": "64ghi...",          // required, ObjectId
      "form_type": "both",                  // optional: self|manager|both, default both
      "effective_date": "2026-01-01"        // optional, YYYY-MM-DD
    }
  ]
}
```

**Response 200:** Updated form with department assignments.

---

## 9. Analytics Service

**Base path:** `/api/v1/analytics`

Analytics endpoints return aggregated metrics. Data returned is role-scoped:
- `employee` — sees only their own data
- `manager` — sees their team's data
- `hr`, `admin`, `csuite` — see organization-wide data

---

### 9.1 Dashboard

```
GET /api/v1/analytics/dashboard
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter      | Type   | Description |
|----------------|--------|-------------|
| `period`       | string | `month` \| `quarter` \| `year` |
| `year`         | number | Integer year |
| `quarter`      | number | 1–4 |
| `month`        | number | 1–12 |
| `department_id`| string | ObjectId — filter by department |

**Response 200:** Aggregated dashboard metrics (role-dependent content).

---

### 9.2 Goal Analytics

```
GET /api/v1/analytics/goals
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter      | Type   | Description |
|----------------|--------|-------------|
| `period`       | string | `month` \| `quarter` \| `year` |
| `year`         | number | Integer year |
| `quarter`      | number | 1–4 |
| `month`        | number | 1–12 |
| `department_id`| string | ObjectId |
| `employee_id`  | string | ObjectId |
| `start_date`   | date   | `YYYY-MM-DD` |
| `end_date`     | date   | `YYYY-MM-DD` |

**Response 200:** Goal completion statistics and breakdown.

---

### 9.3 Review Analytics

```
GET /api/v1/analytics/reviews
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter      | Type   | Description |
|----------------|--------|-------------|
| `period`       | string | `month` \| `quarter` \| `year` |
| `year`         | number | Integer year |
| `quarter`      | number | 1–4 |
| `month`        | number | 1–12 |
| `department_id`| string | ObjectId |
| `cycle_id`     | string | ObjectId |
| `start_date`   | date   | `YYYY-MM-DD` |
| `end_date`     | date   | `YYYY-MM-DD` |

**Response 200:** Review completion statistics and breakdown.

---

### 9.4 Team Analytics

```
GET /api/v1/analytics/team/:id
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Path params:** `id` — manager's employee ObjectId

**Response 200:** Performance metrics for the team managed by this employee.

---

### 9.5 Department Analytics

```
GET /api/v1/analytics/department/:id
```

**Auth required:** Yes — `admin`, `hr`, `manager`

**Path params:** `id` — department ObjectId

**Response 200:** Performance metrics aggregated across the department.

---

### 9.6 Export Analytics

```
POST /api/v1/analytics/export
```

**Auth required:** Yes — `admin`, `hr`

**Request body:**

```json
{
  "type": "goals",          // required: goals|reviews|employees
  "format": "csv",          // optional: csv|xlsx|pdf, default csv
  "period": "quarter",      // optional: month|quarter|year
  "year": 2026,             // optional
  "quarter": 1,             // optional, 1–4
  "department_id": "64ghi..." // optional, ObjectId
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "data": "employee_code,first_name,...\nEMP-001,Jane,...",  // CSV content as string
    "format": "csv",
    "filename": "goals_export_2026_q1.csv",
    "generatedAt": "2026-03-10T12:00:00.000Z"
  }
}
```

> The `data` field contains the raw CSV/export content as a string. The frontend should handle the download.

---

### 9.7 KPIs

```
GET /api/v1/analytics/kpis
```

**Auth required:** Yes (any role)

**Query parameters:**

| Parameter    | Type   | Description |
|--------------|--------|-------------|
| `period`     | string | `monthly` \| `quarterly` \| `yearly`, default `monthly` |
| `department` | string | Department ObjectId |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "averagePerformanceScore": 3.8,
    "goalsCompletionRate": 72.5,
    "reviewCompletionRate": 88.0,
    "employeeCount": 142,
    "activeReviewCycles": 2,
    "trends": {
      "performanceScore": [3.5, 3.6, 3.8, 3.9],
      "goalsCompletion": [65, 68, 72, 73]
    }
  }
}
```

---

## 10. Notifications Service

**Base path:** `/api/v1/notifications`

---

### 10.1 List Notifications

```
GET /api/v1/notifications
```

**Auth required:** Yes (any role)

Returns only notifications for the currently authenticated user.

**Query parameters:**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `page`      | number | Page number |
| `per_page`  | number | Items per page (also accepts `limit`) |
| `sort_by`   | string | Field to sort |
| `sort_order`| string | `asc` or `desc` |
| `type`      | string | `review_assigned` \| `review_completed` \| `review_reminder` \| `goal_updated` \| `goal_due` \| `system` \| `announcement` |
| `status`    | string | `unread` \| `read` \| `all`, default `all` |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64ntf...",
      "userId": "64usr...",
      "type": "review_assigned",
      "title": "New review assigned",
      "message": "You have been assigned a self-review for the 2026 Annual Review cycle.",
      "status": "unread",
      "priority": "normal",
      "actionUrl": "/reviews/64rv1...",
      "metadata": { "reviewId": "64rv1...", "cycleId": "64rc1..." },
      "readAt": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "timestamp": "...", "pagination": { ... } }
}
```

---

### 10.2 Get Notification Counts

```
GET /api/v1/notifications/counts
```

**Auth required:** Yes (any role)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "unread": 5,
    "total": 42
  }
}
```

> Use this for the notification badge in the UI.

---

### 10.3 Mark All as Read

```
PUT /api/v1/notifications/read-all
```

**Auth required:** Yes (any role)

**Request body:** None

**Response 200:**

```json
{
  "success": true,
  "data": { "modifiedCount": 5 }
}
```

---

### 10.4 Mark Notification as Read

```
PUT /api/v1/notifications/:id/read
```

**Auth required:** Yes (any role)

**Path params:** `id` — notification ObjectId

**Response 200:** Notification object with `status: "read"` and `readAt` timestamp.

---

## 11. Recommended Workflows

### Workflow 1: Onboarding a New Employee

1. `POST /api/v1/departments` — ensure the employee's department exists
2. `POST /api/v1/employees` — create the employee record with `create_user_account: true`
   - Response includes `temporaryPassword` — display to admin immediately
3. Employee receives credentials, logs in via `POST /api/v1/auth/login`
4. Employee calls `POST /api/v1/auth/reset-password` to set a permanent password

---

### Workflow 2: Setting Up a Performance Review Cycle

1. `POST /api/v1/review-forms` — create a review form with your question sections
2. `POST /api/v1/review-forms/:id/publish` — publish the form
3. `POST /api/v1/review-cycles` — create a review cycle referencing dates, type, and settings
4. `POST /api/v1/review-cycles/:id/launch` — launch the cycle
   - Auto-generates individual `Review` records for all in-scope employees
   - Sends notifications to all reviewers
5. Employees and managers complete their reviews via `PUT /api/v1/reviews/:id` then `POST /api/v1/reviews/:id/submit`
6. Employees acknowledge results via `POST /api/v1/reviews/:id/acknowledge`
7. HR/Admin marks the cycle as done via `POST /api/v1/review-cycles/:id/complete`

---

### Workflow 3: Ad-Hoc Review (e.g., Probation)

1. `POST /api/v1/adhoc-reviews` — trigger a review for a specific employee
2. Employee submits self-review via `PUT /api/v1/adhoc-reviews/:id/self-review`
3. Manager submits their review via `PUT /api/v1/adhoc-reviews/:id/manager-review`
4. Employee acknowledges via `POST /api/v1/adhoc-reviews/:id/acknowledge`
5. (Optional) `POST /api/v1/adhoc-reviews/:id/remind` if a reminder is needed

---

### Workflow 4: Goal Setting & Tracking (OKR)

1. HR/Manager creates a company-level goal: `POST /api/v1/goals` with `type: "company"`
2. Department goals linked to the company goal: `POST /api/v1/goals` with `type: "department"` and `parent_goal_id`
3. Individual goals linked to department goals: `POST /api/v1/goals` with `type: "individual"` and `parent_goal_id`
4. Add key results: `POST /api/v1/goals/:id/key-results`
5. Employee updates KR progress: `PUT /api/v1/goals/:id/key-results/:krId` with `current_value`
6. Employee updates overall progress: `PATCH /api/v1/goals/:id/progress`
7. Track analytics: `GET /api/v1/analytics/goals`

---

### Workflow 5: Manager Dashboard

1. `GET /api/v1/auth/me` — get current user's employee ID
2. `GET /api/v1/employees/:id/team` — list direct reports
3. `GET /api/v1/analytics/team/:id` — team performance metrics
4. `GET /api/v1/reviews?reviewer_id=:myId&status=pending` — my pending reviews
5. `GET /api/v1/goals?owner_id=:teamMemberId&status=active` — team member goals
6. `GET /api/v1/notifications/counts` — notification badge count

---

### Workflow 6: Employee Self-Service

1. `GET /api/v1/auth/me` — load user profile
2. `GET /api/v1/notifications?status=unread` — check notifications
3. `GET /api/v1/reviews?employee_id=:myEmployeeId` — my reviews
4. `GET /api/v1/goals?owner_id=:myEmployeeId` — my goals
5. `PUT /api/v1/reviews/:id` → `POST /api/v1/reviews/:id/submit` — complete a self-review
6. `POST /api/v1/reviews/:id/acknowledge` — acknowledge a manager review

---

### Workflow 7: HR Analytics & Reporting

1. `GET /api/v1/analytics/kpis` — top-level KPIs
2. `GET /api/v1/analytics/dashboard?department_id=:id` — department dashboard
3. `GET /api/v1/analytics/reviews?cycle_id=:id` — cycle completion rates
4. `GET /api/v1/analytics/goals?period=quarter&year=2026&quarter=1` — Q1 goal stats
5. `POST /api/v1/analytics/export` — download CSV for reporting

---

## 12. Role Permission Matrix

| Endpoint / Action                          | employee | manager | hr  | csuite | admin |
|--------------------------------------------|----------|---------|-----|--------|-------|
| Login / Logout / Me                        | ✓        | ✓       | ✓   | ✓      | ✓     |
| List Employees                             | ✓        | ✓       | ✓   | ✓      | ✓     |
| Get Employee by ID                         | ✓        | ✓       | ✓   | ✓      | ✓     |
| Create Employee                            |          |         | ✓   |        | ✓     |
| Update Employee                            |          | ✓       | ✓   |        | ✓     |
| Delete Employee                            |          |         | ✓   |        | ✓     |
| List / Get Departments                     | ✓        | ✓       | ✓   | ✓      | ✓     |
| Create / Update Department                 |          |         | ✓   |        | ✓     |
| Delete Department                          |          |         |     |        | ✓     |
| Create / Update Goals                      | ✓        | ✓       | ✓   | ✓      | ✓     |
| Delete Goals                               |          | ✓       | ✓   |        | ✓     |
| List / Get Review Cycles                   | ✓        | ✓       | ✓   | ✓      | ✓     |
| Create / Update Review Cycle               |          |         | ✓   |        | ✓     |
| Launch / Complete Review Cycle             |          |         | ✓   |        | ✓     |
| Delete Review Cycle                        |          |         |     |        | ✓     |
| List / Get Reviews                         | ✓        | ✓       | ✓   | ✓      | ✓     |
| Update / Submit Review (as reviewer)       | ✓        | ✓       | ✓   | ✓      | ✓     |
| Acknowledge Review (as reviewee)           | ✓        | ✓       | ✓   | ✓      | ✓     |
| Create Ad-Hoc Review                       |          | ✓       | ✓   |        | ✓     |
| Cancel / Delete Ad-Hoc Review              |          | ✓       | ✓   |        | ✓     |
| Submit Self / Manager Ad-Hoc Review        | ✓        | ✓       | ✓   | ✓      | ✓     |
| List / Get Review Forms                    | ✓        | ✓       | ✓   | ✓      | ✓     |
| Create / Update / Publish Review Form      |          |         | ✓   |        | ✓     |
| Delete / Archive / Clone Review Form       |          |         | ✓   |        | ✓     |
| Analytics Dashboard / Goals / Reviews      | ✓        | ✓       | ✓   | ✓      | ✓     |
| Team / Department Analytics                |          | ✓       | ✓   | ✓      | ✓     |
| Export Analytics                           |          |         | ✓   |        | ✓     |
| List / Read Notifications                  | ✓        | ✓       | ✓   | ✓      | ✓     |
| Mark Notifications as Read                 | ✓        | ✓       | ✓   | ✓      | ✓     |

---

## 13. Enum Reference

### User Roles
`employee` | `manager` | `hr` | `csuite` | `admin`

### Employee Status
`active` | `inactive` | `terminated`

### Employee Rank
`junior` | `mid` | `senior` | `manager` | `lead` | `ceo`

### Employment Type
`full-time` | `part-time` | `contract`

### Department Status
`active` | `inactive`

### Goal Type
`individual` | `team` | `department` | `company`

### Goal Status
`draft` | `active` | `completed` | `cancelled`

### Key Result Status
`in_progress` | `completed` | `cancelled`

### Review Cycle Type
`annual` | `semi_annual` | `quarterly` | `monthly` | `probation` | `project` | `ad_hoc`

### Review Cycle Status
`draft` | `scheduled` | `active` | `completed` | `cancelled`

### Review Type (reviewerType)
`self` | `manager` | `peer` | `hr`

### Review Status
`pending` | `in_progress` | `submitted` | `acknowledged` | `disputed` | `finalized`

### Ad-Hoc Review Status
`initiated` | `self_review_pending` | `self_review_submitted` | `manager_review_pending` | `manager_review_submitted` | `pending_acknowledgment` | `acknowledged` | `completed` | `cancelled`

### Review Form Status
`draft` | `published` | `archived`

### Question Type
`rating_scale` | `text_short` | `text_long` | `multiple_choice` | `checkbox` | `yes_no` | `goal_rating` | `number`

### Section / Question `for_reviewer`
`self` | `manager` | `both`

### Notification Type
`review_assigned` | `review_completed` | `review_reminder` | `goal_updated` | `goal_due` | `system` | `announcement`

### Notification Status
`unread` | `read`

### Notification Priority
`low` | `normal` | `high` | `urgent`

### Analytics Period
`month` | `quarter` | `year` *(dashboard/goals/reviews)*
`monthly` | `quarterly` | `yearly` *(KPIs)*

### Export Type
`goals` | `reviews` | `employees`

### Export Format
`csv` | `xlsx` | `pdf`
