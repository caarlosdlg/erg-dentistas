# DentalERP Design System Components

## Overview
This design system provides a comprehensive set of reusable UI components built with React and Tailwind CSS, specifically designed for dental practice management software.

## Components

### Button
A versatile button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

**Usage:**
```jsx
import { Button } from '../components/ui';

<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" loading={true}>Loading...</Button>
```

### Card
A container component for grouping related content.

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient'
- `interactive`: boolean
- `className`: string

**Usage:**
```jsx
import { Card } from '../components/ui';

<Card variant="elevated">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Badge
Small status indicators and labels.

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```jsx
import { Badge } from '../components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="lg">Pending</Badge>
```

### Input
Text input field with various styling options.

**Props:**
- `type`: string
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `error`: boolean
- `disabled`: boolean
- `label`: string
- `helperText`: string
- `errorMessage`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

**Usage:**
```jsx
import { Input } from '../components/ui';

<Input
  label="Patient Name"
  placeholder="Enter patient name"
  variant="outlined"
  required
/>
```

### Textarea
Multi-line text input component.

**Props:**
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `rows`: number
- `resize`: 'none' | 'vertical' | 'horizontal' | 'both'
- `error`: boolean
- `disabled`: boolean
- `label`: string
- `helperText`: string
- `errorMessage`: string

**Usage:**
```jsx
import { Textarea } from '../components/ui';

<Textarea
  label="Notes"
  placeholder="Enter notes here..."
  rows={4}
  resize="vertical"
/>
```

### Select
Dropdown selection component.

**Props:**
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `error`: boolean
- `disabled`: boolean
- `placeholder`: string
- `label`: string
- `helperText`: string
- `errorMessage`: string
- `options`: Array<{value: string, label: string, disabled?: boolean}>
- `leftIcon`: ReactNode

**Usage:**
```jsx
import { Select } from '../components/ui';

const options = [
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'endodontics', label: 'Endodontics' }
];

<Select
  label="Specialty"
  placeholder="Select specialty"
  options={options}
/>
```

### Modal
Overlay dialog component for displaying content above the main interface.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlay`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

**Subcomponents:**
- `Modal.Header`
- `Modal.Body`
- `Modal.Footer`

**Usage:**
```jsx
import { Modal } from '../components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Patient Details"
  size="lg"
>
  <p>Modal content here</p>
</Modal>
```

### Loading
Loading state indicators with multiple animation variants.

**Props:**
- `variant`: 'spinner' | 'dots' | 'pulse' | 'bars'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'secondary' | 'gray' | 'white'
- `text`: string
- `fullscreen`: boolean
- `overlay`: boolean

**Usage:**
```jsx
import { Loading } from '../components/ui';

<Loading variant="spinner" size="md" text="Loading patients..." />
<Loading variant="dots" fullscreen />
```

### Table
Data table component with sorting, pagination, and customizable columns.

**Props:**
- `data`: Array<Object>
- `columns`: Array<{title: string, dataIndex: string, key: string, render?: function, align?: string, width?: string}>
- `variant`: 'default' | 'bordered' | 'borderless' | 'elevated'
- `size`: 'sm' | 'md' | 'lg'
- `striped`: boolean
- `hoverable`: boolean
- `loading`: boolean
- `emptyMessage`: string

**Subcomponents:**
- `Table.Header`
- `Table.Body`
- `Table.Row`
- `Table.HeaderCell`
- `Table.Cell`

**Usage:**
```jsx
import { Table } from '../components/ui';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Badge>{status}</Badge> }
];

<Table
  data={patients}
  columns={columns}
  striped
  hoverable
/>
```

### Navigation
Navigation component for sidebars and top navigation bars.

**Props:**
- `variant`: 'sidebar' | 'topbar'
- `items`: Array<{label: string, path: string, icon?: ReactNode, children?: Array}>
- `currentPath`: string
- `onNavigate`: function
- `collapsed`: boolean (sidebar only)
- `onToggleCollapse`: function (sidebar only)
- `logo`: ReactNode
- `userInfo`: {name: string, role?: string, avatar?: string}

**Usage:**
```jsx
import { Navigation } from '../components/ui';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Patients', path: '/patients', icon: <PatientsIcon /> }
];

<Navigation
  variant="sidebar"
  items={navItems}
  currentPath="/dashboard"
  onNavigate={handleNavigation}
  logo={<Logo />}
  userInfo={{ name: "Dr. Smith", role: "Administrator" }}
/>
```

## Design Tokens

### Colors
- **Primary**: Blue palette (#0066cc) - Medical trust and professionalism
- **Secondary**: Green palette (#009951) - Health and wellness
- **Status Colors**: Success (green), Warning (yellow), Error (red), Info (blue)

### Typography
- **Primary Font**: Inter - Clean, readable interface font
- **Secondary Font**: Poppins - Distinctive headings and branding
- **Hierarchy**: H1 (4xl), H2 (3xl), H3 (2xl), Body (base), Small (sm)

### Spacing
- Uses Tailwind's 4px-based spacing scale
- Consistent padding and margins across components
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Shadows
- Subtle shadows for depth and hierarchy
- Elevated variants for important elements
- Focus states with colored shadows

## Best Practices

### Accessibility
- All components support keyboard navigation
- Proper ARIA attributes included
- Minimum contrast ratios maintained
- Screen reader friendly

### Performance
- Components use React.forwardRef for ref forwarding
- Optimized re-renders with proper prop dependencies
- Lazy loading support where applicable

### Theming
- Consistent use of CSS custom properties
- Easy color scheme customization
- Dark mode ready (requires additional configuration)

### Responsive Design
- Mobile-first approach
- Flexible layouts with CSS Grid and Flexbox
- Breakpoint-specific styling

## Development

### Setup
```bash
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install clsx react
```

### Configuration
Ensure your `tailwind.config.js` includes the custom color palette and theme extensions provided in the design system.

### Usage
Import components individually or use the barrel export:

```jsx
// Individual imports
import Button from './components/ui/Button';

// Barrel export
import { Button, Card, Modal } from './components/ui';
```

## Contributing

When adding new components:
1. Follow the established prop patterns
2. Include proper TypeScript interfaces
3. Add comprehensive documentation
4. Ensure accessibility compliance
5. Test across all supported browsers
6. Include usage examples

## Version History

- **v1.0.0**: Initial design system with core components
- Components: Button, Card, Badge, Input, Textarea, Select, Modal, Loading, Table, Navigation
- Tailwind CSS integration
- Dental-specific color palette
- Responsive design system
