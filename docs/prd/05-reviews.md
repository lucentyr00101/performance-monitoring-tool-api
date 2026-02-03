# PRD: Performance Reviews

## Employee Performance Monitoring Tool - MVP

**Module:** Performance Reviews  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Review Workflow](#4-review-workflow)
5. [Data Model](#5-data-model)
6. [Access Control](#6-access-control)

---

## 1. Overview

The Performance Reviews module enables organizations to conduct structured performance evaluations through configurable review cycles. It supports self-assessments, manager evaluations, and performance feedback.

### Goals

- Streamline performance review processes
- Enable fair, consistent evaluations
- Provide structured feedback mechanisms
- Track performance trends over time

---

## 2. Features

### 2.1 Review Cycle Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create Cycle | Define review period and participants | P0 |
| Configure Phases | Set dates for each phase | P0 |
| Select Template | Choose evaluation template | P0 |
| Launch Cycle | Initiate reviews and notify participants | P0 |
| Monitor Progress | Track completion rates | P0 |
| Close Cycle | Finalize and archive | P1 |

#### Cycle Types

| Type | Frequency | Typical Duration |
|------|-----------|------------------|
| Annual | Once per year | 4-6 weeks |
| Semi-Annual | Twice per year | 2-4 weeks |
| Quarterly | Four times per year | 2-3 weeks |
| Monthly | Every month | 1 week |
| Ad-hoc | As needed (triggered on-demand) | Variable |

> **Note:** Ad-hoc reviews can be triggered outside of scheduled cycles by HR, managers, or executives. See [PRD: Ad-Hoc Reviews](./08-adhoc-reviews.md) for details.

#### Cycle Phases

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Self     │───▶│   Manager   │───▶│ Calibration │───▶│  Feedback   │
│ Assessment  │    │ Evaluation  │    │  (Optional) │    │  Sharing    │
│  (Week 1)   │    │  (Week 2)   │    │  (Week 3)   │    │  (Week 4)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

### 2.2 Review Templates

| Feature | Description |
|---------|-------------|
| Create Template | Build reusable evaluation forms |
| Question Types | Rating scale, text, multiple choice |
| Sections | Group questions by category |
| Versioning | Track template changes |
| Clone | Copy and modify existing templates |
| Department Assignment | Assign forms to specific departments |

> **Note:** Review forms can be customized per department. When a review is triggered, the system automatically selects the appropriate form based on the employee's department. See [PRD: Department Review Forms](./09-review-forms.md) for details.

#### Question Types

| Type | Description | Example |
|------|-------------|---------|
| Rating Scale | 1-5 or 1-10 scale | "Rate communication skills" |
| Text (Short) | Single line response | "Top achievement this quarter" |
| Text (Long) | Multi-paragraph response | "Describe growth areas" |
| Multiple Choice | Select one option | "Performance level" |
| Goal Review | Rate specific goals | "Goal completion rating" |

#### Default Template Sections

1. **Overall Performance** - General rating and summary
2. **Core Competencies** - Skills and behaviors
3. **Goal Achievement** - Review of objectives
4. **Strengths** - Areas of excellence
5. **Development Areas** - Improvement opportunities
6. **Looking Forward** - Future goals and development

---

### 2.3 Self-Assessment

| Feature | Description |
|---------|-------------|
| Form Completion | Answer template questions |
| Goal Review | Self-rate goal achievement |
| Save Draft | Continue later |
| Submit | Lock and send to manager |
| Deadline Display | Show due date prominently |

---

### 2.4 Manager Evaluation

| Feature | Description |
|---------|-------------|
| View Self-Assessment | See employee's input |
| Complete Evaluation | Rate employee performance |
| Goal Assessment | Evaluate goal completion |
| Provide Feedback | Strengths and improvement areas |
| Overall Rating | Final performance rating |
| Submit | Finalize evaluation |

---

### 2.5 Rating Scale

#### Default 5-Point Scale

| Rating | Label | Description |
|--------|-------|-------------|
| 5 | Exceptional | Consistently exceeds all expectations |
| 4 | Exceeds Expectations | Frequently exceeds expectations |
| 3 | Meets Expectations | Consistently meets requirements |
| 2 | Needs Improvement | Sometimes falls short of expectations |
| 1 | Unsatisfactory | Does not meet minimum requirements |

---

### 2.6 Review History

| Feature | Description |
|---------|-------------|
| Timeline View | All reviews chronologically |
| Detail View | Full review content |
| Compare Reviews | Side-by-side comparison |
| Download PDF | Export individual reviews |
| Trend Chart | Performance over time |

---

## 3. User Stories & Acceptance Criteria

### US-REV-001: Create Review Cycle

**As an** HR manager  
**I want to** create a performance review cycle  
**So that** I can conduct organization-wide reviews

**Acceptance Criteria:**

- [ ] "Create Review Cycle" button accessible to HR/Admin
- [ ] Form fields: Cycle Name, Type, Start/End Dates, Template, Participants
- [ ] Phase configuration: Self-assessment period, Manager evaluation period, Feedback period
- [ ] Participants selection: All employees, Specific departments, Custom list
- [ ] Date validation: End date > Start date, No overlapping active cycles
- [ ] Save button creates cycle in "Draft" status
- [ ] Can edit draft cycle before launch
- [ ] Preview participant list before launch

---

### US-REV-002: Launch Review Cycle

**As an** HR manager  
**I want to** launch a review cycle  
**So that** employees can begin their reviews

**Acceptance Criteria:**

- [ ] Launch button on draft cycle
- [ ] Confirmation modal showing participant count
- [ ] System creates review assignments for all participants
- [ ] Email notifications sent to all participants
- [ ] Dashboard notifications created
- [ ] Cycle status changes to "Active"
- [ ] Self-assessment phase begins
- [ ] Cannot edit cycle dates after launch

---

### US-REV-003: Complete Self-Assessment

**As an** employee  
**I want to** complete my self-assessment  
**So that** I can provide input on my performance

**Acceptance Criteria:**

- [ ] Notification received when self-assessment period starts
- [ ] Dashboard widget shows pending self-assessment
- [ ] Form displays template questions by section
- [ ] Rating scales functional (1-5 stars or slider)
- [ ] Text fields support 2000 characters
- [ ] Goal review section shows active goals with self-ratings
- [ ] Save as draft button (can edit later)
- [ ] Submit button requires all required fields
- [ ] Submission deadline clearly visible with countdown
- [ ] Cannot edit after submission (unless manager returns)
- [ ] Confirmation message on submit
- [ ] Manager notified of completion

---

### US-REV-004: Conduct Manager Evaluation

**As a** manager  
**I want to** evaluate my direct reports  
**So that** I can provide performance feedback

**Acceptance Criteria:**

- [ ] Pending evaluations listed in dashboard
- [ ] Can view employee's self-assessment side-by-side
- [ ] Evaluation form matches template
- [ ] Can rate employee on each criterion
- [ ] Can review and rate employee's goals
- [ ] Overall performance rating required
- [ ] Feedback text fields (strengths, improvement areas)
- [ ] Save as draft option
- [ ] Submit for finalization
- [ ] Cannot submit without all required fields
- [ ] Submit locks the review
- [ ] Employee not notified until feedback sharing phase

---

### US-REV-005: View and Acknowledge Review

**As an** employee  
**I want to** view my completed review  
**So that** I can understand my performance feedback

**Acceptance Criteria:**

- [ ] Notification when review is shared
- [ ] Review displays all sections: self-assessment, manager evaluation, overall rating
- [ ] Overall rating prominently displayed
- [ ] Goal ratings visible
- [ ] Feedback clearly formatted
- [ ] Acknowledge button confirms receipt
- [ ] Optional: Add employee comments
- [ ] Acknowledgment timestamp recorded
- [ ] Can download review as PDF
- [ ] Review added to history

---

### US-REV-006: View Review History

**As an** employee  
**I want to** view my past performance reviews  
**So that** I can track my career progression

**Acceptance Criteria:**

- [ ] Review history page shows all completed reviews
- [ ] Reviews sorted by date (newest first)
- [ ] Can click to view full review details
- [ ] Performance trend chart shows ratings over time
- [ ] Download review as PDF button
- [ ] Compare feature: Select 2 reviews to compare
- [ ] Filter by year/quarter
- [ ] Manager comments visible
- [ ] Self-assessment visible

---

### US-REV-007: Create Review Template

**As an** HR manager  
**I want to** create evaluation templates  
**So that** reviews are consistent

**Acceptance Criteria:**

- [ ] Template builder page (HR/Admin only)
- [ ] Add sections with titles
- [ ] Add questions within sections
- [ ] Question types: Rating (1-5), Text (short/long), Multiple choice
- [ ] Mark questions as required/optional
- [ ] Reorder sections and questions (drag and drop)
- [ ] Preview template
- [ ] Save template with name and description
- [ ] Clone existing template
- [ ] Edit saved templates
- [ ] Cannot delete template in use by active cycle

---

### US-REV-008: Monitor Cycle Progress

**As an** HR manager  
**I want to** monitor review cycle progress  
**So that** I can ensure timely completion

**Acceptance Criteria:**

- [ ] Cycle dashboard shows overall completion rate
- [ ] Progress bar for each phase
- [ ] Breakdown by: Self-assessment, Manager evaluation
- [ ] List of incomplete reviews
- [ ] Filter by department
- [ ] Send reminder button for incomplete reviews
- [ ] Export completion report
- [ ] Days remaining until deadline
- [ ] Alert for low completion rates

---

## 4. Review Workflow

### 4.1 Complete Workflow Diagram

```
HR Creates Cycle
        │
        ▼
┌───────────────┐
│  Draft Cycle  │
└───────┬───────┘
        │ Launch
        ▼
┌───────────────────────────────────────────────────────────┐
│                    ACTIVE CYCLE                           │
│                                                           │
│  Phase 1: Self-Assessment                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Employee receives notification                       │ │
│  │ Employee completes self-assessment                   │ │
│  │ Employee submits                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                 │
│                         ▼                                 │
│  Phase 2: Manager Evaluation                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Manager receives notification                        │ │
│  │ Manager views self-assessment                        │ │
│  │ Manager completes evaluation                         │ │
│  │ Manager submits                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                 │
│                         ▼                                 │
│  Phase 3: Calibration (Optional)                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ HR/Managers review rating distribution               │ │
│  │ Adjust ratings for consistency                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                 │
│                         ▼                                 │
│  Phase 4: Feedback Sharing                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Reviews shared with employees                        │ │
│  │ Employee views and acknowledges                      │ │
│  │ Optional discussion meeting                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────┐
│ Cycle Complete│
│  (Archived)   │
└───────────────┘
```

### 4.2 Review States

| State | Description | Next States |
|-------|-------------|-------------|
| Pending | Assigned, not started | In Progress |
| In Progress | Started, not submitted | Submitted (back to Draft if returned) |
| Submitted | Completed and locked | Acknowledged |
| Acknowledged | Employee confirmed receipt | (Final) |

---

## 5. Data Model

### Review Cycle Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String(255) | Yes | Cycle name |
| description | Text | No | Description |
| type | Enum | Yes | annual, semi-annual, quarterly, monthly |
| start_date | Date | Yes | Cycle start |
| end_date | Date | Yes | Cycle end |
| status | Enum | Yes | draft, active, completed, cancelled |
| template_id | UUID | Yes | Evaluation template |
| settings | JSON | No | Cycle configuration |
| created_by | UUID | Yes | Creator |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update |

### Review Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| cycle_id | UUID | Yes | Parent cycle |
| employee_id | UUID | Yes | Employee being reviewed |
| reviewer_id | UUID | Yes | Person conducting review |
| type | Enum | Yes | self, manager, peer |
| status | Enum | Yes | pending, in_progress, submitted, acknowledged |
| rating | Decimal(3,2) | No | Overall rating (1.00-5.00) |
| ratings_breakdown | JSON | No | Individual question ratings |
| strengths | Text | No | Strengths feedback |
| improvements | Text | No | Improvement areas |
| comments | Text | No | General comments |
| employee_comments | Text | No | Employee response |
| submitted_at | DateTime | No | Submission timestamp |
| acknowledged_at | DateTime | No | Acknowledgment timestamp |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update |

### Review Template Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String(255) | Yes | Template name |
| description | Text | No | Description |
| sections | JSON | Yes | Sections and questions |
| rating_scale | JSON | Yes | Scale configuration |
| status | Enum | Yes | active, archived |
| created_by | UUID | Yes | Creator |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update |

---

## 6. Access Control

### Review Permissions Matrix

| Action | Employee | Manager | HR | Admin |
|--------|----------|---------|-----|-------|
| View own reviews | ✅ | - | - | - |
| Submit self-assessment | ✅ | - | - | - |
| View team reviews | - | ✅ | ✅ | ✅ |
| Submit manager evaluation | - | ✅ | - | - |
| View all reviews | - | - | ✅ | ✅ |
| Create review cycle | - | - | ✅ | ✅ |
| Manage templates | - | - | ✅ | ✅ |
| Delete review cycle | - | - | - | ✅ |

---

## UI Specifications

### Review Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Q4 2025 Performance Review                                  │
│ Self-Assessment                    Due: Dec 15, 2025        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ═══════════════════════════════════════════════════════════│
│ SECTION 1: Overall Performance                              │
│ ═══════════════════════════════════════════════════════════│
│                                                             │
│ 1. How would you rate your overall performance this quarter?│
│    ○ 1 - Unsatisfactory                                     │
│    ○ 2 - Needs Improvement                                  │
│    ● 3 - Meets Expectations                                 │
│    ○ 4 - Exceeds Expectations                               │
│    ○ 5 - Exceptional                                        │
│                                                             │
│ 2. Describe your key accomplishments this quarter: *        │
│    ┌───────────────────────────────────────────────────┐   │
│    │ I successfully led the migration project...       │   │
│    │                                                   │   │
│    │                                                   │   │
│    └───────────────────────────────────────────────────┘   │
│                                             245/2000 chars  │
│                                                             │
│ ═══════════════════════════════════════════════════════════│
│ SECTION 2: Goal Achievement                                 │
│ ═══════════════════════════════════════════════════════════│
│                                                             │
│ Rate your progress on each goal:                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Complete AWS Certification                   80% ████████││
│ │ Self-rating: ★★★★☆ (4/5)                                ││
│ │ Comments: Passed 2 of 3 exams, final scheduled          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Improve Code Review Process                  100% ████████││
│ │ Self-rating: ★★★★★ (5/5)                                ││
│ │ Comments: Implemented new guidelines, team adopted      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    [Save Draft]  [Submit Assessment]        │
└─────────────────────────────────────────────────────────────┘
```

### Manager Evaluation View

```
┌─────────────────────────────────────────────────────────────┐
│ Manager Evaluation: Alice Johnson                           │
│ Q4 2025 Performance Review                                  │
├────────────────────────────┬────────────────────────────────┤
│ Employee Self-Assessment   │ Your Evaluation                │
├────────────────────────────┼────────────────────────────────┤
│                            │                                │
│ Overall Rating: 4/5        │ Overall Rating: *              │
│                            │ ○ 1  ○ 2  ● 3  ○ 4  ○ 5       │
│ "I successfully led..."    │                                │
│                            │ Your assessment: *             │
│                            │ ┌────────────────────────────┐│
│                            │ │                            ││
│                            │ └────────────────────────────┘│
│                            │                                │
│ Goal: AWS Cert (80%)       │ Goal Rating:                   │
│ Self-rating: 4/5           │ ○ 1  ○ 2  ○ 3  ● 4  ○ 5       │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

---

## Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Cycle launched | All participants | "Q4 2025 Performance Review has started. Complete your self-assessment by {date}" |
| Self-assessment submitted | Manager | "{Employee} submitted their self-assessment" |
| Manager evaluation due | Manager | "Complete evaluations for your team by {date}" |
| Review shared | Employee | "Your Q4 2025 performance review is ready to view" |
| Reminder (3 days) | Pending participants | "Reminder: Your {review type} is due in 3 days" |
| Cycle complete | HR | "Q4 2025 Review Cycle is complete. {X}% completion rate" |

---

## Related Documents

- [API Reference: Reviews](/docs/api/reviews.md)
- [API Reference: Review Forms](/docs/api/review-forms.md)
- [TSD: Database Schema](/docs/TSD.md#3-database-schema)
- [PRD: Goals](/docs/prd/04-goals.md)
- [PRD: Analytics](/docs/prd/06-analytics.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)
- [PRD: Department Review Forms](/docs/prd/09-review-forms.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial version |
| 1.1 | February 2026 | System | Added references to ad-hoc reviews and department forms |
