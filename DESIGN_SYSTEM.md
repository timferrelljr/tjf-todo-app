# HibiList Design System

## Design Philosophy
- **Ultra-minimalist aesthetic** - Clean, spacious, Apple-inspired
- **Subtle interactions** - No flashy animations or bright colors
- **Typography-focused** - Light font weights, generous spacing
- **Functional simplicity** - Every element serves a purpose

## Visual Principles
- **Whitespace is king** - Generous padding and margins
- **Muted color palette** - Grays, whites, subtle accent colors
- **Geometric simplicity** - Circles, rounded rectangles, clean lines
- **Typography hierarchy** - font-light for headers, font-medium for body

## Component Patterns
- **Cards**: white bg, subtle shadows, rounded-2xl corners
- **Buttons**: gray-200 bg, minimal hover states, rounded-2xl
- **Lists**: clean rows, circle icons, proper vertical spacing
- **Layout**: max-width containers, consistent 6-unit spacing

## Color Palette

### Primary Colors
```css
/* Backgrounds */
bg-gray-50     /* Page backgrounds */
bg-white       /* Card backgrounds */
bg-gray-100    /* Secondary surfaces */
bg-gray-200    /* Button backgrounds */

/* Text */
text-gray-800  /* Primary text */
text-gray-600  /* Secondary text */
text-gray-400  /* Tertiary text/placeholders */

/* Accents */
text-blue-600  /* Links and primary actions */
text-green-600 /* Success states */
text-red-600   /* Danger states */
```

### Semantic Colors
- **Success**: `text-green-600`, `bg-green-50`, `border-green-200`
- **Warning**: `text-yellow-600`, `bg-yellow-50`, `border-yellow-200`
- **Error**: `text-red-600`, `bg-red-50`, `border-red-200`
- **Info**: `text-blue-600`, `bg-blue-50`, `border-blue-200`

## Typography Scale

### Headers
```css
/* Page Titles */
text-2xl font-light text-gray-800 mb-8

/* Section Headers */
text-lg font-light text-gray-800 mb-6

/* Card Titles */
text-base font-medium text-gray-800
```

### Body Text
```css
/* Primary Body */
text-sm text-gray-600

/* Secondary Body */
text-xs text-gray-400

/* Labels */
text-xs font-medium text-gray-700 uppercase tracking-wide
```

## Spacing System

### Layout Spacing
- **Container max-width**: `max-w-4xl mx-auto`
- **Page padding**: `px-6 py-8`
- **Section spacing**: `space-y-8`
- **Card spacing**: `p-6`

### Component Spacing
```css
/* Generous internal spacing */
px-6 py-4        /* Button padding */
mb-8             /* Section margins */
space-y-4        /* List item spacing */
gap-6            /* Grid gaps */
```

## Border Radius
- **Cards**: `rounded-2xl`
- **Buttons**: `rounded-2xl`
- **Icons**: `rounded-full`
- **Input fields**: `rounded-xl`

## Shadows
- **Cards**: `shadow-sm` (subtle)
- **Modals**: `shadow-lg` (moderate)
- **Hover states**: `shadow-md` (gentle lift)

## Animation Guidelines
- **Duration**: 200-300ms for micro-interactions
- **Easing**: `ease-out` for entrances, `ease-in` for exits
- **Subtle transforms**: `hover:scale-105`, `hover:translate-y-1`

## Component Guidelines

### Cards
```tsx
<div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
  <h3 className="text-base font-medium text-gray-800 mb-4">Card Title</h3>
  <p className="text-sm text-gray-600">Card content</p>
</div>
```

### Buttons
```tsx
/* Primary */
<button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl font-medium hover:bg-gray-300 transition-colors">

/* Secondary */
<button className="text-gray-600 px-6 py-3 rounded-2xl hover:bg-gray-100 transition-colors">

/* Danger */
<button className="text-red-600 px-6 py-3 rounded-2xl hover:bg-red-50 transition-colors">
```

### Lists
```tsx
<div className="space-y-3">
  <div className="flex items-center space-x-4 p-4">
    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    <span className="text-sm text-gray-600">List item</span>
  </div>
</div>
```

### Form Elements
```tsx
<input className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
```

## Layout Patterns

### Page Layout
```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-4xl mx-auto px-6 py-8">
    <h1 className="text-2xl font-light text-gray-800 mb-8">Page Title</h1>
    <div className="space-y-8">
      {/* Content */}
    </div>
  </div>
</div>
```

### Grid Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## Interactive States

### Hover States
- **Cards**: `hover:shadow-md`
- **Buttons**: Background color shift
- **Links**: `hover:text-gray-800`

### Focus States
- **Inputs**: `focus:border-gray-400`
- **Buttons**: `focus:outline-none focus:ring-2 focus:ring-gray-300`

### Active States
- **Buttons**: `active:scale-95`
- **Cards**: `active:shadow-sm`

## Accessibility Guidelines
- Minimum contrast ratio of 4.5:1
- Focus indicators always visible
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support

## Tailwind Classes to Use

### Recommended
```css
/* Spacing */
px-6, py-4, mb-8, space-y-4, gap-6

/* Colors */
bg-gray-50, bg-white, bg-gray-100
text-gray-800, text-gray-600, text-gray-400

/* Typography */
font-light, font-medium, text-lg, text-2xl

/* Borders */
rounded-2xl, rounded-full, rounded-xl

/* Shadows */
shadow-sm, shadow-md, shadow-lg
```

### Avoid
```css
/* Don't use */
bg-gradient-*, shadow-2xl, animate-*, 
brightness-*, saturate-*, blur-*
border-4, border-8, text-3xl+
```

## Component Checklist
Before implementing a component, ensure:
- [ ] Uses generous whitespace
- [ ] Typography follows hierarchy
- [ ] Colors are muted and functional
- [ ] Interactions are subtle
- [ ] Layout is clean and spacious
- [ ] Follows accessibility guidelines

This design system prioritizes clarity, functionality, and visual calm over flashy effects or complex styling.