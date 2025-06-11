/**
 * UX Components Index
 * Optimización de experiencia de usuario para DentalERP
 */

export { default as AccessibilityProvider, useAccessibility } from './AccessibilityProvider';
export { default as FeedbackProvider, useFeedback } from './FeedbackProvider';
export { 
  default as NavigationProvider, 
  useNavigation,
  NavigationBreadcrumb,
  NavigationPageHeader,
  NavigationPageTransition,
} from './NavigationProvider';

// New UX Components
export { default as OfflineStatus } from './OfflineStatus';
export { default as PWAInstallPrompt } from './PWAInstallPrompt';
export { default as KeyboardShortcuts } from './KeyboardShortcuts';
