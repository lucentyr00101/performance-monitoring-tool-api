# Authentication API

## Overview

Authentication endpoints for user login, logout, and token management.

> **Architecture Note:** This API is implemented as an external microservice.  
> **Repository:** `performance-monitoring-tool-api`  
> **Technology:** Node.js + Express + MongoDB  
> **Service Name:** Auth Service

**Base URL:** `{AUTH_SERVICE_URL}/api/v1`

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:4001/api/v1` |
| Staging | `https://auth-staging.performancetool.com/api/v1` |
| Production | `https://auth.performancetool.com/api/v1` |

---

## Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |
| GET | `/auth/me` | Get current user | Yes |

---

## MongoDB Collections

### users
```javascript
{
  _id: ObjectId,
  email: String,           // unique, indexed
  password_hash: String,   // bcrypt hashed
  role: String,            // enum: admin, hr, manager, employee, csuite
  status: String,          // enum: active, inactive, suspended
  employee_id: ObjectId,   // ref: employees collection
  last_login_at: Date,
  failed_login_attempts: Number,
  locked_until: Date,
  password_reset_token: String,
  password_reset_expires: Date,
  created_at: Date,
  updated_at: Date
}
```

### refresh_tokens
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // ref: users collection
  token_hash: String,      // hashed refresh token
  expires_at: Date,
  created_at: Date,
  revoked_at: Date         // null if active
}
```

---

## POST /auth/login

Authenticate user and receive access tokens.

### Request

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "john.doe@company.com",
  "password": "SecureP@ssw0rd"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGNvbXBhbnkuY29tIiwicm9sZSI6Im1hbmFnZXIiLCJlbXBsb3llZV9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsImlhdCI6MTcwNjQyNTgwMCwiZXhwIjoxNzA2NDI5NDAwfQ.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@company.com",
      "role": "manager",
      "employee": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe",
        "job_title": "Engineering Manager",
        "avatar_url": "https://cdn.example.com/avatars/john-doe.jpg"
      }
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Invalid Credentials (401)

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid email or password"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Account Suspended (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Account has been suspended. Please contact HR."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /auth/logout

Invalidate the current access token.

### Request

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /auth/refresh

Refresh the access token using a valid refresh token.

### Request

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh_token` | string | Yes | Valid refresh token |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Invalid Token (401)

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired refresh token"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /auth/forgot-password

Request a password reset email.

### Request

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "john.doe@company.com"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, a password reset link has been sent."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

> **Note:** This endpoint always returns success to prevent email enumeration attacks.

---

## POST /auth/reset-password

Reset password using the token from the email.

### Request

```http
POST /api/v1/auth/reset-password
Content-Type: application/json
```

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ssw0rd",
  "password_confirmation": "NewSecureP@ssw0rd"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Reset token from email |
| `password` | string | Yes | New password (min 8 chars, 1 upper, 1 lower, 1 number) |
| `password_confirmation` | string | Yes | Password confirmation |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully. Please login with your new password."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Invalid Token (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid or expired reset token"
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
        "field": "password",
        "message": "Password must contain at least one uppercase letter"
      },
      {
        "field": "password_confirmation",
        "message": "Passwords do not match"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /auth/me

Get the current authenticated user's profile.

### Request

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@company.com",
    "role": "manager",
    "status": "active",
    "last_login_at": "2026-01-28T10:30:00Z",
    "employee": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "employee_code": "EMP-001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1-555-123-4567",
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
      "employment_type": "full-time",
      "avatar_url": "https://cdn.example.com/avatars/john-doe.jpg"
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Token Structure

### Access Token Payload

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@company.com",
  "role": "manager",
  "employee_id": "550e8400-e29b-41d4-a716-446655440001",
  "iat": 1706425800,
  "exp": 1706429400
}
```

### Token Expiration

| Token | Expiration |
|-------|------------|
| Access Token | 1 hour |
| Refresh Token | 7 days |
| Reset Token | 1 hour |

---

## Security Notes

1. **HTTPS Required:** All authentication requests must use HTTPS
2. **Rate Limiting:** Login attempts limited to 5/minute per IP
3. **Password Policy:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number
4. **Token Storage:** Store tokens securely (httpOnly cookies recommended)
5. **Logout:** Invalidates tokens server-side
