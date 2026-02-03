# PRD: Dashboard

## Employee Performance Monitoring Tool - MVP

**Module:** Dashboard  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Role-Specific Dashboards](#2-role-specific-dashboards)
3. [Common Features](#3-common-features)
4. [User Stories & Acceptance Criteria](#4-user-stories--acceptance-criteria)
5. [Widget Specifications](#5-widget-specifications)

---

## 1. Overview

The Dashboard module provides role-specific landing pages that give users immediate visibility into their most important performance data. Each role sees a customized view with relevant metrics, actions, and insights.

### Goals

- Provide at-a-glance performance overview for each user role
- Surface actionable items (pending approvals, upcoming deadlines)
- Enable quick navigation to frequently used features
- Display key performance indicators (KPIs)

---

## 2. Role-Specific Dashboards

### 2.1 Employee Dashboard

The default landing page for individual contributors focusing on personal performance.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| Goals Progress | Visual progress bars for active goals | P0 |
| Upcoming Deadlines | Goals and reviews due soon | P0 |
| Recent Feedback | Latest feedback received | P1 |
| Performance Trend | 6-month performance chart | P1 |
| Quick Actions | Add goal, view all, start self-assessment | P0 |
| Notifications | Unread notifications preview | P1 |

#### KPIs Displayed

- Goals completion rate (%)
- Average goal progress (%)
- Days until next review
- Active goals count

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Welcome back, {First Name}!              [Quick Actions ▼]│
├────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Active Goals │ │  Completed   │ │ Next Review  │        │
│ │      5       │ │      12      │ │   15 days    │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
├────────────────────────────────────────────────────────────┤
│ My Goals Progress                                          │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ████████████░░░░░░░░ 65% - Improve customer...        ││
│ │ ████████████████░░░░ 80% - Complete AWS cert...       ││
│ │ ██████░░░░░░░░░░░░░░ 30% - Learn TypeScript...        ││
│ └────────────────────────────────────────────────────────┘│
├─────────────────────────────┬──────────────────────────────┤
│ Upcoming Deadlines          │ Performance Trend            │
│ ┌─────────────────────────┐ │ ┌──────────────────────────┐│
│ │ 📅 Self-assessment      │ │ │      📈 Chart            ││
│ │    Due in 5 days        │ │ │                          ││
│ │ 📅 Q1 Goal Review       │ │ │  (6-month trend)         ││
│ │    Due in 15 days       │ │ │                          ││
│ └─────────────────────────┘ │ └──────────────────────────┘│
└─────────────────────────────┴──────────────────────────────┘
```

---

### 2.2 Manager Dashboard

Dashboard for team leads focusing on team performance and pending actions.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| Team Overview | Aggregated team performance | P0 |
| Pending Approvals | Goals/reviews awaiting action | P0 |
| Team Goals Alignment | Visual alignment chart | P1 |
| Team Members | Individual performance cards | P0 |
| Review Deadlines | Team review schedule | P1 |
| Pending Ad-Hoc Reviews | Ad-hoc reviews awaiting completion | P0 |
| Quick Actions | Review pending, add team goal, **trigger review**, analytics | P0 |

#### KPIs Displayed

- Team average performance score
- Goals on track vs at risk
- Review completion rate (%)
- Team size
- Pending approvals count

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Team Dashboard                          [Quick Actions ▼] │
├────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ │Team Size  │ │ On Track  │ │ At Risk   │ │ Pending   │   │
│ │    8      │ │    6      │ │    2      │ │    5      │   │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
├────────────────────────────────────────────────────────────┤
│ Pending Actions                            [View All →]    │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ⏳ Approve: Alice's Q1 Goal          [Approve][Reject] ││
│ │ ⏳ Review: Bob's Performance          [Start Review]   ││
│ │ ⏳ Approve: Carol's Training Goal     [Approve][Reject] ││
│ └────────────────────────────────────────────────────────┘│
├─────────────────────────────┬──────────────────────────────┤
│ Team Members                │ Team Goals Alignment         │
│ ┌─────────────────────────┐ │ ┌──────────────────────────┐│
│ │ 👤 Alice - 85% ████████ │ │ │                          ││
│ │ 👤 Bob   - 72% ███████  │ │ │   (Alignment Tree)       ││
│ │ 👤 Carol - 45% ████     │ │ │                          ││
│ │ 👤 Dave  - 90% █████████│ │ │                          ││
│ └─────────────────────────┘ │ └──────────────────────────┘│
└─────────────────────────────┴──────────────────────────────┘
```

---

### 2.3 HR Dashboard

Dashboard for HR professionals with organization-wide metrics and cycle management.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| Org Performance | Organization-wide metrics | P0 |
| Active Review Cycles | Current cycle status | P0 |
| Ad-Hoc Reviews | Pending ad-hoc reviews across organization | P0 |
| Department Comparison | Performance by department | P1 |
| Recent Activity | System activity feed | P2 |
| User Engagement | Login/usage metrics | P2 |
| Quick Actions | Create cycle, **trigger review**, generate report, manage users, **manage forms** | P0 |

#### KPIs Displayed

- Overall performance distribution
- Review cycle completion rate (%)
- Active goals count
- Department performance comparison
- Total employees / Active users

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  HR Dashboard                            [Quick Actions ▼] │
├────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ │Employees  │ │Active Goals│ │Completion │ │ Avg Rating│   │
│ │   156     │ │    245    │ │   72%     │ │   3.9     │   │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
├────────────────────────────────────────────────────────────┤
│ Active Review Cycles                                       │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Q1 2026 Performance Review                             ││
│ │ ████████████████░░░░░░░░ 68% Complete   [Manage →]     ││
│ │ Self-Assessment: 85%  |  Manager Review: 52%           ││
│ └────────────────────────────────────────────────────────┘│
├─────────────────────────────┬──────────────────────────────┤
│ Department Comparison       │ Performance Distribution     │
│ ┌─────────────────────────┐ │ ┌──────────────────────────┐│
│ │ Engineering   ████ 4.1  │ │ │                          ││
│ │ Product       ███  3.9  │ │ │   (Histogram)            ││
│ │ Sales         ███  3.7  │ │ │                          ││
│ │ Marketing     ███  3.8  │ │ │                          ││
│ └─────────────────────────┘ │ └──────────────────────────┘│
└─────────────────────────────┴──────────────────────────────┘
```

---

### 2.4 C-Suite Dashboard

Executive dashboard with high-level organizational insights.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| Executive Summary | High-level KPI cards | P0 |
| Performance Trends | Quarterly/annual trends | P0 |
| Department Performance | Comparison chart | P0 |
| Strategic Goals | Company goal progress | P1 |
| Talent Insights | Top/bottom performers | P2 |
| Quick Actions | View reports, export analytics | P0 |

#### KPIs Displayed

- Company-wide performance score
- Top performers count (top 10%)
- Strategic goal completion rate
- Performance trend (up/down indicator)
- Employee engagement score

---

### 2.5 Admin Dashboard

System administration dashboard focusing on system health and user management.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| System Health | Status indicators | P0 |
| User Activity | Login metrics | P1 |
| Recent Logins | Latest user sessions | P1 |
| Configuration Status | System settings overview | P2 |
| Quick Actions | Manage users, settings, audit logs | P0 |

#### KPIs Displayed

- Total active users
- System uptime
- Storage usage
- Active sessions
- Recent errors count

---

## 3. Common Features

### 3.1 Dashboard Customization

| Feature | Description | Priority |
|---------|-------------|----------|
| Drag & Drop | Reorder widgets | P2 |
| Collapse/Expand | Minimize widgets | P1 |
| Save Layout | Persist user preferences | P2 |
| Reset Default | Restore original layout | P2 |

### 3.2 Data Refresh

| Feature | Description |
|---------|-------------|
| Auto-refresh | Every 5 minutes |
| Manual refresh | Refresh button |
| Loading states | Skeleton screens |
| Error handling | Retry option |

### 3.3 Responsiveness

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1280px) | Multi-column grid |
| Tablet (≥768px) | 2-column grid |
| Mobile (<768px) | Single column, stacked |

---

## 4. User Stories & Acceptance Criteria

### US-DASH-001: Employee Dashboard

**As an** employee  
**I want to** see my performance overview on the dashboard  
**So that** I can track my progress

**Acceptance Criteria:**

- [ ] Dashboard displays current goals with progress bars
- [ ] Upcoming review deadlines visible
- [ ] Performance trend chart shows last 6 months
- [ ] Goals completion rate displayed
- [ ] Quick action buttons: Add Goal, View All Goals, Start Self-Assessment
- [ ] Widgets are responsive and mobile-friendly
- [ ] Data refreshes on page load
- [ ] Manual refresh button available
- [ ] Empty states shown when no data available

---

### US-DASH-002: Manager Dashboard

**As a** manager  
**I want to** see my team's performance metrics  
**So that** I can identify issues and support my team

**Acceptance Criteria:**

- [ ] Team performance overview shows aggregated metrics
- [ ] Pending approvals count badge visible
- [ ] Individual team member cards show key metrics
- [ ] Team goals alignment chart displayed
- [ ] Upcoming team review deadlines listed
- [ ] Quick actions: Review Pending, Add Team Goal, View Analytics
- [ ] Can drill down into individual employee performance
- [ ] Filters: Team member, date range
- [ ] Export team report button available

---

### US-DASH-003: Dashboard Customization

**As a** user  
**I want to** customize my dashboard layout  
**So that** I can prioritize information important to me

**Acceptance Criteria:**

- [ ] Widgets can be dragged and dropped
- [ ] Widget order is saved per user
- [ ] Reset to default layout option available
- [ ] Widgets can be collapsed/expanded
- [ ] Minimum of 4 widgets visible
- [ ] Changes persist across sessions
- [ ] Responsive layout maintained after customization

---

### US-DASH-004: Dashboard Notifications

**As a** user  
**I want to** see pending notifications on my dashboard  
**So that** I don't miss important updates

**Acceptance Criteria:**

- [ ] Notification widget shows latest 5 notifications
- [ ] Unread count badge visible
- [ ] Click notification to navigate to related item
- [ ] Mark as read functionality
- [ ] "View All" link to full notification center
- [ ] Real-time updates (or refresh on page load)

---

## 5. Widget Specifications

### 5.1 KPI Card Widget

**Purpose:** Display a single key metric

**Components:**
- Label (e.g., "Active Goals")
- Value (e.g., "12")
- Trend indicator (optional: ↑ +5%, ↓ -3%)
- Icon (optional)
- Click action (optional: navigate to details)

**Variants:**
- Default (value only)
- With trend (value + percentage change)
- With icon (icon + value)
- Clickable (entire card is link)

**Sizes:**
- Small: 120px width
- Medium: 160px width
- Large: 200px width

---

### 5.2 Progress List Widget

**Purpose:** Display list of items with progress

**Components:**
- Widget title
- List items (max 5 visible, scrollable)
- Each item: Title, Progress bar, Percentage
- "View All" link

**Interaction:**
- Click item to navigate to details
- Progress bar color indicates status (green/amber/red)

---

### 5.3 Chart Widget

**Purpose:** Display data visualizations

**Types:**
- Line chart (trends over time)
- Bar chart (comparisons)
- Pie/Donut (distributions)
- Progress ring (single metric)

**Components:**
- Title
- Chart area (responsive)
- Legend (collapsible on mobile)
- Tooltip on hover
- Date range selector (optional)

**Interactions:**
- Hover for data points
- Click for drill-down (if applicable)
- Export as image

---

### 5.4 Action List Widget

**Purpose:** Display pending actions requiring user attention

**Components:**
- Widget title with badge count
- Action items list
- Each item: Type icon, Description, Action buttons
- "View All" link

**Action Types:**
- Approval needed (Approve/Reject buttons)
- Review pending (Start Review button)
- Deadline approaching (View button)

**States:**
- Empty: "No pending actions" message
- Loading: Skeleton items
- Error: Retry button

---

### 5.5 Team Member Widget

**Purpose:** Display team member performance cards

**Components:**
- Member avatar
- Name and title
- Progress indicator (%)
- Status badge (On Track, At Risk, etc.)
- Quick action (View Profile)

**Sorting:**
- By name (A-Z)
- By progress (High to Low)
- By status (At Risk first)

---

## Animations & Transitions

### Page Load

- Widgets fade in sequentially (50ms stagger)
- KPI values count up animation (500ms)
- Charts animate on first render

### Interactions

- Widget hover: Subtle shadow increase (200ms)
- Button hover: Scale 1.02 (150ms)
- Card click: Brief scale down (100ms)

### Data Updates

- Value changes: Smooth transition (300ms)
- New items: Slide in from top (250ms)
- Chart updates: Animated transition (500ms)

---

## Related Documents

- [API Reference: Analytics (Dashboard endpoint)](/docs/api/analytics.md)
- [PRD: UI/UX Requirements](/docs/prd/07-ui-ux.md)
- [PRD: Goals](/docs/prd/04-goals.md)
- [PRD: Reviews](/docs/prd/05-reviews.md)
- [PRD: Ad-Hoc Reviews](/docs/prd/08-adhoc-reviews.md)
- [PRD: Department Review Forms](/docs/prd/09-review-forms.md)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial version |
| 1.1 | February 2026 | System | Added ad-hoc review widgets and quick actions |
| 1.0 | January 2026 | System | Initial version |
