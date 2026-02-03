# PRD: Goals & OKRs

## Employee Performance Monitoring Tool - MVP

**Module:** Goals & OKRs  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Goal Lifecycle](#4-goal-lifecycle)
5. [Data Model](#5-data-model)
6. [Access Control](#6-access-control)

---

## 1. Overview

The Goals & OKRs module enables employees and teams to set, track, and achieve objectives using the OKR (Objectives and Key Results) framework. It supports goal alignment from individual to company level.

### Goals

- Enable transparent goal setting across the organization
- Track progress with measurable key results
- Align individual goals with team and company objectives
- Provide visibility into goal achievement

---

## 2. Features

### 2.1 Goal Creation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | Text (200 chars) | Yes | Clear, concise goal statement |
| Description | Rich text (2000 chars) | No | Detailed description |
| Type | Dropdown | Yes | Individual, Team, Department, Company |
| Due Date | Date picker | Yes | Target completion date |
| Start Date | Date picker | No | When work begins |
| Priority | Dropdown | No | High, Medium, Low |
| Visibility | Dropdown | No | Private, Team, Department, Company |
| Parent Goal | Dropdown | No | For alignment |
| Tags | Multi-select | No | Categorization |

### 2.2 Key Results

Each goal can have 2-5 key results:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | Text (200 chars) | Yes | Measurable outcome |
| Description | Text (500 chars) | No | Additional context |
| Target Value | Number | Yes | Target to achieve |
| Current Value | Number | No | Current progress |
| Unit | Text | No | Unit of measurement (%, $, count) |
| Status | Auto-calculated | - | In Progress, Completed |

### 2.3 Goal Types

| Type | Description | Who Can Create |
|------|-------------|----------------|
| **Individual** | Personal development goals | All employees |
| **Team** | Shared team objectives | Managers |
| **Department** | Department-wide goals | Dept heads, HR |
| **Company** | Organization-wide objectives | Admin, HR, C-suite |

### 2.4 Goal Statuses

| Status | Description | Color |
|--------|-------------|-------|
| Draft | Created but not submitted | Gray |
| Pending Approval | Awaiting manager approval | Yellow |
| Active | Approved and in progress | Blue |
| Completed | Successfully achieved (100%) | Green |
| Cancelled | No longer relevant | Red |

### 2.5 Progress Tracking

| Indicator | Range | Color |
|-----------|-------|-------|
| On Track | 70-100% of expected progress | Green |
| At Risk | 40-69% of expected progress | Amber |
| Behind | 0-39% of expected progress | Red |

Progress calculation:
```
Expected Progress = (Days Elapsed / Total Days) * 100
Actual Progress = Average of Key Results progress
Status = Compare Actual vs Expected
```

### 2.6 Goal Views

| View | Description | Access |
|------|-------------|--------|
| My Goals | Personal goals list | All |
| Team Goals | Direct reports' goals | Managers |
| Department Goals | Department-wide goals | Managers, HR |
| Company Goals | Organization goals | All (read) |
| Alignment Tree | Visual hierarchy | All |
| Calendar | Goals by due date | All |
| Kanban | Goals by status | All |

---

## 3. User Stories & Acceptance Criteria

### US-GOAL-001: Create Goal

**As an** employee  
**I want to** create a new goal  
**So that** I can track my objectives

**Acceptance Criteria:**

- [ ] "Create Goal" button navigates to goal form
- [ ] Fields: Title (required), Description, Type, Due Date (required), Priority, Visibility
- [ ] Can add 2-5 key results with target values
- [ ] Can link parent goal for alignment
- [ ] Can add tags
- [ ] Save as draft or submit for approval
- [ ] Validation: Title required, Due date required, At least 1 key result
- [ ] Success message on save
- [ ] Manager receives approval notification
- [ ] Goal appears in "My Goals" with appropriate status

---

### US-GOAL-002: Update Goal Progress

**As an** employee  
**I want to** update my goal progress  
**So that** my manager can track my achievements

**Acceptance Criteria:**

- [ ] Progress slider/input (0-100%) for each key result
- [ ] Update current value for each key result
- [ ] Optional progress comment field
- [ ] Update button saves progress
- [ ] Progress history logged with timestamp
- [ ] Visual progress bar reflects new value
- [ ] Status auto-updates based on progress (On Track, At Risk, Behind)
- [ ] Goal progress auto-calculated from key results average
- [ ] Notification sent to manager on milestones (25%, 50%, 75%, 100%)
- [ ] Last updated date/time visible

---

### US-GOAL-003: Approve/Reject Goal

**As a** manager  
**I want to** approve or reject employee goals  
**So that** I can ensure alignment with team objectives

**Acceptance Criteria:**

- [ ] Pending goals appear in "Pending Approvals" widget
- [ ] Can view full goal details
- [ ] Approve button changes status to "Active"
- [ ] Reject button requires comment (min 10 chars)
- [ ] Employee receives notification of approval/rejection
- [ ] Rejected goals return to employee as draft with manager's comments
- [ ] Approved goals appear in employee's active goals
- [ ] Bulk approve option for multiple goals
- [ ] Due date for approval: 5 business days

---

### US-GOAL-004: View Goal Alignment

**As a** manager  
**I want to** see how team goals align to company objectives  
**So that** I can ensure strategic alignment

**Acceptance Criteria:**

- [ ] Goal alignment tree visualization
- [ ] Shows hierarchy: Company → Department → Team → Individual
- [ ] Can expand/collapse branches
- [ ] Alignment score calculated and displayed
- [ ] Unaligned goals highlighted
- [ ] Can click goal to view details
- [ ] Filter by department/team
- [ ] Export alignment report

---

### US-GOAL-005: Edit Goal

**As an** employee  
**I want to** edit my goals  
**So that** I can update them as priorities change

**Acceptance Criteria:**

- [ ] Edit button on goal detail page
- [ ] Can edit: Title, Description, Due Date, Priority, Tags
- [ ] Cannot edit: Type, Owner (unless Admin)
- [ ] Adding key results allowed
- [ ] Removing key results requires confirmation
- [ ] Changes require re-approval if goal is Active
- [ ] Edit history tracked
- [ ] Cancel button discards changes
- [ ] Success notification on save

---

### US-GOAL-006: Delete/Cancel Goal

**As an** employee  
**I want to** cancel a goal that's no longer relevant  
**So that** I can focus on current priorities

**Acceptance Criteria:**

- [ ] Cancel button on goal detail page
- [ ] Confirmation modal with reason field
- [ ] Reason required (dropdown: Priority change, Scope change, Already achieved, Other)
- [ ] Cancelled goals move to "Cancelled" status
- [ ] Cancelled goals hidden from main views (visible in archive)
- [ ] Manager notified of cancellation
- [ ] Cannot cancel completed goals
- [ ] Draft goals can be permanently deleted

---

### US-GOAL-007: Add Key Result

**As an** employee  
**I want to** add key results to my goal  
**So that** I can define measurable outcomes

**Acceptance Criteria:**

- [ ] "Add Key Result" button on goal form/detail
- [ ] Fields: Title (required), Target Value (required), Unit, Description
- [ ] Maximum 5 key results per goal
- [ ] Minimum 1 key result required for submission
- [ ] Can reorder key results (drag and drop)
- [ ] Each key result shows progress independently
- [ ] Goal progress = average of key results progress

---

### US-GOAL-008: Goal Templates

**As an** HR manager  
**I want to** create goal templates  
**So that** employees can quickly create common goals

**Acceptance Criteria:**

- [ ] Template management page (HR/Admin only)
- [ ] Create template from existing goal or scratch
- [ ] Template includes: Title pattern, Description, Suggested key results
- [ ] Templates categorized by department/role
- [ ] Employees can select template when creating goal
- [ ] Template pre-fills form fields
- [ ] Employee can modify pre-filled values
- [ ] Templates can be edited/deleted by HR/Admin

---

## 4. Goal Lifecycle

```
┌─────────┐     ┌──────────────┐     ┌─────────┐
│  Draft  │────▶│   Pending    │────▶│  Active │
│         │     │   Approval   │     │         │
└─────────┘     └──────────────┘     └────┬────┘
     │                 │                   │
     │                 │ Rejected          │
     │                 ▼                   │
     │          ┌──────────┐              │
     └──────────│  Draft   │◀─────────────┘
                │(Returned)│         (Edit requiring re-approval)
                └──────────┘
                                          │
     ┌────────────────────────────────────┘
     │
     ▼
┌─────────────┐     ┌─────────────┐
│  Completed  │     │  Cancelled  │
│   (100%)    │     │             │
└─────────────┘     └─────────────┘
```

### State Transitions

| From | To | Trigger | Actor |
|------|-----|---------|-------|
| - | Draft | Create goal | Employee |
| Draft | Pending Approval | Submit | Employee |
| Pending Approval | Active | Approve | Manager |
| Pending Approval | Draft | Reject | Manager |
| Active | Completed | Progress = 100% | System/Employee |
| Active | Cancelled | Cancel | Employee/Manager |
| Active | Pending Approval | Major edit | Employee |
| Draft | (Deleted) | Delete | Employee |

---

## 5. Data Model

### Goal Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| title | String(255) | Yes | Goal title |
| description | Text | No | Detailed description |
| type | Enum | Yes | individual, team, department, company |
| status | Enum | Yes | draft, pending, active, completed, cancelled |
| progress | Integer (0-100) | Yes | Overall progress percentage |
| priority | Enum | No | high, medium, low |
| visibility | Enum | No | private, team, department, company |
| owner_id | UUID | Yes | Employee who owns the goal |
| parent_goal_id | UUID | No | Parent goal for alignment |
| start_date | Date | No | Goal start date |
| due_date | Date | Yes | Target completion date |
| completed_at | DateTime | No | When goal was completed |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Key Result Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| goal_id | UUID | Yes | Parent goal |
| title | String(255) | Yes | Key result title |
| description | Text | No | Additional context |
| target_value | Decimal | Yes | Target to achieve |
| current_value | Decimal | No | Current progress (default 0) |
| unit | String(50) | No | Unit of measurement |
| status | Enum | Yes | in_progress, completed |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Progress History Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| goal_id | UUID | Related goal |
| key_result_id | UUID | Related key result (optional) |
| old_value | Decimal | Previous value |
| new_value | Decimal | New value |
| comment | Text | Progress note |
| updated_by | UUID | User who made update |
| created_at | DateTime | Timestamp |

---

## 6. Access Control

### Goal Permissions Matrix

| Action | Owner | Manager | HR | Admin |
|--------|-------|---------|-----|-------|
| Create own goal | ✅ | - | - | - |
| Create team goal | - | ✅ | ✅ | ✅ |
| Create dept goal | - | * | ✅ | ✅ |
| Create company goal | - | - | ✅ | ✅ |
| View own goals | ✅ | ✅ | ✅ | ✅ |
| View team goals | - | ✅ | ✅ | ✅ |
| View all goals | - | - | ✅ | ✅ |
| Edit own goals | ✅ | - | ✅ | ✅ |
| Edit team goals | - | ✅ | ✅ | ✅ |
| Delete own goals | ✅* | - | ✅ | ✅ |
| Approve goals | - | ✅ | ✅ | ✅ |

*Draft only for delete; Dept heads for department goals

---

## UI Specifications

### Goal Card

```
┌─────────────────────────────────────────────────────────┐
│ [Individual]                           Due: Mar 31, 2026│
│                                                         │
│ Complete AWS Certification                              │
│ Obtain AWS Solutions Architect certification            │
│                                                         │
│ ████████████████░░░░ 80%                               │
│                                                         │
│ Key Results: 2/3 complete                              │
│ Status: 🟢 On Track                    [View Details →]│
└─────────────────────────────────────────────────────────┘
```

### Goal Form

```
┌─────────────────────────────────────────────────────────┐
│ Create New Goal                              [×]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Title *                                                 │
│ ┌─────────────────────────────────────────────────────┐│
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Description                                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │                                                     ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Type *              │ Priority        │ Visibility      │
│ ┌─────────────────┐ │ ┌─────────────┐ │ ┌─────────────┐│
│ │ Individual    ▼ │ │ │ Medium    ▼ │ │ │ Team      ▼ ││
│ └─────────────────┘ │ └─────────────┘ │ └─────────────┘│
│                                                         │
│ Start Date          │ Due Date *                        │
│ ┌─────────────────┐ │ ┌─────────────────────────────┐  │
│ │ 📅 Jan 15, 2026 │ │ │ 📅 Mar 31, 2026            │  │
│ └─────────────────┘ │ └─────────────────────────────┘  │
│                                                         │
│ Align to Goal (Optional)                               │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Search parent goals...                            ▼ ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ─────────────────────────────────────────────────────  │
│                                                         │
│ Key Results                              [+ Add Result] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 1. Pass practice exams                             ││
│ │    Target: 85 %   Current: 0 %            [Remove] ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ 2. Complete official training                      ││
│ │    Target: 100 %   Current: 0 %           [Remove] ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
├─────────────────────────────────────────────────────────┤
│              [Save as Draft]  [Submit for Approval]    │
└─────────────────────────────────────────────────────────┘
```

---

## Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Goal submitted | Manager | "{Employee} submitted a goal for approval" |
| Goal approved | Owner | "Your goal '{Title}' was approved" |
| Goal rejected | Owner | "Your goal '{Title}' was returned with feedback" |
| Progress milestone | Manager | "{Employee} reached {X}% on '{Title}'" |
| Goal overdue | Owner, Manager | "Goal '{Title}' is past due date" |
| Deadline approaching | Owner | "Goal '{Title}' is due in {X} days" |

---

## Related Documents

- [API Reference: Goals](/docs/api/goals.md)
- [TSD: Database Schema](/docs/TSD.md#3-database-schema)
- [PRD: Reviews](/docs/prd/05-reviews.md) (goal review in evaluations)
- [PRD: Analytics](/docs/prd/06-analytics.md) (goal metrics)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial version |
