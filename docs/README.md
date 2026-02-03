# Employee Performance Monitoring Tool - Documentation

Welcome to the documentation hub for the Employee Performance Monitoring Tool MVP.

---

## Core Documents

| Document | Description |
|----------|-------------|
| [BRD.md](./BRD.md) | Business Requirements - Objectives, stakeholders, success metrics |
| [PRD.md](./PRD.md) | Product Requirements - Index & overview of all features |
| [TSD.md](./TSD.md) | Technical Specification - Architecture, database schema, security |

---

## Feature PRDs

Detailed product requirements split by feature:

| Document | Module |
|----------|--------|
| [prd/01-authentication.md](./prd/01-authentication.md) | Authentication & Authorization |
| [prd/02-dashboard.md](./prd/02-dashboard.md) | Dashboard (role-specific views) |
| [prd/03-employees.md](./prd/03-employees.md) | Employee Management |
| [prd/04-goals.md](./prd/04-goals.md) | Goals & OKRs |
| [prd/05-reviews.md](./prd/05-reviews.md) | Performance Reviews |
| [prd/06-analytics.md](./prd/06-analytics.md) | Analytics & Reports |
| [prd/07-ui-ux.md](./prd/07-ui-ux.md) | UI/UX Design System |
| [prd/08-adhoc-reviews.md](./prd/08-adhoc-reviews.md) | Ad-Hoc Review Trigger (On-Demand KPI Reviews) |
| [prd/09-review-forms.md](./prd/09-review-forms.md) | Department-Specific Review Forms |

---

## API Documentation

Complete API specifications for backend development:

| Document | Endpoints |
|----------|-----------|
| [api/README.md](./api/README.md) | Conventions, authentication, error handling |
| [api/auth.md](./api/auth.md) | Login, logout, password reset, sessions |
| [api/employees.md](./api/employees.md) | Employee CRUD, profiles |
| [api/departments.md](./api/departments.md) | Organization structure |
| [api/goals.md](./api/goals.md) | OKRs, key results, progress |
| [api/reviews.md](./api/reviews.md) | Review cycles, evaluations, ad-hoc reviews |
| [api/review-forms.md](./api/review-forms.md) | Department review forms management |
| [api/analytics.md](./api/analytics.md) | Metrics, reports, exports |

---

## Document Hierarchy

```
BRD (Business Strategy)
 ↓
PRD (Product Features) → prd/*.md (Feature Details)
 ↓
TSD (Technical Implementation)
 ↓
api/*.md (API Specifications)
```

---

## Quick Start by Role

| Role | Start With |
|------|------------|
| **Business Stakeholder** | [BRD.md](./BRD.md) |
| **Product Manager** | [PRD.md](./PRD.md) |
| **Frontend Developer** | [prd/07-ui-ux.md](./prd/07-ui-ux.md), [TSD.md](./TSD.md) |
| **Backend Developer** | [TSD.md](./TSD.md), [api/README.md](./api/README.md) |
| **Designer** | [prd/07-ui-ux.md](./prd/07-ui-ux.md) |

---

**Version:** MVP | **Status:** Documentation Complete
