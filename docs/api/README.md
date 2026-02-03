# API Documentation

## Employee Performance Monitoring Tool - API Reference

### Base URL

```
Production:  https://api.performancetool.com/v1
Development: http://localhost:3001/api/v1
```

---

## Quick Reference

| Module | Endpoints | Documentation |
|--------|-----------|---------------|
| Authentication | 6 | [auth.md](./auth.md) |
| Employees | 8 | [employees.md](./employees.md) |
| Departments | 6 | [departments.md](./departments.md) |
| Goals & OKRs | 10 | [goals.md](./goals.md) |
| Reviews | 10 | [reviews.md](./reviews.md) |
| Ad-Hoc Reviews | 6 | [reviews.md](./reviews.md#ad-hoc-reviews-endpoints) |
| Review Forms | 13 | [review-forms.md](./review-forms.md) |
| Analytics | 6 | [analytics.md](./analytics.md) |

---

## API Conventions

### Authentication

All endpoints (except public auth endpoints) require JWT Bearer token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

### Response Format

#### Success (Single Resource)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "...": "..."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Success (Collection)
```json
{
  "success": true,
  "data": [...],
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

#### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### Pagination

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number |
| `per_page` | integer | 20 | 100 | Items per page |
| `sort_by` | string | created_at | - | Sort field |
| `sort_order` | string | desc | - | asc or desc |

### Filtering

Use query parameters for filtering:

```
GET /employees?status=active&department_id=uuid
GET /goals?type=individual&status=active&owner_id=uuid
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created |
| `204` | No Content - Successful deletion |
| `400` | Bad Request - Invalid request |
| `401` | Unauthorized - Auth required |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Duplicate resource |
| `422` | Unprocessable - Validation failed |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Invalid/expired token |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Role Permissions

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `hr` | Employee & review management |
| `manager` | Team management access |
| `employee` | Self-service only |

---

## Data Types

| Type | Format | Example |
|------|--------|---------|
| UUID | RFC 4122 | `550e8400-e29b-41d4-a716-446655440000` |
| Date | ISO 8601 | `2026-01-28` |
| DateTime | ISO 8601 | `2026-01-28T10:30:00Z` |
| Decimal | Number | `75.50` |
| Boolean | true/false | `true` |
