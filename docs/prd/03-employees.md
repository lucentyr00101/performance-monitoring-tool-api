# PRD: Employee Management

## Employee Performance Monitoring Tool - MVP

**Module:** Employee Management  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Data Model](#4-data-model)
5. [Access Control](#5-access-control)

---

## 1. Overview

The Employee Management module provides comprehensive employee directory, profile management, and organizational structure features. It serves as the foundation for all performance-related data.

### Goals

- Maintain accurate employee information
- Visualize organizational structure
- Enable quick employee discovery
- Support department hierarchy management

---

## 2. Features

### 2.1 Employee Directory

| Feature | Description | Priority |
|---------|-------------|----------|
| Search | Search by name, email, department | P0 |
| Filters | Filter by department, role, status, manager | P0 |
| Sort | Sort by name, department, join date | P1 |
| View Toggle | Grid view / List view | P1 |
| Pagination | 25 employees per page | P0 |
| Export | Export list to CSV/Excel (HR/Admin) | P2 |

#### Search Behavior

- Real-time search (debounced 300ms)
- Search fields: First name, Last name, Email, Job title
- Minimum 2 characters to trigger search
- Highlight matching text in results

#### Filter Options

| Filter | Values |
|--------|--------|
| Department | Dropdown (all departments) |
| Status | Active, Inactive, On Leave |
| Role | Admin, HR, Manager, Employee, C-Suite |
| Manager | Dropdown (all managers) |
| Employment Type | Full-time, Part-time, Contract |
| Location | Remote, Hybrid, Office |

---

### 2.2 Employee Profile

#### 2.2.1 Personal Information

| Field | Type | Editable By |
|-------|------|-------------|
| Profile Photo | Image upload | Self, HR, Admin |
| First Name | Text | HR, Admin |
| Last Name | Text | HR, Admin |
| Email | Email | HR, Admin |
| Phone | Text | Self, HR, Admin |
| Employee ID | Auto-generated | System |
| Join Date | Date | HR, Admin |

#### 2.2.2 Professional Information

| Field | Type | Editable By |
|-------|------|-------------|
| Job Title | Text | HR, Admin |
| Department | Dropdown | HR, Admin |
| Manager | Dropdown (employee) | HR, Admin |
| Employment Type | Dropdown | HR, Admin |
| Employment Status | Dropdown | HR, Admin |
| Work Location | Dropdown | HR, Admin |
| Career Level | Dropdown | HR, Admin |

#### 2.2.3 Performance Summary (Read-Only)

| Widget | Description |
|--------|-------------|
| Current Rating | Latest performance rating |
| Active Goals | Count with average progress |
| Recent Reviews | Last 3 review summaries |
| Performance History | Timeline chart |

#### 2.2.4 Profile Actions

| Action | Description | Available To |
|--------|-------------|--------------|
| Edit Profile | Modify employee information | HR, Admin |
| View Goals | Navigate to employee's goals | All |
| View Reviews | Navigate to employee's review history | Manager+, HR, Admin |
| **Trigger Review** | Initiate ad-hoc performance review | HR, Manager (for direct reports), C-Suite |

> **Note:** The "Trigger Review" action initiates an on-demand KPI review requiring both self-assessment and manager evaluation. See [PRD: Ad-Hoc Reviews](./08-adhoc-reviews.md) for details.

#### Profile Layout

```
┌────────────────────────────────────────────────────────────┐
│ ┌──────┐  John Doe                   [Edit] [Trigger Review▼]│
│ │ 📷   │  Engineering Manager                              │
│ │Avatar│  Engineering Department                           │
│ └──────┘  john.doe@company.com | +1-555-123-4567          │
├────────────────────────────────────────────────────────────┤
│ [Overview] [Goals] [Reviews] [Activity]                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Professional Info          │  Performance Summary         │
│  ┌────────────────────────┐ │  ┌────────────────────────┐ │
│  │ Manager: Jane Smith    │ │  │ Current Rating: 4.2/5  │ │
│  │ Department: Engineering│ │  │ Active Goals: 5        │ │
│  │ Join Date: Mar 2022    │ │  │ Avg Progress: 65%      │ │
│  │ Type: Full-time        │ │  │                        │ │
│  │ Location: Hybrid       │ │  │ [View All Goals →]     │ │
│  └────────────────────────┘ │  └────────────────────────┘ │
│                             │                              │
│  Reporting Structure        │  Recent Reviews              │
│  ┌────────────────────────┐ │  ┌────────────────────────┐ │
│  │      Jane Smith        │ │  │ Q4 2025: 4.5 ★★★★☆    │ │
│  │          │             │ │  │ Q3 2025: 4.2 ★★★★☆    │ │
│  │      John Doe ◄─ You   │ │  │ Q2 2025: 4.0 ★★★★☆    │ │
│  │      /    \            │ │  │                        │ │
│  │   Alice   Bob          │ │  │ [View History →]       │ │
│  └────────────────────────┘ │  └────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

### 2.3 Department Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create Department | Add new department | P0 |
| Edit Department | Update name, description, head | P0 |
| Delete Department | Remove (only if empty) | P1 |
| Assign Head | Set department manager | P0 |
| View Members | List employees in department | P0 |
| Hierarchy View | Visualize department structure | P1 |

#### Department Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  Organization Structure                    [Add Dept +] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐                                   │
│  │   Executive     │                                   │
│  │   (5 employees) │                                   │
│  └────────┬────────┘                                   │
│           │                                             │
│     ┌─────┴─────┬─────────────┬─────────────┐         │
│     │           │             │             │         │
│  ┌──┴──┐    ┌──┴──┐      ┌──┴──┐      ┌──┴──┐      │
│  │Tech │    │Sales│      │ HR  │      │ Ops │      │
│  │(50) │    │(40) │      │ (8) │      │(20) │      │
│  └──┬──┘    └─────┘      └─────┘      └─────┘      │
│     │                                               │
│  ┌──┴──┬───────┐                                   │
│  │     │       │                                   │
│  │Eng  │Product│DevOps│                            │
│  │(25) │ (15)  │ (10) │                            │
│  └─────┴───────┴──────┘                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.4 Organization Chart

Interactive org chart showing reporting relationships.

| Feature | Description |
|---------|-------------|
| Zoom In/Out | Mouse wheel or buttons |
| Pan | Click and drag |
| Expand/Collapse | Show/hide direct reports |
| Search | Find employee in chart |
| Profile Link | Click node to view profile |

---

## 3. User Stories & Acceptance Criteria

### US-EMP-001: View Employee Directory

**As a** user  
**I want to** browse the employee directory  
**So that** I can find colleagues

**Acceptance Criteria:**

- [ ] Directory displays all employees in grid/list view
- [ ] Search by name, email, or department
- [ ] Filters: Department, Role, Manager, Status
- [ ] Sort by: Name, Department, Join Date
- [ ] Toggle between grid and list view
- [ ] Click employee card to view profile
- [ ] Profile photo displayed (or avatar fallback)
- [ ] Pagination (25 per page)
- [ ] Total employee count shown
- [ ] Loading state during data fetch

---

### US-EMP-002: View Employee Profile

**As a** user  
**I want to** view an employee's profile  
**So that** I can see their information and performance

**Acceptance Criteria:**

- [ ] Profile shows personal info (name, email, phone, photo)
- [ ] Professional info visible (title, department, manager)
- [ ] Performance summary with current rating
- [ ] Active goals count and progress
- [ ] Recent reviews summary (last 3)
- [ ] Reporting structure visualization
- [ ] Tabs: Overview, Goals, Reviews, Activity
- [ ] Edit button visible for authorized users only
- [ ] Back button returns to directory

---

### US-EMP-003: Edit Employee Profile

**As an** HR manager  
**I want to** edit employee information  
**So that** I can keep records up to date

**Acceptance Criteria:**

- [ ] HR can access edit mode on any profile
- [ ] Form fields: Name, Email, Phone, Title, Department, Manager, Status, Join Date
- [ ] Profile photo upload (max 5MB, jpg/png)
- [ ] Department dropdown populated from system
- [ ] Manager dropdown shows active employees
- [ ] Validation on required fields
- [ ] Save button updates employee data
- [ ] Cancel button discards changes
- [ ] Success notification on save
- [ ] Audit log records who made changes

---

### US-EMP-004: Create Department

**As an** admin  
**I want to** create new departments  
**So that** I can organize employees

**Acceptance Criteria:**

- [ ] "Create Department" button accessible to Admin/HR
- [ ] Form fields: Department Name, Description, Parent Department, Department Head
- [ ] Department name is unique
- [ ] Parent department dropdown (optional, for hierarchy)
- [ ] Department head dropdown shows eligible employees
- [ ] Save button creates department
- [ ] New department appears in all department dropdowns
- [ ] Success notification shown
- [ ] Can assign employees to new department

---

### US-EMP-005: Delete Department

**As an** admin  
**I want to** delete unused departments  
**So that** I can keep the organization structure clean

**Acceptance Criteria:**

- [ ] Delete button visible on department with no employees
- [ ] Confirmation modal before deletion
- [ ] Cannot delete department with active employees
- [ ] Error message if department has employees: "Reassign X employees before deleting"
- [ ] Cannot delete department with sub-departments
- [ ] Success notification on deletion
- [ ] Department removed from all dropdowns

---

### US-EMP-006: View Organization Chart

**As a** user  
**I want to** view the org chart  
**So that** I can understand reporting relationships

**Acceptance Criteria:**

- [ ] Interactive org chart displays all employees
- [ ] Nodes show: Photo, Name, Title
- [ ] Lines connect managers to direct reports
- [ ] Zoom in/out functionality
- [ ] Pan/drag to navigate large charts
- [ ] Click node to view employee profile
- [ ] Expand/collapse branches
- [ ] Search to find and highlight employee
- [ ] Export org chart as image (Admin/HR)

---

## 4. Data Model

### Employee Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| user_id | UUID | Yes | Link to user account |
| employee_code | String | Yes | Auto-generated (EMP-001) |
| first_name | String | Yes | First name |
| last_name | String | Yes | Last name |
| email | String | Yes | Email address |
| phone | String | No | Phone number |
| avatar_url | String | No | Profile photo URL |
| job_title | String | No | Job title |
| department_id | UUID | No | Department reference |
| manager_id | UUID | No | Manager (employee reference) |
| hire_date | Date | No | Employment start date |
| employment_type | Enum | Yes | full-time, part-time, contract |
| employment_status | Enum | Yes | active, inactive, on_leave, terminated |
| work_location | Enum | No | remote, hybrid, office |
| career_level | String | No | Career level/grade |
| created_at | DateTime | Yes | Record creation |
| updated_at | DateTime | Yes | Last update |

### Department Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String | Yes | Department name |
| description | String | No | Description |
| parent_id | UUID | No | Parent department (hierarchy) |
| manager_id | UUID | No | Department head |
| status | Enum | Yes | active, inactive |
| created_at | DateTime | Yes | Record creation |
| updated_at | DateTime | Yes | Last update |

---

## 5. Access Control

### Profile Access Matrix

| Action | Self | Manager | HR | Admin | C-Suite |
|--------|------|---------|-----|-------|---------|
| View own profile (full) | ✅ | - | - | - | - |
| View direct reports (full) | - | ✅ | - | - | - |
| View any employee (basic) | ✅ | ✅ | - | - | ✅ |
| View any employee (full) | - | - | ✅ | ✅ | - |
| Edit own profile | ✅* | - | - | - | - |
| Edit any employee | - | - | ✅ | ✅ | - |
| Create employee | - | - | ✅ | ✅ | - |
| Delete/deactivate employee | - | - | - | ✅ | - |

*Limited fields only (phone, photo)

### Department Access Matrix

| Action | HR | Admin |
|--------|-----|-------|
| View departments | ✅ | ✅ |
| Create department | ✅ | ✅ |
| Edit department | ✅ | ✅ |
| Delete department | - | ✅ |
| Assign department head | ✅ | ✅ |

---

## UI Specifications

### Directory Card (Grid View)

```
┌─────────────────────┐
│      ┌─────┐        │
│      │ 📷  │        │
│      └─────┘        │
│    John Doe         │
│  Engineering Manager│
│  ───────────────    │
│  📧 john@co.com     │
│  🏢 Engineering     │
└─────────────────────┘
```

### Directory Row (List View)

```
┌────────────────────────────────────────────────────────┐
│ [📷] John Doe | Engineering Manager | Engineering | ➔ │
└────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [API Reference: Employees](/docs/api/employees.md)
- [API Reference: Departments](/docs/api/departments.md)
- [TSD: Database Schema](/docs/TSD.md#3-database-schema)
- [PRD: Goals](/docs/prd/04-goals.md)
- [PRD: Reviews](/docs/prd/05-reviews.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial version |
| 1.1 | February 2026 | System | Added trigger review profile action |
