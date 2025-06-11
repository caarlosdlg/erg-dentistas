/**
 * Performance Components Index  
 * Componentes optimizados para mejor rendimiento
 */

export { 
  withLazyLoading, 
  preloadCriticalRoutes,
  LazyImage,
  Dashboard,
  Pacientes,
  Citas,
  Tratamientos,
  Busqueda,
  DesignSystemDemo,
  LoginPage,
} from './LazyComponents';

export {
  OptimizedImage,
  VirtualizedCardList, 
  DebouncedSearchInput,
  ProgressiveLoader,
} from './OptimizedComponents';

export {
  OptimizedImage as ImageOptimized,
  OptimizedGallery,
  OptimizedBackgroundImage,
  imageOptimizer,
} from './ImageOptimization';

export {
  createAsyncComponent,
  ComponentFallback,
  ResourcePreloader,
  MemoryMonitor,
  PerformanceOptimizer,
  BundleSizeAnalyzer,
} from './BundleOptimizer';

// Export aliases for backward compatibility
export { PerformanceOptimizer as BundleOptimizer } from './BundleOptimizer';
export { PerformanceOptimizer as PerformanceWrapper } from './BundleOptimizer';

export { default as PerformanceDashboard } from './PerformanceDashboard';
