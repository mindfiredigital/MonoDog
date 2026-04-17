# Theme Migration Guide

This guide helps you migrate existing components to use the new monodog theme system.

## Quick Reference

### Color Replacements

| Old Class        | New Class            | Notes                  |
| ---------------- | -------------------- | ---------------------- |
| `bg-blue-600`    | `bg-primary-600`     | Primary buttons        |
| `bg-blue-700`    | `bg-primary-700`     | Primary button hover   |
| `text-blue-600`  | `text-primary-600`   | Primary text/links     |
| `bg-green-600`   | `bg-secondary-600`   | Secondary buttons      |
| `bg-green-700`   | `bg-secondary-700`   | Secondary button hover |
| `text-green-600` | `text-secondary-600` | Success text           |
| `bg-yellow-500`  | `bg-warning-500`     | Warning backgrounds    |
| `bg-red-600`     | `bg-error-600`       | Error buttons          |
| `text-gray-900`  | `text-neutral-900`   | Dark text              |
| `text-gray-600`  | `text-neutral-600`   | Body text              |
| `bg-gray-50`     | `bg-neutral-50`      | Light backgrounds      |

### Button Replacements

| Old Classes                                                       | New Class       |
| ----------------------------------------------------------------- | --------------- |
| `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700`   | `btn-primary`   |
| `bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700` | `btn-secondary` |
| `border border-blue-300 text-blue-700 px-4 py-2 rounded-lg`       | `btn-outline`   |
| `text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100`            | `btn-ghost`     |

### Status Badge Replacements

| Old Classes                                                    | New Class       |
| -------------------------------------------------------------- | --------------- |
| `bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs`   | `badge-success` |
| `bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs` | `badge-warning` |
| `bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs`       | `badge-error`   |

## Step-by-Step Migration

### 1. Update Button Components

**Before:**

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
  Submit
</button>
```

**After:**

```tsx
<button className="btn-primary">Submit</button>
```

### 2. Update Status Badges

**Before:**

```tsx
<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Active
</span>
```

**After:**

```tsx
<span className="badge-success">Active</span>
```

### 3. Update Input Fields

**Before:**

```tsx
<input
  type="text"
  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
/>
```

**After:**

```tsx
<input type="text" className="input-base" />
```

### 4. Update Cards

**Before:**

```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  <h3 className="text-lg font-medium text-gray-900">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

**After:**

```tsx
<div className="card p-6">
  <h3 className="text-heading text-lg">Title</h3>
  <p className="text-body">Content</p>
</div>
```

### 5. Update Typography

**Before:**

```tsx
<h1 className="text-2xl font-bold text-gray-900">Heading</h1>
<p className="text-gray-600">Body text</p>
<span className="text-sm text-gray-500">Caption</span>
```

**After:**

```tsx
<h1 className="text-heading text-2xl">Heading</h1>
<p className="text-body">Body text</p>
<span className="text-caption">Caption</span>
```

## Component-Specific Migrations

### Layout Component (Navigation)

**Before:**

```tsx
<Link
  to={item.href}
  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
  }`}
>
```

**After:**

```tsx
<Link
  to={item.href}
  className={`nav-link ${
    isActive ? 'nav-link-active' : 'nav-link-inactive'
  }`}
>
```

### CI Integration Header

**Before:**

```tsx
<button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors">
  <PlayIcon className="w-5 h-5" />
  <span>Trigger Build</span>
</button>
```

**After:**

```tsx
<button className="btn-secondary flex items-center space-x-2">
  <PlayIcon className="w-5 h-5" />
  <span>Trigger Build</span>
</button>
```

### Package Overview Component

**Before:**

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
  <PlusIcon className="w-5 h-5" />
  <span>Add Package</span>
</button>
```

**After:**

```tsx
<button className="btn-primary flex items-center space-x-2">
  <PlusIcon className="w-5 h-5" />
  <span>Add Package</span>
</button>
```

## Utility Class Migrations

### Focus States

**Before:**

```tsx
className =
  'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none';
```

**After:**

```tsx
className = 'focus-ring';
```

### Animations

**Before:**

```tsx
className = 'transition-colors duration-200';
```

**After:**
This is now included in component classes like `btn-primary`, `card-interactive`, etc.

### Shadows

**Before:**

```tsx
className = 'shadow-sm';
className = 'shadow-md';
className = 'shadow-lg';
```

**After:**

```tsx
className = 'shadow-soft';
className = 'shadow-medium';
className = 'shadow-large';
```

## Advanced Migration Patterns

### Dynamic Status Colors

**Before:**

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
```

**After:**

```tsx
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return 'badge-success';
    case 'warning':
      return 'badge-warning';
    case 'error':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};
```

### Conditional Button Styles

**Before:**

```tsx
<button
  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  }`}
>
```

**After:**

```tsx
<button
  className={
    variant === 'primary' ? 'btn-primary' : 'btn-ghost'
  }
>
```

## Testing Your Migration

1. **Visual Review**: Check that all components maintain their intended appearance
2. **Interaction Testing**: Verify hover states, focus states, and transitions work correctly
3. **Responsive Testing**: Ensure components look good across different screen sizes
4. **Accessibility Testing**: Confirm focus indicators and color contrasts are maintained

## Common Gotchas

1. **Icon Sizes**: Make sure icon classes (`w-5 h-5`) are preserved when migrating buttons
2. **Spacing**: Component classes include standard padding, so remove redundant spacing classes
3. **Text Colors**: Some components may need explicit text color classes for proper contrast
4. **Transitions**: Component classes include transitions, so remove redundant transition classes

## Performance Benefits

After migration, you'll see:

- **Smaller Bundle Size**: Fewer utility classes in your components
- **Better Maintainability**: Centralized styling that's easier to update
- **Consistent Design**: Automatic adherence to design system
- **Better Developer Experience**: Less CSS to write and maintain

## Need Help?

If you encounter issues during migration:

1. Check the theme examples in `src/theme/examples.tsx`
2. Reference the theme configuration in `src/theme/index.ts`
3. Review the component class definitions in `src/index.css`
4. Test individual components in isolation first
