/**
 * UI Components Index
 * Sistema de diseño DentalERP - Componentes reutilizables con Tailwind CSS
 */

// Enhanced components using Tailwind CSS with performance optimizations
export { default as ButtonTW, IconButton, ButtonGroup } from './ButtonTW';
export { default as CardTW } from './CardTW';
export { default as Modal, ConfirmDialog } from './Modal';
export { 
  default as Loading, 
  Spinner, 
  LoadingDots, 
  Skeleton, 
  PageLoading, 
  CardLoading, 
  TableLoading 
} from './Loading';
export { 
  default as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableFooter,
  TableCaption,
} from './Table';
export { 
  default as Navbar,
  NavLink,
  NavDropdown,
  NavDropdownItem,
} from './Navbar';

// Form components (Tailwind-based)
export { 
  default as FormInput,
  Textarea,
  Select,
} from './FormElements';

// Enhanced form components with accessibility
export { 
  FormInput as EnhancedFormInput,
  Textarea as EnhancedTextarea,
  Select as EnhancedSelect,
} from './EnhancedFormElements';

// Performance-optimized components
export { default as DataTable } from './DataTable';

// Layout components
export { default as Container } from './Container';
export { default as Flex } from './Flex';

// Existing components (using Styled Components - for backward compatibility)
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Alert } from './Alert';
