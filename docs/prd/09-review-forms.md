# PRD: Department Review Forms

## Employee Performance Monitoring Tool - MVP

**Module:** Department Review Forms  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Form Builder](#4-form-builder)
5. [Data Model](#5-data-model)
6. [Access Control](#6-access-control)
7. [Form Assignment Flow](#7-form-assignment-flow)
8. [UI Specifications](#8-ui-specifications)

---

## 1. Overview

The Department Review Forms feature enables HR admins and managers to create, upload, and manage department-specific performance review forms. Different departments may have unique KPIs, competencies, and evaluation criteria, requiring customized review templates.

### Goals

- Allow customization of review forms per department
- Support diverse evaluation criteria across the organization
- Enable department heads to define relevant competencies
- Maintain a default company-wide form as fallback
- Ensure proper form versioning and audit trail

### Business Value

| Benefit | Description |
|---------|-------------|
| Relevant Evaluations | Departments can assess skills specific to their function |
| Fair Assessments | Engineers evaluated on technical skills, Sales on revenue metrics |
| Compliance | Certain departments may have regulatory-specific requirements |
| Flexibility | Easy to update forms as department needs evolve |

---

## 2. Features

### 2.1 Review Form Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create Form | Build new review form from scratch | P0 |
| Clone Form | Duplicate existing form as starting point | P0 |
| Edit Form | Modify existing form (creates new version) | P0 |
| Preview Form | View form as employee/manager would see it | P0 |
| Archive Form | Retire form (keep for historical records) | P1 |
| Set Default | Mark form as company-wide default | P0 |
| Assign to Department | Link form to specific department | P0 |
| Version History | Track changes to forms over time | P1 |
| Import/Export | Import form from JSON/export to JSON | P2 |

### 2.2 Form Components

#### Section Types

| Type | Description | Use Case |
|------|-------------|----------|
| Rating Section | Questions with rating scale | Performance ratings |
| Text Section | Open-ended questions | Narrative feedback |
| Goal Review | Auto-populated goal assessment | Goal-based reviews |
| Competency Matrix | Rate multiple competencies | Skill assessments |
| Custom | Configurable question mix | Specialized sections |

#### Question Types

| Type | Description | Example |
|------|-------------|---------|
| Rating Scale | 1-5 or 1-10 numeric scale | "Rate communication skills" |
| Star Rating | Visual star rating | "Overall performance" |
| Text (Short) | Single line, max 200 chars | "Top achievement" |
| Text (Long) | Multi-line, max 2000 chars | "Describe growth areas" |
| Multiple Choice | Select one from options | "Performance level" |
| Checkbox | Select multiple from options | "Skills demonstrated" |
| Yes/No | Binary question | "Met expectations?" |
| Goal Rating | Rate linked goal | "Rate goal completion" |
| Number Input | Numeric value | "Projects completed" |

### 2.3 Form Structure

```
Review Form
├── Header
│   ├── Form Name
│   ├── Description
│   └── Instructions
│
├── Section 1: Overall Performance
│   ├── Question 1.1: Rating Scale
│   ├── Question 1.2: Text (Long)
│   └── Question 1.3: Rating Scale
│
├── Section 2: Goals & Objectives
│   ├── Goal Review (Auto-populated)
│   └── Question 2.1: Text (Long)
│
├── Section 3: Core Competencies
│   ├── Competency Matrix
│   └── Question 3.1: Text (Short)
│
├── Section 4: Development
│   ├── Question 4.1: Text (Long)
│   └── Question 4.2: Multiple Choice
│
└── Section 5: Manager Summary
    └── Question 5.1: Text (Long)
```

### 2.4 Department Form Assignment

| Feature | Description |
|---------|-------------|
| Assign Form | Link form to one or more departments |
| Override | Child departments can override parent form |
| Effective Date | When form becomes active |
| Self vs Manager Forms | Different forms for self and manager reviews |

### 2.5 Default Form Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORM SELECTION PRIORITY                       │
│                                                                  │
│  1. Employee's Department Form (Highest Priority)               │
│     └── If Engineering has a custom form, use it                │
│                                                                  │
│  2. Parent Department Form                                       │
│     └── If Engineering inherits from Technology, use that       │
│                                                                  │
│  3. Company Default Form (Lowest Priority)                       │
│     └── If no department form exists, use company default       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. User Stories & Acceptance Criteria

### US-FORM-001: Create Review Form

**As an** HR manager  
**I want to** create a new performance review form  
**So that** I can define evaluation criteria for the organization

**Acceptance Criteria:**

- [ ] "Create Form" button accessible to HR and Admin
- [ ] Form builder opens with blank template
- [ ] Can add form name and description
- [ ] Can add sections with titles
- [ ] Can add questions within sections
- [ ] Question types available: Rating, Text, Multiple Choice, etc.
- [ ] Can mark questions as required or optional
- [ ] Can reorder sections and questions (drag and drop)
- [ ] Preview button shows form as reviewer would see it
- [ ] Save as draft option
- [ ] Publish makes form available for use
- [ ] Success notification on save

---

### US-FORM-002: Assign Form to Department

**As an** HR manager  
**I want to** assign a review form to a department  
**So that** department employees are evaluated appropriately

**Acceptance Criteria:**

- [ ] Form detail page shows "Assign to Department" button
- [ ] Department selection dropdown available
- [ ] Can select multiple departments
- [ ] Can set effective date
- [ ] Can choose: Self-review form, Manager review form, or Both
- [ ] Assignment confirmation modal
- [ ] Previously assigned form becomes inactive for that department
- [ ] Success notification: "Form assigned to [Department]"
- [ ] Department shows assigned form in department settings

---

### US-FORM-003: Edit Review Form

**As an** HR manager  
**I want to** edit an existing review form  
**So that** I can update evaluation criteria as needed

**Acceptance Criteria:**

- [ ] Edit button on form detail page
- [ ] Form builder opens with existing content
- [ ] Can modify sections and questions
- [ ] Can add/remove questions
- [ ] Editing published form creates new version
- [ ] Previous version archived for historical reviews
- [ ] Version number incremented (1.0 → 1.1)
- [ ] Active reviews continue using original version
- [ ] New reviews use updated version
- [ ] Audit log records who made changes

---

### US-FORM-004: Clone Review Form

**As an** HR manager  
**I want to** clone an existing form  
**So that** I can create variations without starting from scratch

**Acceptance Criteria:**

- [ ] "Clone" button on form detail page
- [ ] New form created with name "[Original Name] (Copy)"
- [ ] All sections and questions copied
- [ ] New form is in draft status
- [ ] Can edit cloned form independently
- [ ] No department assignments copied
- [ ] Success notification: "Form cloned successfully"

---

### US-FORM-005: Set Company Default Form

**As an** HR admin  
**I want to** set a form as the company default  
**So that** departments without custom forms have a fallback

**Acceptance Criteria:**

- [ ] "Set as Default" button on published forms
- [ ] Only one form can be default at a time
- [ ] Previous default form loses default status
- [ ] Default form indicated with badge/icon
- [ ] Default form used when no department form exists
- [ ] Cannot delete or archive the default form
- [ ] Success notification: "Form set as company default"

---

### US-FORM-006: Preview Review Form

**As an** HR manager  
**I want to** preview a form before publishing  
**So that** I can verify it appears correctly

**Acceptance Criteria:**

- [ ] Preview button in form builder
- [ ] Preview opens in modal or new tab
- [ ] Form displays as employee would see it
- [ ] Toggle between self-review and manager-review views
- [ ] All question types render correctly
- [ ] Rating scales interactive (but not saved)
- [ ] Can close preview and return to editor
- [ ] Preview available for draft and published forms

---

### US-FORM-007: View Form Version History

**As an** HR manager  
**I want to** view the history of a form  
**So that** I can track changes and understand evolution

**Acceptance Criteria:**

- [ ] "Version History" tab on form detail page
- [ ] List of all versions with: Version number, Date, Changed by
- [ ] Can view any previous version (read-only)
- [ ] Can compare two versions side-by-side
- [ ] Can restore a previous version (creates new version)
- [ ] Current active version highlighted
- [ ] Shows which reviews used each version

---

### US-FORM-008: Department Manager Customization

**As a** department manager  
**I want to** suggest changes to my department's review form  
**So that** evaluations reflect our specific needs

**Acceptance Criteria:**

- [ ] Department managers can view their assigned form
- [ ] "Request Changes" button available
- [ ] Opens request form with text field
- [ ] Can specify sections/questions to change
- [ ] Request sent to HR for review
- [ ] HR receives notification of request
- [ ] HR can approve/reject with comments
- [ ] Manager notified of decision

---

## 4. Form Builder

### 4.1 Builder Interface Components

| Component | Description |
|-----------|-------------|
| Canvas | Main area showing form structure |
| Section Panel | Add/edit sections |
| Question Panel | Add/edit questions |
| Properties Panel | Configure selected element |
| Preview Panel | Real-time preview |
| Toolbar | Save, preview, publish actions |

### 4.2 Section Configuration

| Property | Type | Description |
|----------|------|-------------|
| Title | Text | Section heading |
| Description | Text | Section instructions |
| Order | Number | Display order |
| Collapsible | Boolean | Can be collapsed |
| For Reviewer | Dropdown | Self, Manager, Both |

### 4.3 Question Configuration

| Property | Type | Description |
|----------|------|-------------|
| Question Text | Text | The question itself |
| Help Text | Text | Additional guidance |
| Required | Boolean | Must be answered |
| Question Type | Dropdown | Rating, Text, etc. |
| Weight | Number | For score calculation |
| For Reviewer | Dropdown | Self, Manager, Both |
| Validation | Object | Min/max, character limits |

### 4.4 Rating Scale Configuration

| Property | Type | Description |
|----------|------|-------------|
| Scale Type | Dropdown | Numeric, Stars, Custom |
| Min Value | Number | Lowest rating |
| Max Value | Number | Highest rating |
| Labels | Object | Label for each value |
| Show Labels | Boolean | Display value labels |
| N/A Option | Boolean | Include "Not Applicable" |

---

## 5. Data Model

### Review Form Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String(255) | Yes | Form name |
| description | Text | No | Form description |
| instructions | Text | No | Completion instructions |
| version | String(20) | Yes | Version number (e.g., "1.0") |
| status | Enum | Yes | draft, published, archived |
| is_default | Boolean | Yes | Company default form |
| sections | JSON | Yes | Form sections and questions |
| settings | JSON | No | Form configuration |
| created_by | UUID | Yes | Creator |
| published_at | DateTime | No | When published |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Form Section Schema (JSON)

```json
{
  "sections": [
    {
      "id": "section-uuid",
      "title": "Overall Performance",
      "description": "Rate overall performance for this period",
      "order": 1,
      "collapsible": false,
      "for_reviewer": "both",
      "questions": [
        {
          "id": "question-uuid",
          "text": "How would you rate overall performance?",
          "help_text": "Consider all aspects of the role",
          "type": "rating_scale",
          "required": true,
          "for_reviewer": "both",
          "config": {
            "scale_type": "numeric",
            "min": 1,
            "max": 5,
            "labels": {
              "1": "Needs Improvement",
              "2": "Below Expectations",
              "3": "Meets Expectations",
              "4": "Exceeds Expectations",
              "5": "Outstanding"
            }
          }
        }
      ]
    }
  ]
}
```

### Department Form Assignment Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| department_id | UUID | Yes | Assigned department |
| review_form_id | UUID | Yes | Assigned form |
| form_type | Enum | Yes | self, manager, both |
| effective_date | Date | Yes | When assignment becomes active |
| assigned_by | UUID | Yes | Who made the assignment |
| status | Enum | Yes | active, inactive |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Form Version History Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| review_form_id | UUID | Yes | Parent form |
| version | String(20) | Yes | Version number |
| sections | JSON | Yes | Form content snapshot |
| changed_by | UUID | Yes | Who made changes |
| change_summary | Text | No | Description of changes |
| created_at | DateTime | Yes | When version was created |

---

## 6. Access Control

### Form Management Permissions

| Action | HR Manager | Admin | Dept Manager | Employee |
|--------|------------|-------|--------------|----------|
| Create form | ✅ | ✅ | ❌ | ❌ |
| Edit form | ✅ | ✅ | ❌ | ❌ |
| Delete form | ❌ | ✅ | ❌ | ❌ |
| Archive form | ✅ | ✅ | ❌ | ❌ |
| Clone form | ✅ | ✅ | ❌ | ❌ |
| Set as default | ❌ | ✅ | ❌ | ❌ |
| Assign to department | ✅ | ✅ | ❌ | ❌ |
| View all forms | ✅ | ✅ | ❌ | ❌ |
| View department form | ✅ | ✅ | ✅ | ❌ |
| Request changes | ❌ | ❌ | ✅ | ❌ |
| Preview form | ✅ | ✅ | ✅ | ❌ |

---

## 7. Form Assignment Flow

### 7.1 When Review is Triggered

```
Review Triggered for Employee
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ FORM SELECTION ALGORITHM                                       │
│                                                                │
│  1. Get employee's department_id                               │
│                                                                │
│  2. Check for active department form assignment                │
│     SELECT * FROM department_form_assignments                  │
│     WHERE department_id = :dept_id                             │
│       AND status = 'active'                                    │
│       AND effective_date <= NOW()                              │
│                                                                │
│  3. If no department form found:                               │
│     └── Check parent department (recursively)                  │
│                                                                │
│  4. If still no form found:                                    │
│     └── Use company default form (is_default = true)           │
│                                                                │
│  5. Create review with selected form                           │
│     └── Store form_id and form_version in review record        │
│                                                                │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
Review Created with Appropriate Form
```

### 7.2 Form Version Locking

```
┌────────────────────────────────────────────────────────────────┐
│ FORM VERSION LOCKING                                            │
│                                                                 │
│ When a review is created:                                       │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ review.form_id = form.id                                    ││
│ │ review.form_version = form.version                          ││
│ │ review.form_snapshot = form.sections (JSON copy)            ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ This ensures:                                                   │
│ • Active reviews use the form version at creation time          │
│ • Form updates don't affect in-progress reviews                 │
│ • Historical reviews preserve their original form               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. UI Specifications

### 8.1 Form Builder

```
┌─────────────────────────────────────────────────────────────────────┐
│ Form Builder: Engineering Performance Review           [Save Draft]│
│                                           [Preview] [Publish]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────┐ ┌─────────────────────────────────────────┐│
│ │ ADD ELEMENTS        │ │                CANVAS                   ││
│ │                     │ │                                         ││
│ │ ╔══════════════════╗│ │ ┌─────────────────────────────────────┐ ││
│ │ ║ + Add Section    ║│ │ │ FORM HEADER                         │ ││
│ │ ╚══════════════════╝│ │ │                                     │ ││
│ │                     │ │ │ Name: Engineering Performance Review│ ││
│ │ Questions:          │ │ │ Description: Quarterly review for...│ ││
│ │ ┌─────────────────┐ │ │ └─────────────────────────────────────┘ ││
│ │ │ ★ Rating Scale  │ │ │                                         ││
│ │ └─────────────────┘ │ │ ┌─────────────────────────────────────┐ ││
│ │ ┌─────────────────┐ │ │ │ SECTION 1: Technical Skills    [≡]│ ││
│ │ │ 📝 Short Text   │ │ │ │                                     │ ││
│ │ └─────────────────┘ │ │ │ Q1: Rate code quality        [★★★★★]│ ││
│ │ ┌─────────────────┐ │ │ │     Required ✓                      │ ││
│ │ │ 📄 Long Text    │ │ │ │                                     │ ││
│ │ └─────────────────┘ │ │ │ Q2: Rate problem-solving     [★★★★★]│ ││
│ │ ┌─────────────────┐ │ │ │     Required ✓                      │ ││
│ │ │ ○ Multiple Choice│ │ │ │                                     │ ││
│ │ └─────────────────┘ │ │ │ [+ Add Question]                    │ ││
│ │ ┌─────────────────┐ │ │ └─────────────────────────────────────┘ ││
│ │ │ ☑ Checkbox      │ │ │                                         ││
│ │ └─────────────────┘ │ │ ┌─────────────────────────────────────┐ ││
│ │ ┌─────────────────┐ │ │ │ SECTION 2: Goals Review        [≡]│ ││
│ │ │ 🎯 Goal Review  │ │ │ │                                     │ ││
│ │ └─────────────────┘ │ │ │ [Auto-populated from goals]         │ ││
│ │                     │ │ │                                     │ ││
│ │                     │ │ └─────────────────────────────────────┘ ││
│ │                     │ │                                         ││
│ │                     │ │ [+ Add Section]                         ││
│ │                     │ │                                         ││
│ └─────────────────────┘ └─────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Form List

```
┌─────────────────────────────────────────────────────────────────────┐
│ Review Forms                                       [+ Create Form]  │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▼]  [Status: All ▼]              🔍 Search...          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 📋 Company Default Review Form                    ★ DEFAULT     ││
│ │    Standard review for all departments                          ││
│ │    v2.1 • Published • Last updated: Jan 15, 2026                ││
│ │    Assigned to: All (Default)                                   ││
│ │                                        [Edit] [Clone] [Preview] ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 📋 Engineering Performance Review                               ││
│ │    Technical skills and project delivery                        ││
│ │    v1.3 • Published • Last updated: Jan 20, 2026                ││
│ │    Assigned to: Engineering, DevOps                             ││
│ │                                        [Edit] [Clone] [Preview] ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 📋 Sales Performance Review                                     ││
│ │    Revenue targets and client relationships                     ││
│ │    v1.0 • Published • Last updated: Jan 18, 2026                ││
│ │    Assigned to: Sales, Business Development                     ││
│ │                                        [Edit] [Clone] [Preview] ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 📋 Customer Support Review                          📝 DRAFT    ││
│ │    Support metrics and customer satisfaction                    ││
│ │    v0.1 • Draft • Last updated: Jan 25, 2026                    ││
│ │    Assigned to: None                                            ││
│ │                                        [Edit] [Clone] [Delete]  ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Assign to Department Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Assign Form to Department                              [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Form: Engineering Performance Review (v1.3)                 │
│                                                             │
│ Departments                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ☑ Engineering                                           ││
│ │ ☑ DevOps                                                ││
│ │ ☐ Product                                               ││
│ │ ☐ Design                                                ││
│ │ ☐ Sales                                                 ││
│ │ ☐ Marketing                                             ││
│ │ ☐ HR                                                    ││
│ │ ☐ Finance                                               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Use for                                                     │
│ ● Both self-review and manager review                       │
│ ○ Self-review only                                          │
│ ○ Manager review only                                       │
│                                                             │
│ Effective Date                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📅 February 1, 2026                                 ▼  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ⚠️ This will replace any existing form assignments for     │
│    the selected departments.                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Assign]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Default Form Templates

The system includes pre-built templates:

| Template | Description | Sections |
|----------|-------------|----------|
| Standard Review | General purpose form | Overall, Goals, Competencies, Development |
| Technical Review | Engineering/IT focused | Technical Skills, Code Quality, Goals, Collaboration |
| Sales Review | Sales team focused | Revenue, Pipeline, Client Relations, Goals |
| Management Review | People managers | Leadership, Team Development, Strategy, Goals |
| Support Review | Customer support | Metrics, Quality, Customer Satisfaction, Goals |

---

## Integration Points

### Ad-Hoc Reviews

- Form selection uses department assignment
- Falls back to default form
- See [PRD: Ad-Hoc Reviews](./08-adhoc-reviews.md)

### Review Cycles

- Cycle can specify form override
- Otherwise uses department forms
- See [PRD: Performance Reviews](./05-reviews.md)

### Department Management

- Form assignments visible in department settings
- Department heads can view assigned form
- See [PRD: Employees](./03-employees.md)

---

## Related Documents

- [API Reference: Review Forms](/docs/api/review-forms.md)
- [PRD: Performance Reviews](/docs/prd/05-reviews.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)
- [PRD: Employees](/docs/prd/03-employees.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | System | Initial version |
