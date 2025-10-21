# monodog Dashboard Theme System

This document outlines the comprehensive theme system implemented for the monodog dashboard application.

## Overview

The theme system provides a consistent design language across the entire dashboard with carefully crafted color palettes, typography, spacing, and component styles.

## Color Palette

### Primary Colors (Blue Spectrum)

- **Usage**: Main actions, links, active navigation states, primary buttons
- **Base Color**: `#3b82f6` (primary-500)
- **Button Color**: `#2563eb` (primary-600)
- **Hover Color**: `#1d4ed8` (primary-700)

### Secondary Colors (Green Spectrum)

- **Usage**: Success states, positive actions, secondary buttons
- **Base Color**: `#22c55e` (secondary-500)
- **Button Color**: `#16a34a` (secondary-600)
- **Hover Color**: `#15803d` (secondary-700)

### Accent Colors (Yellow Spectrum)

- **Usage**: Warnings, highlights, attention-grabbing elements
- **Base Color**: `#eab308` (accent-500)
- **Warning Color**: `#ca8a04` (accent-600)
- **Hover Color**: `#a16207` (accent-700)

### Semantic Colors

- **Success**: Green spectrum (same as secondary)
- **Warning**: Yellow spectrum (same as accent)
- **Error**: Red spectrum (`#ef4444` base)
- **Info**: Light blue spectrum (`#0ea5e9` base)

### Neutral Colors

- **Usage**: Text, backgrounds, borders, subtle elements
- **Range**: From `#f9fafb` (neutral-50) to `#030712` (neutral-950)

## Typography

### Font Families

- **Primary**: Inter (Google Fonts)
- **Display**: Inter (for headings)
- **Monospace**: JetBrains Mono (for code)

### Font Sizes

- **xs**: 12px / 16px line height
- **sm**: 14px / 20px line height
- **base**: 16px / 24px line height
- **lg**: 18px / 28px line height
- **xl**: 20px / 28px line height
- **2xl**: 24px / 32px line height
- **3xl**: 30px / 36px line height
- **4xl**: 36px / 40px line height

### Font Weights

- **Light**: 300
- **Normal**: 400
- **Medium**: 500 (default for most UI text)
- **Semibold**: 600 (headings)
- **Bold**: 700

## Component Classes

### Buttons

```css
.btn-primary     /* Primary blue button */
.btn-secondary   /* Secondary green button */
.btn-outline     /* Outlined button */
.btn-ghost       /* Minimal button */
.btn-success     /* Success state button */
.btn-warning     /* Warning state button */
.btn-error       /* Error state button */
```

### Input Fields

```css
.input-base      /* Standard input styling */
.input-error     /* Error state input */
.input-success   /* Success state input */
```

### Cards

```css
.card            /* Basic card with soft shadow */
.card-elevated   /* Card with medium shadow */
.card-interactive /* Interactive card with hover effects */
```

### Status Badges

```css
.badge-success   /* Green success badge */
.badge-warning   /* Yellow warning badge */
.badge-error     /* Red error badge */
.badge-info      /* Blue info badge */
.badge-neutral   /* Gray neutral badge */
```

### Navigation

```css
.nav-link        /* Base navigation link */
.nav-link-active /* Active navigation state */
.nav-link-inactive /* Inactive navigation state */
```

### Typography Classes

```css
.text-heading    /* Main headings */
.text-subheading /* Subheadings */
.text-body       /* Body text */
.text-caption    /* Small caption text */
.text-code       /* Monospace code text */
```

## Spacing System

The spacing system follows a consistent scale:

- **4px increments**: 1, 2, 3, 4, 5, 6
- **8px increments**: 8, 10, 12, 16, 20, 24, 32

## Shadows

Three levels of elevation:

- **Soft**: Subtle shadow for basic cards
- **Medium**: Moderate shadow for elevated components
- **Large**: Strong shadow for modals and overlays

## Border Radius

- **Base**: 4px for small elements
- **lg**: 8px for buttons and inputs
- **xl**: 12px for cards
- **2xl**: 16px for large cards
- **3xl**: 24px for hero elements

## Usage Guidelines

### Color Usage

1. **Primary Blue**: Use for main call-to-action buttons, active navigation, and primary interactive elements
2. **Secondary Green**: Use for success states, positive actions, and secondary buttons
3. **Accent Yellow**: Use sparingly for warnings and important highlights
4. **Neutral Gray**: Use for text, backgrounds, and subtle UI elements

### Button Hierarchy

1. **Primary**: Most important action on the page
2. **Secondary**: Important but not primary actions
3. **Outline**: Alternative actions
4. **Ghost**: Minimal actions like "Cancel"

### Typography Hierarchy

1. **Headings**: Use `text-heading` with appropriate size
2. **Subheadings**: Use `text-subheading`
3. **Body Text**: Use `text-body`
4. **Captions**: Use `text-caption`

### Spacing Guidelines

- Use consistent spacing between elements
- Prefer the spacing scale over arbitrary values
- Use larger spacing for section breaks
- Use smaller spacing for related elements

## Accessibility

The theme system includes:

- **WCAG AA compliant** color contrasts
- **Focus rings** for keyboard navigation
- **Semantic colors** for status communication
- **Readable typography** with appropriate line heights

## Dark Mode Support

The current theme is designed for light mode. Dark mode support can be added by:

1. Creating dark variants of the color palette
2. Using CSS custom properties for theme switching
3. Adding dark mode classes to components

## Migration from Existing Code

To migrate existing components:

1. Replace hardcoded colors with theme classes
2. Use component classes instead of utility combinations
3. Update typography to use theme classes
4. Standardize spacing using the theme scale

## Examples

### Before (Hardcoded)

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Submit
</button>
```

### After (Theme Classes)

```tsx
<button className="btn-primary">Submit</button>
```

### Status Badge Example

```tsx
<span className="badge-success">Active</span>
```

### Card Example

```tsx
<div className="card p-6">
  <h3 className="text-heading text-xl mb-4">Card Title</h3>
  <p className="text-body">Card content goes here.</p>
</div>
```

This theme system ensures consistency, maintainability, and a professional appearance across the entire monodog dashboard application.
