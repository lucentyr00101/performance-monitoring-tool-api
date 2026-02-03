# PRD: Ad-Hoc Review Trigger

## Employee Performance Monitoring Tool - MVP

**Module:** Ad-Hoc Review Trigger  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Workflow](#4-workflow)
5. [Data Model](#5-data-model)
6. [Access Control](#6-access-control)
7. [Notifications](#7-notifications)
8. [UI Specifications](#8-ui-specifications)

---

## 1. Overview

The Ad-Hoc Review Trigger feature enables HR admins, managers, and executives (excluding system admins) to initiate on-demand performance reviews for individual employees outside of scheduled review cycles. This feature supports KPI-based performance management by requiring both a self-review from the employee and a manager evaluation from their direct supervisor.

### Goals

- Enable timely performance feedback outside regular review cycles
- Support KPI-driven performance management
- Ensure both self-assessment and manager evaluation are captured
- Maintain transparency through proper notification flow
- Utilize department-specific review forms when available

### Use Cases

| Scenario | Description |
|----------|-------------|
| Probation Review | Trigger review at end of probation period |
| Mid-Project Assessment | Evaluate performance during critical projects |
| Promotion Consideration | Gather formal feedback before promotion decisions |
| Performance Concern | Document performance issues with formal review |
| Transfer/Role Change | Assess performance before internal transfer |
| Quarterly Check-In | Informal KPI review outside scheduled cycles |

---

## 2. Features

### 2.1 Trigger Review Action

| Feature | Description | Priority |
|---------|-------------|----------|
| Trigger from Employee Profile | Initiate review from employee's profile page | P0 |
| Trigger from Dashboard | Quick action for managers to trigger review | P0 |
| Trigger from Team View | Initiate review for team members | P0 |
| Select Review Form | Choose department or custom review form | P0 |
| Set Due Date | Configure deadline for review completion | P0 |
| Add Context | Provide reason/context for the ad-hoc review | P1 |
| Bulk Trigger | Trigger reviews for multiple employees | P2 |

### 2.2 Review Type: Ad-Hoc

The ad-hoc review creates two review assignments:

| Review Type | Assignee | Description |
|-------------|----------|-------------|
| Self-Review | Employee | Employee completes self-assessment |
| Manager Review | Direct Manager | Manager evaluates employee performance |

### 2.3 Review Form Selection

| Priority | Form Type | Description |
|----------|-----------|-------------|
| 1 | Department-Specific | Uses form assigned to employee's department |
| 2 | Default Company Form | Falls back to company-wide default form |
| 3 | Custom Selection | Initiator can override with specific form |

### 2.4 Ad-Hoc Review Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Self-Review Required | Boolean | true | Employee must complete self-review |
| Manager Review Required | Boolean | true | Manager must complete evaluation |
| Include Goals | Boolean | true | Show employee's active goals in review |
| Review Form | UUID | null | Specific form (null = use department form) |
| Due Date | Date | +14 days | Deadline for review completion |
| Reason | Text | null | Context for why review was triggered |

---

## 3. User Stories & Acceptance Criteria

### US-ADHOC-001: Trigger Ad-Hoc Review from Employee Profile

**As an** HR manager  
**I want to** trigger a performance review from an employee's profile  
**So that** I can initiate on-demand evaluations

**Acceptance Criteria:**

- [ ] "Trigger Review" button visible on employee profile for authorized users
- [ ] Button not visible for System Admins (technical role)
- [ ] Clicking button opens review configuration modal
- [ ] Modal shows employee name and department
- [ ] Review form automatically selected based on department
- [ ] Can override form selection if needed
- [ ] Due date picker with default of 14 days
- [ ] Optional "Reason" text field (max 500 characters)
- [ ] Confirm button creates review assignments
- [ ] Success notification: "Review initiated for [Employee Name]"
- [ ] Employee receives notification immediately
- [ ] Employee's manager receives notification immediately

---

### US-ADHOC-002: Trigger Ad-Hoc Review as Manager

**As a** manager  
**I want to** trigger a review for my direct report  
**So that** I can evaluate their performance at any time

**Acceptance Criteria:**

- [ ] "Trigger Review" quick action in manager dashboard
- [ ] Employee dropdown shows only direct reports
- [ ] Can select employee and configure review
- [ ] Department form auto-selected
- [ ] Due date defaults to 14 days
- [ ] Can add reason/context for review
- [ ] Creates both self-review and manager review assignments
- [ ] Employee notified immediately
- [ ] Review appears in manager's "Pending Evaluations"
- [ ] Cannot trigger review for employee already in active review

---

### US-ADHOC-003: Complete Self-Review (Ad-Hoc)

**As an** employee  
**I want to** complete my ad-hoc self-review  
**So that** I can provide input on my performance

**Acceptance Criteria:**

- [ ] Notification received with link to review
- [ ] Dashboard shows pending self-review with due date
- [ ] Review form displays based on department
- [ ] All form sections and questions available
- [ ] Active goals visible for self-rating (if enabled)
- [ ] Save as draft option
- [ ] Submit button requires all required fields
- [ ] Cannot edit after submission
- [ ] Manager notified when self-review submitted
- [ ] Confirmation message on submit

---

### US-ADHOC-004: Complete Manager Review (Ad-Hoc)

**As a** manager  
**I want to** complete my evaluation for an ad-hoc review  
**So that** I can provide formal feedback

**Acceptance Criteria:**

- [ ] Notification received when review is triggered
- [ ] Can view employee's self-review (if submitted)
- [ ] Review form matches department template
- [ ] Employee's active goals visible for rating
- [ ] All rating and feedback fields available
- [ ] Save as draft option
- [ ] Submit locks the review
- [ ] Employee notified when manager review is submitted
- [ ] Review moves to "Feedback Sharing" phase

---

### US-ADHOC-005: View Ad-Hoc Review as Employee

**As an** employee  
**I want to** view my completed ad-hoc review  
**So that** I can understand the feedback

**Acceptance Criteria:**

- [ ] Notification when manager review is complete
- [ ] Review shows in review history
- [ ] Can view self-review and manager review
- [ ] Overall rating displayed
- [ ] Goal ratings visible
- [ ] Manager feedback visible (strengths, improvements)
- [ ] Acknowledge button available
- [ ] Can add employee comments
- [ ] PDF download available
- [ ] Clearly marked as "Ad-Hoc Review" in history

---

### US-ADHOC-006: Track Ad-Hoc Reviews (HR)

**As an** HR manager  
**I want to** track all ad-hoc reviews in the organization  
**So that** I can monitor their usage and completion

**Acceptance Criteria:**

- [ ] Ad-hoc reviews section in HR dashboard
- [ ] List shows: Employee, Triggered By, Date, Status, Due Date
- [ ] Filter by: Status, Department, Triggered By, Date Range
- [ ] Completion statistics: Total, Completed, Pending, Overdue
- [ ] Can view individual review details
- [ ] Export ad-hoc review report
- [ ] Send reminder for overdue reviews

---

## 4. Workflow

### 4.1 Ad-Hoc Review Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AD-HOC REVIEW TRIGGER                           │
│                                                                     │
│  HR/Manager/C-Suite triggers review                                 │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CONFIGURATION                                                │   │
│  │ • Select employee                                            │   │
│  │ • Auto-select department review form                         │   │
│  │ • Set due date                                               │   │
│  │ • Add context/reason (optional)                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│         ▼ Confirm                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ NOTIFICATIONS SENT                                           │   │
│  │ • Employee: "A review has been requested for you"            │   │
│  │ • Manager: "Complete evaluation for [Employee]"              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────────────────┬──────────────────────────────────┐   │
│  │ SELF-REVIEW              │ MANAGER REVIEW                    │   │
│  │ (Parallel)               │ (Parallel)                        │   │
│  │                          │                                    │   │
│  │ Employee completes       │ Manager completes                  │   │
│  │ self-assessment          │ evaluation                         │   │
│  │                          │ (Can view self-review once done)   │   │
│  └──────────────────────────┴──────────────────────────────────┘   │
│         │                         │                                 │
│         └───────────┬─────────────┘                                 │
│                     ▼ Both submitted                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ FEEDBACK SHARING                                             │   │
│  │ • Employee views full review                                 │   │
│  │ • Employee acknowledges receipt                              │   │
│  │ • Optional employee comments                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ COMPLETED                                                    │   │
│  │ • Review archived                                            │   │
│  │ • Added to employee history                                  │   │
│  │ • Analytics updated                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Review States

| State | Description | Next States |
|-------|-------------|-------------|
| Initiated | Review triggered, awaiting submissions | Self Submitted, Manager Submitted |
| Self Submitted | Employee completed self-review | Awaiting Manager |
| Manager Submitted | Manager completed evaluation | Awaiting Self |
| Pending Acknowledgment | Both submitted, awaiting employee acknowledgment | Completed |
| Completed | Employee acknowledged, review finalized | (Final) |
| Overdue | Past due date without completion | (Any previous state) |

---

## 5. Data Model

### Ad-Hoc Review Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| employee_id | UUID | Yes | Employee being reviewed |
| manager_id | UUID | Yes | Employee's direct manager |
| triggered_by | UUID | Yes | User who initiated the review |
| triggered_at | DateTime | Yes | When review was triggered |
| reason | Text | No | Context for the review |
| due_date | Date | Yes | Deadline for completion |
| review_form_id | UUID | Yes | Template used for review |
| self_review_id | UUID | Yes | Link to self-review record |
| manager_review_id | UUID | Yes | Link to manager review record |
| status | Enum | Yes | initiated, pending_ack, completed, cancelled |
| completed_at | DateTime | No | When review was completed |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Extended Review Entity Fields

Add to existing Review entity:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_adhoc | Boolean | Yes | Whether this is an ad-hoc review |
| adhoc_review_id | UUID | No | Link to parent ad-hoc review |

---

## 6. Access Control

### Trigger Permissions Matrix

| Role | Can Trigger For | Notes |
|------|-----------------|-------|
| HR Manager | All employees | Can trigger for any active employee |
| Manager | Direct reports | Only employees in their hierarchy |
| C-Suite | All employees | Can trigger for any active employee |
| Employee | None | Cannot trigger reviews |
| System Admin | None | Technical role, no HR functions |

### Review Access Matrix

| Action | Employee | Manager | HR | Triggered By |
|--------|----------|---------|-----|--------------|
| View self-review | ✅ Own | ✅ | ✅ | ✅ |
| View manager review | ✅ Own | ✅ Own | ✅ | ✅ |
| Complete self-review | ✅ | - | - | - |
| Complete manager review | - | ✅ | - | - |
| Cancel ad-hoc review | - | - | ✅ | ✅ |
| Send reminders | - | ✅ | ✅ | ✅ |

---

## 7. Notifications

### Notification Events

| Event | Recipient | Title | Message |
|-------|-----------|-------|---------|
| Review Triggered | Employee | Performance Review Requested | "A performance review has been requested for you by {Triggered By}. Please complete your self-assessment by {Due Date}." |
| Review Triggered | Manager | Review Required: {Employee Name} | "A performance review has been initiated for {Employee Name}. Please complete your evaluation by {Due Date}." |
| Self-Review Submitted | Manager | Self-Review Completed | "{Employee Name} has completed their self-assessment. You can now view it alongside your evaluation." |
| Manager Review Submitted | Employee | Review Complete | "Your manager has completed your performance review. View and acknowledge it now." |
| Reminder (3 days) | Pending Party | Review Due Soon | "Reminder: Your review for {context} is due in 3 days." |
| Overdue | Pending Party + HR | Review Overdue | "The performance review for {Employee Name} is overdue." |

### Notification Channels

| Channel | Trigger | Reminder | Overdue |
|---------|---------|----------|---------|
| In-App | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ |
| Dashboard Widget | ✅ | ✅ | ✅ |

---

## 8. UI Specifications

### 8.1 Trigger Review Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Trigger Performance Review                            [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Employee                                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Alice Johnson                                        ││
│ │    Senior Developer • Engineering                       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Review Form                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📋 Engineering Department Review Form           [Auto] ▼││
│ └─────────────────────────────────────────────────────────┘│
│ ℹ️ Auto-selected based on employee's department            │
│                                                             │
│ Due Date *                                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📅 February 16, 2026                              ▼    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Reason for Review                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Mid-project performance check-in                        ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                            0/500 characters │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Review will include:                                        │
│ ✓ Self-assessment by Alice Johnson                         │
│ ✓ Manager evaluation by John Doe (Direct Manager)          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                           [Cancel]  [Trigger Review]        │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Dashboard Widget - Pending Ad-Hoc Reviews

```
┌─────────────────────────────────────────────────────────────┐
│ Pending Ad-Hoc Reviews                        [View All →] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Alice Johnson                    Due: Feb 16, 2026   ││
│ │    Self-Review: ✅ Submitted                            ││
│ │    Manager Review: ⏳ Pending        [Complete Review →] ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Bob Smith                        Due: Feb 20, 2026   ││
│ │    Self-Review: ⏳ Pending                              ││
│ │    Manager Review: ⏳ Pending             [Send Reminder]││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Employee Profile - Trigger Button

```
┌────────────────────────────────────────────────────────────┐
│ ┌──────┐  Alice Johnson                                    │
│ │ 📷   │  Senior Developer                                 │
│ │Avatar│  Engineering Department                           │
│ └──────┘  alice.johnson@company.com                        │
│                                                            │
│  [View Goals] [View Reviews] [Trigger Review ▼]            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### Goals Module

- Ad-hoc review includes employee's active goals for context
- Goal progress visible during self-assessment and manager evaluation
- Goal ratings captured as part of review

### Analytics Module

- Ad-hoc reviews tracked separately in analytics
- Metrics: Volume, completion rate, average rating
- Trend analysis: Ad-hoc reviews by department, trigger reason

### Department Review Forms

- Auto-selects form based on employee's department
- Falls back to default form if no department form exists
- See [PRD: Department Review Forms](./09-review-forms.md)

---

## Related Documents

- [API Reference: Reviews](/docs/api/reviews.md)
- [PRD: Performance Reviews](/docs/prd/05-reviews.md)
- [PRD: Department Review Forms](/docs/prd/09-review-forms.md)
- [PRD: Dashboard](/docs/prd/02-dashboard.md)
- [PRD: Employees](/docs/prd/03-employees.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | System | Initial version |
