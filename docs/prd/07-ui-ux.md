# PRD: UI/UX Requirements

## Employee Performance Monitoring Tool - MVP

**Module:** UI/UX Design System  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System](#2-design-system)
3. [Theme & Color Modes](#3-theme--color-modes)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Animations & Transitions](#7-animations--transitions)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)
10. [Loading & Empty States](#10-loading--empty-states)

---

## 1. Overview

This document defines the visual design system, interaction patterns, and accessibility requirements for the Employee Performance Monitoring Tool.

### Design Principles

1. **Clean & Modern** - Minimal clutter, focused content
2. **Dark-First** - Dark mode as default for reduced eye strain
3. **Consistent** - Unified patterns across all modules
4. **Accessible** - WCAG 2.1 Level AA compliance
5. **Responsive** - Desktop-first with tablet support
6. **Animated** - Subtle, purposeful micro-interactions

---

## 2. Design System

### 2.1 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Nuxt UI 4** | Component library |
| **Tailwind CSS 4** | Utility-first styling |
| **Vue 3** | Reactive components |
| **Chart.js** | Data visualization |

### 2.2 Design Tokens

Design tokens are managed through Nuxt UI's theming system and Tailwind CSS configuration.

---

## 3. Theme & Color Modes

### 3.1 Default Theme: Dark Mode

Dark mode is the **default** theme. Users can toggle to light mode via:
- User profile dropdown menu
- Settings page
- Theme toggle icon in top navigation

### 3.2 Color Palette

#### Dark Mode (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0a0a0a` | Main background |
| `bg-secondary` | `#1a1a1a` | Card backgrounds |
| `surface` | `#262626` | Elevated surfaces |
| `surface-hover` | `#333333` | Hover states |
| `text-primary` | `#ffffff` | Primary text |
| `text-secondary` | `#a3a3a3` | Secondary text |
| `text-muted` | `#737373` | Muted/disabled text |
| `border` | `#404040` | Borders |
| `primary` | `#3b82f6` | Primary actions (blue) |
| `primary-hover` | `#2563eb` | Primary hover |
| `success` | `#10b981` | Success states (green) |
| `warning` | `#f59e0b` | Warning states (amber) |
| `error` | `#ef4444` | Error states (red) |
| `info` | `#06b6d4` | Info states (cyan) |

#### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#ffffff` | Main background |
| `bg-secondary` | `#f9fafb` | Card backgrounds |
| `surface` | `#f3f4f6` | Elevated surfaces |
| `surface-hover` | `#e5e7eb` | Hover states |
| `text-primary` | `#0a0a0a` | Primary text |
| `text-secondary` | `#6b7280` | Secondary text |
| `text-muted` | `#9ca3af` | Muted/disabled text |
| `border` | `#e5e7eb` | Borders |
| `primary` | `#2563eb` | Primary actions (blue) |
| `primary-hover` | `#1d4ed8` | Primary hover |
| `success` | `#059669` | Success states (green) |
| `warning` | `#d97706` | Warning states (amber) |
| `error` | `#dc2626` | Error states (red) |
| `info` | `#0891b2` | Info states (cyan) |

### 3.3 Theme Toggle Implementation

```vue
<!-- Theme toggle component -->
<template>
  <UButton
    :icon="colorMode === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
    variant="ghost"
    @click="toggleColorMode"
  />
</template>

<script setup>
const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
```

---

## 4. Typography

### 4.1 Font Family

| Type | Font | Fallback |
|------|------|----------|
| Primary | Inter | system-ui, sans-serif |
| Monospace | JetBrains Mono | monospace |

### 4.2 Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 3rem (48px) | 700 | 1.2 | Hero sections |
| `h1` | 2.5rem (40px) | 700 | 1.2 | Page titles |
| `h2` | 2rem (32px) | 600 | 1.3 | Section headers |
| `h3` | 1.5rem (24px) | 600 | 1.4 | Card titles |
| `h4` | 1.25rem (20px) | 600 | 1.4 | Subsections |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | Large body text |
| `body` | 1rem (16px) | 400 | 1.6 | Default body |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | Small text |
| `caption` | 0.75rem (12px) | 400 | 1.4 | Labels, captions |

### 4.3 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis |
| Semibold | 600 | Headings |
| Bold | 700 | Strong emphasis |

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Base unit: 4px (0.25rem)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Compact elements |
| `space-3` | 12px | Default gap |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gap |
| `space-8` | 32px | Large sections |
| `space-10` | 40px | Page sections |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Hero spacing |

### 5.2 Layout Grid

| Property | Value |
|----------|-------|
| Columns | 12 |
| Gutter (Desktop) | 24px |
| Gutter (Tablet) | 16px |
| Gutter (Mobile) | 12px |
| Max width | 1280px |
| Side padding | 24px (desktop), 16px (tablet/mobile) |

### 5.3 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Buttons, inputs |
| `rounded` | 8px | Cards, modals |
| `rounded-lg` | 12px | Large containers |
| `rounded-full` | 9999px | Pills, avatars |

### 5.4 Shadows (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| `shadow` | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.6)` | Dropdowns |

---

## 6. Components

### 6.1 Buttons

#### Variants

| Variant | Usage | Example |
|---------|-------|---------|
| Primary | Main actions | Save, Submit |
| Secondary | Secondary actions | Cancel, Back |
| Outline | Tertiary actions | Edit, View |
| Ghost | Subtle actions | Close, Toggle |
| Danger | Destructive actions | Delete, Cancel |

#### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| XS | 24px | 8px 12px | 12px |
| SM | 32px | 8px 16px | 14px |
| MD | 40px | 10px 20px | 14px |
| LG | 48px | 12px 24px | 16px |
| XL | 56px | 14px 28px | 18px |

#### States

| State | Visual Change |
|-------|---------------|
| Default | Base styling |
| Hover | Darken 10%, slight scale (1.02) |
| Active | Darken 15%, scale down (0.98) |
| Disabled | 50% opacity, cursor not-allowed |
| Loading | Spinner icon, disabled |

### 6.2 Form Inputs

| Component | Features |
|-----------|----------|
| Text Input | Label, placeholder, error state, icon support |
| Textarea | Auto-resize, character count |
| Select | Searchable, multi-select option |
| Checkbox | Indeterminate state support |
| Radio | Group with description |
| Toggle | On/Off with labels |
| Date Picker | Calendar popup, range support |
| File Upload | Drag & drop, preview |

#### Input States

| State | Border | Background |
|-------|--------|------------|
| Default | `border-default` | `bg-surface` |
| Focus | `border-primary` + ring | `bg-surface` |
| Error | `border-error` | `bg-surface` |
| Disabled | `border-muted` | `bg-muted` |

### 6.3 Cards

```
┌─────────────────────────────────────┐
│ Card Header (optional)        [···] │
├─────────────────────────────────────┤
│                                     │
│ Card Body Content                   │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Card Footer (optional)              │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `bg-secondary` |
| Border | 1px `border-default` |
| Radius | 8px |
| Padding | 20px |
| Shadow | `shadow-sm` |
| Hover | Lift 2px, increase shadow |

### 6.4 Modals

| Property | Value |
|----------|-------|
| Backdrop | `rgba(0,0,0,0.7)` with blur |
| Max Width | 480px (SM), 640px (MD), 800px (LG) |
| Animation | Scale from 0.95 + fade (250ms) |
| Close | X button, backdrop click, Escape key |

### 6.5 Tables

| Feature | Description |
|---------|-------------|
| Sortable | Click header to sort |
| Pagination | Bottom pagination bar |
| Selection | Checkbox column |
| Hover | Row highlight |
| Responsive | Horizontal scroll on mobile |
| Empty | Illustration + message |
| Loading | Skeleton rows |

### 6.6 Navigation

#### Sidebar

| Property | Value |
|----------|-------|
| Width (expanded) | 256px |
| Width (collapsed) | 64px |
| Background | `bg-secondary` |
| Active item | `bg-primary` with `text-white` |

#### Top Bar

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | `bg-primary` |
| Content | Search, notifications, theme toggle, user menu |

---

## 7. Animations & Transitions

### 7.1 Page Transitions

| Transition | Duration | Easing |
|------------|----------|--------|
| Page enter | 300ms | `ease-out` |
| Page leave | 200ms | `ease-in` |
| Effect | Fade + slide up 10px | - |

```vue
<!-- Nuxt page transition -->
<template>
  <NuxtPage />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 300ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
```

### 7.2 Micro-Interactions

| Element | Interaction | Animation |
|---------|-------------|-----------|
| Button | Hover | Scale 1.02, 150ms |
| Button | Click | Scale 0.98, 100ms |
| Card | Hover | TranslateY -2px, shadow increase, 200ms |
| Link | Hover | Color transition, 150ms |
| Checkbox | Check | Check mark draw animation, 200ms |
| Toggle | Switch | Slide + color, 250ms |
| Modal | Open | Scale 0.95→1 + fade, 250ms |
| Modal | Close | Scale 1→0.95 + fade, 200ms |
| Toast | Enter | Slide from right + fade, 300ms |
| Toast | Exit | Slide to right + fade, 250ms |
| Dropdown | Open | Fade + scale, 200ms |

### 7.3 Loading Animations

| Type | Usage | Animation |
|------|-------|-----------|
| Skeleton | Content loading | Shimmer (1.5s loop) |
| Spinner | Action in progress | Rotate (1s loop) |
| Progress Bar | File upload, sync | Width transition |
| Pulse | Live data | Opacity pulse |

### 7.4 Chart Animations

| Chart | Animation | Duration |
|-------|-----------|----------|
| Line | Draw from left | 1000ms |
| Bar | Grow from bottom | 800ms |
| Pie | Clockwise draw | 1000ms |
| Donut | Clockwise + center fade | 1000ms |

### 7.5 Reduced Motion

Respect `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Responsive Design

### 8.1 Breakpoints

| Name | Min Width | Devices |
|------|-----------|---------|
| Mobile | 0 | Phones |
| Tablet | 768px | Tablets, small laptops |
| Laptop | 1024px | Laptops |
| Desktop | 1280px | Desktops (primary) |
| Wide | 1536px | Large monitors |

### 8.2 Layout Behavior

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Sidebar | Visible, expandable | Collapsed, overlay | Hidden, hamburger |
| Content | Multi-column | 2-column | Single column |
| Cards | Grid (3-4 cols) | Grid (2 cols) | Stack |
| Tables | Full width | Horizontal scroll | Card view |
| Modals | Center overlay | Center overlay | Full screen |
| Navigation | Sidebar | Collapsed sidebar | Bottom tabs |

### 8.3 Touch Optimization

| Requirement | Value |
|-------------|-------|
| Min touch target | 44×44px |
| Spacing between targets | 8px minimum |
| Swipe gestures | Sidebar, modals |
| Pull to refresh | Lists |

---

## 9. Accessibility

### 9.1 WCAG 2.1 Level AA Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | 4.5:1 normal text, 3:1 large text |
| Focus Indicators | 2px outline, visible focus ring |
| Keyboard Navigation | All interactive elements focusable |
| Screen Readers | Semantic HTML, ARIA labels |
| Alt Text | All meaningful images |
| Form Labels | Properly associated labels |
| Error Messages | Clear, associated with field |
| Skip Links | "Skip to main content" |

### 9.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move forward |
| Shift+Tab | Move backward |
| Enter/Space | Activate |
| Escape | Close modal/dropdown |
| Arrow keys | Navigate within components |

### 9.3 Screen Reader Considerations

- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Provide ARIA labels for icon-only buttons
- Announce dynamic content changes
- Use proper heading hierarchy (h1 → h2 → h3)

---

## 10. Loading & Empty States

### 10.1 Loading States

| Context | Approach |
|---------|----------|
| Page load | Skeleton screen matching layout |
| Data fetch | Shimmer effect on placeholders |
| Button action | Spinner + disabled state |
| Form submit | Button loading state |
| Infinite scroll | Footer loading indicator |

#### Skeleton Example

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░                     │  ← Title skeleton
├─────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Body line 1
│ ░░░░░░░░░░░░░░░░░░░░░░░░░           │  ← Body line 2
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← Body line 3
│                                     │
│ ┌─────────┐ ┌─────────┐            │  ← Button skeletons
│ │ ░░░░░░░ │ │ ░░░░░░░ │            │
│ └─────────┘ └─────────┘            │
└─────────────────────────────────────┘
```

### 10.2 Empty States

| Type | Content |
|------|---------|
| No data | Illustration + "No {items} yet" + action button |
| No results | "No results for '{query}'" + clear filters link |
| Error | Error icon + message + retry button |
| No access | Lock icon + "You don't have access" + contact info |

#### Empty State Template

```
┌─────────────────────────────────────┐
│                                     │
│           ┌─────────┐               │
│           │  📋     │               │
│           │  (img)  │               │
│           └─────────┘               │
│                                     │
│       No goals yet                  │
│                                     │
│   Start by creating your first     │
│   goal to track your progress.     │
│                                     │
│        [+ Create Goal]              │
│                                     │
└─────────────────────────────────────┘
```

---

## Implementation Notes

### Nuxt UI 4 Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ui: {
    global: true,
  },
  colorMode: {
    preference: 'dark', // Default to dark mode
    fallback: 'dark',
  },
})
```

### CSS Custom Properties

```css
/* Dark mode variables (default) */
:root {
  --color-primary: 59 130 246; /* #3b82f6 */
  --color-success: 16 185 129; /* #10b981 */
  --color-warning: 245 158 11; /* #f59e0b */
  --color-error: 239 68 68;    /* #ef4444 */
}

.dark {
  --color-bg-primary: 10 10 10;
  --color-bg-secondary: 26 26 26;
  --color-text-primary: 255 255 255;
  --color-text-secondary: 163 163 163;
}

.light {
  --color-bg-primary: 255 255 255;
  --color-bg-secondary: 249 250 251;
  --color-text-primary: 10 10 10;
  --color-text-secondary: 107 114 128;
}
```

---

## Related Documents

- [PRD: Dashboard](/docs/prd/02-dashboard.md)
- [TSD: Frontend Architecture](/docs/TSD.md#1-system-architecture-overview)
- [All Feature PRDs](/docs/prd/)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | System | Initial version |
