# Technical Specification Document (TSD)

## Employee Performance Monitoring Tool - MVP

**Version:** 1.1  
**Last Updated:** January 2026  
**Status:** Draft

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [API Overview](#4-api-overview)
5. [API Endpoints Summary](#5-api-endpoints-summary)
6. [Security Requirements](#6-security-requirements)
7. [Error Handling Standards](#7-error-handling-standards)
8. [Non-Functional Requirements](#8-non-functional-requirements)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture (Microservices)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                 Nuxt 4 Frontend Application                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐             │  │
│  │  │ Vue 3   │ │ Nuxt UI │ │Tailwind │ │ Pinia Store │             │  │
│  │  │Components│ │   4     │ │ CSS 4   │ │   (State)   │             │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘             │  │
│  │  Repository: performance-monitoring-tool-ui                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    API Gateway / Load Balancer                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │  │
│  │  │   Routing   │ │Rate Limiting│ │   Request/Response Logging  │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  AUTH SERVICE   │   │EMPLOYEE SERVICE │   │  GOALS SERVICE  │
│  (Port: 4001)   │   │  (Port: 4002)   │   │  (Port: 4003)   │
│  ┌───────────┐  │   │  ┌───────────┐  │   │  ┌───────────┐  │
│  │  Express  │  │   │  │  Express  │  │   │  │  Express  │  │
│  │  + JWT    │  │   │  │  + RBAC   │  │   │  │  + RBAC   │  │
│  └───────────┘  │   │  └───────────┘  │   │  └───────────┘  │
│       │         │   │       │         │   │       │         │
│       ▼         │   │       ▼         │   │       ▼         │
│  ┌───────────┐  │   │  ┌───────────┐  │   │  ┌───────────┐  │
│  │  MongoDB  │  │   │  │  MongoDB  │  │   │  │  MongoDB  │  │
│  │  (users)  │  │   │  │(employees)│  │   │  │  (goals)  │  │
│  └───────────┘  │   │  └───────────┘  │   │  └───────────┘  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐   ┌─────────────────┐
│ REVIEWS SERVICE │   │ANALYTICS SERVICE│
│  (Port: 4004)   │   │  (Port: 4005)   │
│  ┌───────────┐  │   │  ┌───────────┐  │
│  │  Express  │  │   │  │  Express  │  │
│  │  + RBAC   │  │   │  │  + RBAC   │  │
│  └───────────┘  │   │  └───────────┘  │
│       │         │   │       │         │
│       ▼         │   │       ▼         │
│  ┌───────────┐  │   │  ┌───────────┐  │
│  │  MongoDB  │  │   │  │  MongoDB  │  │
│  │ (reviews) │  │   │  │(analytics)│  │
│  └───────────┘  │   │  └───────────┘  │
└─────────────────┘   └─────────────────┘

Repository: performance-monitoring-tool-api (all microservices)
```

### 1.2 Service Communication

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Layer   │────▶│Service Layer │
│   (Nuxt 4)   │     │  (Gateway)   │     │ (Express)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                            │                     ▼
                            │              ┌──────────────┐
                            │              │   MongoDB    │
                            │              │  (Database)  │
                            └──────────────┴──────────────┘

Flow:
1. Frontend makes HTTP request to API Gateway
2. API Gateway routes to appropriate microservice
3. Microservice validates JWT (from Auth Service)
4. Microservice performs business logic
5. Microservice interacts with MongoDB
6. Response flows back through the layers
```

### 1.3 Frontend Architecture (Nuxt 4)

```
app/
├── assets/              # Static assets (images, fonts)
├── components/          # Reusable Vue components
│   ├── common/          # Shared components (buttons, modals)
│   ├── dashboard/       # Dashboard widgets
│   ├── employees/       # Employee-related components
│   ├── goals/           # Goals & OKR components
│   ├── reviews/         # Performance review components
│   └── analytics/       # Charts and analytics components
├── composables/         # Vue composables (reusable logic)
│   ├── useAuth.ts       # Authentication logic
│   ├── useGoals.ts      # Goals management
│   └── useReviews.ts    # Reviews management
├── layouts/             # Page layouts
│   ├── default.vue      # Main app layout with sidebar
│   └── auth.vue         # Authentication pages layout
├── middleware/          # Route middleware
│   ├── auth.ts          # Authentication guard
│   └── role.ts          # Role-based access guard
├── pages/               # File-based routing
│   ├── index.vue        # Dashboard
│   ├── auth/            # Login, forgot password
│   ├── employees/       # Employee management
│   ├── goals/           # Goals & OKRs
│   ├── reviews/         # Performance reviews
│   └── analytics/       # Reports & analytics
├── plugins/             # Nuxt plugins
├── stores/              # Pinia state management
│   ├── auth.ts          # Auth state
│   ├── employees.ts     # Employees state
│   ├── goals.ts         # Goals state
│   └── reviews.ts       # Reviews state
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

---

## 2. Technology Stack

### 2.1 Frontend (Repository: performance-monitoring-tool-ui)

| Technology | Version | Purpose |
|------------|---------|---------|
| Nuxt | 4.x | Vue meta-framework |
| Vue | 3.5+ | UI framework |
| Nuxt UI | 4.x | Component library |
| Tailwind CSS | 4.x | Utility-first CSS |
| Pinia | 2.x | State management |
| TypeScript | 5.x | Type safety |

### 2.2 Backend Microservices (Repository: performance-monitoring-tool-api)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| Express | 4.x | Web framework |
| MongoDB | 7.x | Primary database |
| Mongoose | 8.x | MongoDB ODM |
| JWT | - | Authentication tokens |
| bcrypt | - | Password hashing |
| Joi/Zod | - | Request validation |

### 2.3 Microservices Architecture

| Service | Port | Database | Responsibilities |
|---------|------|----------|-----------------|
| Auth Service | 4001 | MongoDB (users) | Login, logout, token refresh, password reset |
| Employee Service | 4002 | MongoDB (employees) | Employee CRUD, departments, org structure |
| Goals Service | 4003 | MongoDB (goals) | Goals, OKRs, key results |
| Reviews Service | 4004 | MongoDB (reviews) | Review cycles, performance reviews |
| Analytics Service | 4005 | MongoDB (analytics) | Reports, dashboards, metrics |

### 2.4 Infrastructure

| Component | Recommendation |
|-----------|----------------|
| Frontend Hosting | Vercel, Netlify, or AWS CloudFront |
| API Hosting | AWS ECS, Google Cloud Run, or Kubernetes |
| Database | MongoDB Atlas (managed) |
| API Gateway | Kong, AWS API Gateway, or Nginx |
| CDN | CloudFlare or AWS CloudFront |
| SSL | Let's Encrypt or cloud provider |
| CI/CD | GitHub Actions |
| Monitoring | Datadog, New Relic, or Prometheus |

---

## 3. Database Schema (MongoDB)

### 3.1 Document Relationships

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     users        │       │    employees     │       │   departments    │
│   (Auth DB)      │       │  (Employee DB)   │       │  (Employee DB)   │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id: ObjectId    │◄──────│ user_id: ObjId   │   ┌──►│ _id: ObjectId    │
│ email: String    │       │ _id: ObjectId    │   │   │ name: String     │
│ password_hash    │       │ first_name       │   │   │ parent_id: ObjId │──┐
│ role: enum       │       │ last_name        │   │   │ manager_id: ObjId│  │
│ status: enum     │       │ department_id    │───┘   │ created_at: Date │  │
│ created_at: Date │       │ manager_id: ObjId│───┐   └──────────────────┘  │
│ updated_at: Date │       │ job_title        │   │          ▲              │
└──────────────────┘       │ hire_date: Date  │   │          └──────────────┘
                           │ avatar_url       │   │
                           │ status: enum     │   │
                           └──────────────────┘   │
                                  ▲               │
        ┌─────────────────────────┴───────────────┘
        │
┌───────┴──────────┐       ┌──────────────────┐       ┌──────────────────┐
│      goals       │       │   key_results    │       │  review_cycles   │
│   (Goals DB)     │       │    (Goals DB)    │       │  (Reviews DB)    │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id: ObjectId    │◄──────│ goal_id: ObjId   │       │ _id: ObjectId    │
│ title: String    │       │ _id: ObjectId    │       │ name: String     │
│ description      │       │ title: String    │       │ start_date: Date │
│ type: enum       │       │ target_value     │       │ end_date: Date   │
│ status: enum     │       │ current_value    │       │ status: enum     │
│ progress: Number │       │ unit: String     │       │ created_by: ObjId│
│ owner_id: ObjId  │       │ created_at: Date │       │ created_at: Date │
│ parent_id: ObjId │       └──────────────────┘       └──────────────────┘
│ start_date: Date │                                          │
│ due_date: Date   │       ┌──────────────────┐               │
│ created_at: Date │       │     reviews      │◄──────────────┘
└──────────────────┘       │  (Reviews DB)    │
                           ├──────────────────┤
                           │ _id: ObjectId    │
                           │ cycle_id: ObjId  │
                           │ employee_id: ObjId│
                           │ reviewer_id: ObjId│
                           │ type: enum       │
                           │ status: enum     │
                           │ rating: Number   │
                           │ comments: String │
                           │ submitted_at:Date│
                           └──────────────────┘
```

### 3.2 Collection Definitions

#### users (Auth Service Database)
```javascript
{
  _id: ObjectId,
  email: String,              // unique, indexed
  password_hash: String,      // bcrypt hashed
  role: String,               // enum: 'admin', 'hr', 'manager', 'employee', 'csuite'
  status: String,             // enum: 'active', 'inactive', 'suspended'
  employee_id: ObjectId,      // ref: employees collection (cross-service reference)
  last_login_at: Date,
  failed_login_attempts: Number,
  locked_until: Date,
  password_reset_token: String,
  password_reset_expires: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ employee_id: 1 })
db.users.createIndex({ password_reset_token: 1 }, { sparse: true })
```

#### refresh_tokens (Auth Service Database)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // ref: users collection
  token_hash: String,         // hashed refresh token
  expires_at: Date,
  created_at: Date,
  revoked_at: Date            // null if active
}

// Indexes
db.refresh_tokens.createIndex({ user_id: 1 })
db.refresh_tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

#### employees (Employee Service Database)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // ref: users collection (cross-service reference)
  employee_code: String,      // unique
  first_name: String,
  last_name: String,
  email: String,
  phone: String,
  job_title: String,
  department_id: ObjectId,    // ref: departments collection
  manager_id: ObjectId,       // ref: employees collection (self-reference)
  hire_date: Date,
  employment_type: String,    // enum: 'full-time', 'part-time', 'contractor'
  avatar_url: String,
  status: String,             // enum: 'active', 'inactive', 'terminated'
  created_at: Date,
  updated_at: Date
}

// Indexes
db.employees.createIndex({ user_id: 1 }, { unique: true, sparse: true })
db.employees.createIndex({ employee_code: 1 }, { unique: true, sparse: true })
db.employees.createIndex({ department_id: 1 })
db.employees.createIndex({ manager_id: 1 })
db.employees.createIndex({ email: 1 })
```

#### departments (Employee Service Database)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  parent_id: ObjectId,        // ref: departments collection (self-reference)
  manager_id: ObjectId,       // ref: employees collection
  status: String,             // enum: 'active', 'inactive'
  created_at: Date,
  updated_at: Date
}

// Indexes
db.departments.createIndex({ name: 1 })
db.departments.createIndex({ parent_id: 1 })
```

#### goals (Goals Service Database)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String,               // enum: 'individual', 'team', 'department', 'company'
  status: String,             // enum: 'draft', 'active', 'completed', 'cancelled'
  progress: Number,           // 0-100
  owner_id: ObjectId,         // ref: employees collection (cross-service reference)
  parent_goal_id: ObjectId,   // ref: goals collection (self-reference)
  start_date: Date,
  due_date: Date,
  completed_at: Date,
  key_results: [{             // embedded sub-documents
    _id: ObjectId,
    title: String,
    description: String,
    target_value: Number,
    current_value: Number,
    unit: String,
    status: String,
    created_at: Date,
    updated_at: Date
  }],
  created_at: Date,
  updated_at: Date
}

// Indexes
db.goals.createIndex({ owner_id: 1 })
db.goals.createIndex({ parent_goal_id: 1 })
db.goals.createIndex({ status: 1 })
db.goals.createIndex({ due_date: 1 })
```

#### review_cycles (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String,               // enum: 'annual', 'semi-annual', 'quarterly', 'monthly'
  start_date: Date,
  end_date: Date,
  status: String,             // enum: 'draft', 'active', 'completed', 'cancelled'
  created_by: ObjectId,       // ref: users collection (cross-service reference)
  created_at: Date,
  updated_at: Date
}

// Indexes
db.review_cycles.createIndex({ status: 1 })
db.review_cycles.createIndex({ start_date: 1, end_date: 1 })
```

#### reviews (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  cycle_id: ObjectId,         // ref: review_cycles collection (null for ad-hoc reviews)
  adhoc_review_id: ObjectId,  // ref: adhoc_reviews collection (null for cycle reviews)
  employee_id: ObjectId,      // ref: employees collection (cross-service reference)
  reviewer_id: ObjectId,      // ref: employees collection (cross-service reference)
  type: String,               // enum: 'self', 'manager', 'peer', '360'
  status: String,             // enum: 'pending', 'in_progress', 'submitted', 'acknowledged'
  is_adhoc: Boolean,          // true for ad-hoc reviews
  form_id: ObjectId,          // ref: review_forms collection
  form_version: String,       // version of form used
  form_snapshot: Object,      // snapshot of form at creation time
  rating: Number,             // 1.0 - 5.0
  ratings_breakdown: Object,  // individual question/section ratings
  strengths: String,
  improvements: String,
  comments: String,
  employee_comments: String,  // employee response to review
  submitted_at: Date,
  acknowledged_at: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.reviews.createIndex({ cycle_id: 1 })
db.reviews.createIndex({ adhoc_review_id: 1 })
db.reviews.createIndex({ employee_id: 1 })
db.reviews.createIndex({ reviewer_id: 1 })
db.reviews.createIndex({ status: 1 })
db.reviews.createIndex({ is_adhoc: 1 })
```

#### adhoc_reviews (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  employee_id: ObjectId,      // ref: employees collection (cross-service reference)
  manager_id: ObjectId,       // ref: employees collection (employee's direct manager)
  triggered_by: ObjectId,     // ref: users collection (who initiated the review)
  reason: String,             // context/reason for the ad-hoc review
  due_date: Date,             // deadline for completion
  review_form_id: ObjectId,   // ref: review_forms collection
  self_review_id: ObjectId,   // ref: reviews collection
  manager_review_id: ObjectId, // ref: reviews collection
  status: String,             // enum: 'initiated', 'pending_acknowledgment', 'completed', 'cancelled'
  settings: {
    self_review_required: Boolean,  // default: true
    manager_review_required: Boolean, // default: true
    include_goals: Boolean    // default: true
  },
  triggered_at: Date,
  completed_at: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.adhoc_reviews.createIndex({ employee_id: 1 })
db.adhoc_reviews.createIndex({ manager_id: 1 })
db.adhoc_reviews.createIndex({ triggered_by: 1 })
db.adhoc_reviews.createIndex({ status: 1 })
db.adhoc_reviews.createIndex({ due_date: 1 })
```

#### review_forms (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  name: String,               // form name
  description: String,        // form description
  instructions: String,       // completion instructions
  version: String,            // version number (e.g., "1.0", "1.1")
  status: String,             // enum: 'draft', 'published', 'archived'
  is_default: Boolean,        // company default form
  sections: [{                // form structure
    _id: ObjectId,
    title: String,
    description: String,
    order: Number,
    collapsible: Boolean,
    for_reviewer: String,     // enum: 'self', 'manager', 'both'
    questions: [{
      _id: ObjectId,
      text: String,
      help_text: String,
      type: String,           // enum: 'rating_scale', 'text_short', 'text_long', 'multiple_choice', 'checkbox', 'yes_no', 'goal_rating', 'number'
      required: Boolean,
      for_reviewer: String,   // enum: 'self', 'manager', 'both'
      weight: Number,         // for score calculation
      config: Object          // type-specific configuration
    }]
  }],
  settings: {
    rating_scale: {
      min: Number,
      max: Number,
      labels: Object
    }
  },
  created_by: ObjectId,
  published_at: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.review_forms.createIndex({ status: 1 })
db.review_forms.createIndex({ is_default: 1 })
db.review_forms.createIndex({ name: 1 })
```

#### department_form_assignments (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  department_id: ObjectId,    // ref: departments collection (cross-service reference)
  review_form_id: ObjectId,   // ref: review_forms collection
  form_type: String,          // enum: 'self', 'manager', 'both'
  effective_date: Date,       // when assignment becomes active
  assigned_by: ObjectId,      // ref: users collection
  status: String,             // enum: 'active', 'inactive'
  created_at: Date,
  updated_at: Date
}

// Indexes
db.department_form_assignments.createIndex({ department_id: 1, status: 1 })
db.department_form_assignments.createIndex({ review_form_id: 1 })
db.department_form_assignments.createIndex({ effective_date: 1 })
```

#### form_version_history (Reviews Service Database)
```javascript
{
  _id: ObjectId,
  review_form_id: ObjectId,   // ref: review_forms collection
  version: String,            // version number
  sections: Object,           // snapshot of form content
  changed_by: ObjectId,       // ref: users collection
  change_summary: String,     // description of changes
  created_at: Date
}

// Indexes
db.form_version_history.createIndex({ review_form_id: 1 })
db.form_version_history.createIndex({ version: 1 })
```

#### notifications (Across Services - typically in a shared DB or per service)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // ref: users collection
  type: String,               // e.g., 'goal_reminder', 'review_assigned', 'password_reset'
  title: String,
  message: String,
  link: String,
  is_read: Boolean,           // default: false
  created_at: Date
}

// Indexes
db.notifications.createIndex({ user_id: 1, is_read: 1 })
db.notifications.createIndex({ created_at: 1 })
```

---

## 4. API Overview

### 4.1 Microservices URLs

| Service | Port | Base URL (Development) | Base URL (Production) |
|---------|------|------------------------|----------------------|
| API Gateway | 4000 | `http://localhost:4000/api/v1` | `https://api.performancetool.com/v1` |
| Auth Service | 4001 | `http://localhost:4001/api/v1` | `https://auth.performancetool.com/api/v1` |
| Employee Service | 4002 | `http://localhost:4002/api/v1` | `https://employees.performancetool.com/api/v1` |
| Goals Service | 4003 | `http://localhost:4003/api/v1` | `https://goals.performancetool.com/api/v1` |
| Reviews Service | 4004 | `http://localhost:4004/api/v1` | `https://reviews.performancetool.com/api/v1` |
| Analytics Service | 4005 | `http://localhost:4005/api/v1` | `https://analytics.performancetool.com/api/v1` |

> **Note:** In development, the frontend can call services directly. In production, 
> all requests should route through the API Gateway for rate limiting, logging, and security.

### 4.2 Authentication

All API requests (except login/register) require JWT Bearer token:

```http
Authorization: Bearer <access_token>
```

### 4.3 Request Format

- **Content-Type:** `application/json`
- **Accept:** `application/json`

### 4.4 Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
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

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### 4.5 Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page (max: 100) |
| `sort_by` | string | created_at | Field to sort by |
| `sort_order` | string | desc | Sort order (asc/desc) |

### 4.6 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 5. API Endpoints Summary

> **Note:** Detailed API specifications with request/response examples are available in the `/docs/api/` folder.

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh access token | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/me` | Get current user profile | Yes |

### Employees (`/employees`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/employees` | List all employees | Yes | All |
| GET | `/employees/:id` | Get employee by ID | Yes | All |
| POST | `/employees` | Create new employee | Yes | Admin, HR |
| PUT | `/employees/:id` | Update employee | Yes | Admin, HR |
| DELETE | `/employees/:id` | Delete employee | Yes | Admin |
| GET | `/employees/:id/goals` | Get employee's goals | Yes | All |
| GET | `/employees/:id/reviews` | Get employee's reviews | Yes | All |
| GET | `/employees/:id/team` | Get direct reports | Yes | Manager+ |

### Departments (`/departments`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/departments` | List all departments | Yes | All |
| GET | `/departments/:id` | Get department by ID | Yes | All |
| POST | `/departments` | Create department | Yes | Admin, HR |
| PUT | `/departments/:id` | Update department | Yes | Admin, HR |
| DELETE | `/departments/:id` | Delete department | Yes | Admin |
| GET | `/departments/:id/employees` | Get department employees | Yes | All |
| GET | `/departments/hierarchy` | Get org hierarchy tree | Yes | All |

### Goals (`/goals`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/goals` | List goals (filtered) | Yes | All |
| GET | `/goals/:id` | Get goal by ID | Yes | All |
| POST | `/goals` | Create new goal | Yes | All |
| PUT | `/goals/:id` | Update goal | Yes | Owner/Manager |
| DELETE | `/goals/:id` | Delete goal | Yes | Owner/Manager |
| PATCH | `/goals/:id/progress` | Update goal progress | Yes | Owner |
| GET | `/goals/:id/key-results` | Get goal's key results | Yes | All |
| POST | `/goals/:id/key-results` | Add key result | Yes | Owner |
| PUT | `/goals/:id/key-results/:krId` | Update key result | Yes | Owner |
| DELETE | `/goals/:id/key-results/:krId` | Delete key result | Yes | Owner |

### Reviews (`/reviews`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/review-cycles` | List review cycles | Yes | All |
| GET | `/review-cycles/:id` | Get cycle by ID | Yes | All |
| POST | `/review-cycles` | Create review cycle | Yes | Admin, HR |
| PUT | `/review-cycles/:id` | Update review cycle | Yes | Admin, HR |
| DELETE | `/review-cycles/:id` | Delete review cycle | Yes | Admin |
| POST | `/review-cycles/:id/launch` | Launch review cycle | Yes | Admin, HR |
| GET | `/reviews` | List reviews (filtered) | Yes | All |
| GET | `/reviews/:id` | Get review by ID | Yes | Participant |
| PUT | `/reviews/:id` | Submit/update review | Yes | Reviewer |
| POST | `/reviews/:id/acknowledge` | Acknowledge review | Yes | Employee |

### Ad-Hoc Reviews (`/adhoc-reviews`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/adhoc-reviews` | List ad-hoc reviews | Yes | HR, Manager (own team), C-Suite |
| GET | `/adhoc-reviews/:id` | Get ad-hoc review by ID | Yes | Participant, HR |
| POST | `/adhoc-reviews` | Trigger ad-hoc review | Yes | HR, Manager, C-Suite |
| PUT | `/adhoc-reviews/:id` | Update ad-hoc review settings | Yes | HR, Triggered By |
| DELETE | `/adhoc-reviews/:id` | Cancel ad-hoc review | Yes | HR, Triggered By |
| POST | `/adhoc-reviews/:id/remind` | Send reminder notification | Yes | HR, Manager, Triggered By |

### Review Forms (`/review-forms`)

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
| GET | `/review-forms/:id/versions/:version` | Get specific version | Yes | HR, Admin |
| POST | `/review-forms/:id/assign` | Assign to departments | Yes | HR, Admin |
| DELETE | `/review-forms/:id/assign/:deptId` | Remove department assignment | Yes | HR, Admin |
| GET | `/review-forms/default` | Get company default form | Yes | All |
| PUT | `/review-forms/:id/set-default` | Set as company default | Yes | Admin |

### Department Form Assignments (`/departments/:id/review-form`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/departments/:id/review-form` | Get department's assigned form | Yes | All |
| PUT | `/departments/:id/review-form` | Assign form to department | Yes | HR, Admin |
| DELETE | `/departments/:id/review-form` | Remove form assignment | Yes | HR, Admin |

### Analytics (`/analytics`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/analytics/dashboard` | Dashboard metrics | Yes | All |
| GET | `/analytics/goals` | Goal analytics | Yes | Manager+ |
| GET | `/analytics/reviews` | Review analytics | Yes | Manager+ |
| GET | `/analytics/team/:id` | Team performance | Yes | Manager+ |
| GET | `/analytics/department/:id` | Department metrics | Yes | Manager+ |
| GET | `/analytics/export` | Export report data | Yes | HR+ |

### Notifications (`/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | List user notifications | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

---

## 6. Security Requirements

### 6.1 Authentication Flow

```
┌────────┐                    ┌────────┐                    ┌────────┐
│ Client │                    │  API   │                    │   DB   │
└───┬────┘                    └───┬────┘                    └───┬────┘
    │                             │                             │
    │ POST /auth/login            │                             │
    │ {email, password}           │                             │
    ├────────────────────────────►│                             │
    │                             │ Verify credentials          │
    │                             ├────────────────────────────►│
    │                             │◄────────────────────────────┤
    │                             │                             │
    │ 200 OK                      │                             │
    │ {access_token, refresh_token}                             │
    │◄────────────────────────────┤                             │
    │                             │                             │
    │ GET /employees              │                             │
    │ Authorization: Bearer token │                             │
    ├────────────────────────────►│                             │
    │                             │ Validate JWT                │
    │                             │ Check permissions           │
    │                             ├────────────────────────────►│
    │                             │◄────────────────────────────┤
    │ 200 OK {data}               │                             │
    │◄────────────────────────────┤                             │
```

### 6.2 JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@company.com",
    "role": "manager",
    "employee_id": "employee-uuid",
    "iat": 1706425800,
    "exp": 1706429400
  }
}
```

### 6.3 Token Expiration

| Token Type | Expiration |
|------------|------------|
| Access Token | 1 hour |
| Refresh Token | 7 days |

### 6.4 Role-Based Access Control (RBAC)

| Role | Access Level |
|------|--------------|
| `admin` | Full system access, user management |
| `hr` | Employee management, review cycles, reports |
| `manager` | Team management, team goals/reviews |
| `employee` | Self-service only (own profile, goals, reviews) |

### 6.5 Security Measures

- **Password Requirements:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **Password Hashing:** bcrypt with cost factor 12
- **HTTPS:** Required for all API communication
- **Rate Limiting:** 100 requests/minute per IP
- **CORS:** Whitelist allowed origins
- **Input Validation:** Sanitize all inputs
- **SQL Injection:** Use parameterized queries
- **XSS Protection:** Escape output, CSP headers

---

## 7. Error Handling Standards

### 7.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid or expired token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 7.2 Validation Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Page Load Time | < 2 seconds |
| Time to Interactive | < 3 seconds |
| Database Query Time | < 50ms |

### 8.2 Scalability

| Metric | MVP Target |
|--------|------------|
| Concurrent Users | 500 |
| Total Users | 5,000 |
| Requests per Second | 100 |
| Database Size | 10 GB |

### 8.3 Availability

| Metric | Target |
|--------|--------|
| Uptime SLA | 99.5% |
| Recovery Time Objective (RTO) | 4 hours |
| Recovery Point Objective (RPO) | 1 hour |

### 8.4 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

---

## Appendix

### A. API Documentation Files

Detailed API specifications are available in:

- `/docs/api/README.md` - API overview and conventions
- `/docs/api/auth.md` - Authentication endpoints
- `/docs/api/employees.md` - Employee management endpoints
- `/docs/api/departments.md` - Department endpoints
- `/docs/api/goals.md` - Goals & OKRs endpoints
- `/docs/api/reviews.md` - Performance review endpoints
- `/docs/api/analytics.md` - Analytics & reporting endpoints

### B. Related Documents

- [Business Requirements Document (BRD)](./BRD.md)
- [Product Requirements Document (PRD)](./PRD.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial draft |
