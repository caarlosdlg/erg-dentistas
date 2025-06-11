import React, { Suspense, lazy, memo } from 'react';
import { Loading } from '../ui';

/**
 * Higher-order component for lazy loading with error boundaries
 * Provides code splitting and progressive loading for better performance
 */

// Create lazy-loaded components for main pages
const LazyDashboard = lazy(() => import('../../pages/Dashboard'));
const LazyPacientes = lazy(() => import('../../pages/Pacientes'));
const LazyCitas = lazy(() => import('../../pages/Citas'));
const LazyTratamientos = lazy(() => import('../../pages/Tratamientos'));
const LazyBusqueda = lazy(() => import('../../pages/Busqueda'));
const LazyDesignSystemDemo = lazy(() => import('../../pages/DesignSystemDemo'));
const LazyLoginPage = lazy(() => import('../../pages/LoginPage'));
// Temporarily disabled - files don't exist
// const LazySearchAndImageDemo = lazy(() => import('../../pages/SearchAndImageDemo'));
// const LazyResponsiveDemo = lazy(() => import('../../pages/ResponsiveDemo'));

/**
 * Error boundary component for lazy loading failures
 */
class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el componente
            </h3>
            <p className="text-gray-600 mb-4">
              Hubo un problema al cargar esta sección. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading fallback component with skeleton
 */
const LazyLoadingFallback = memo(({ type = 'page' }) => {
  if (type === 'page') {
    return (
      <div className="min-h-[600px] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loading variant="spinner" size="lg" text="Cargando componente..." />
    </div>
  );
});

LazyLoadingFallback.displayName = 'LazyLoadingFallback';

/**
 * Higher-order component wrapper for lazy loading
 */
const withLazyLoading = (LazyComponent, fallbackType = 'page') => {
  const WrappedComponent = memo((props) => (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LazyLoadingFallback type={fallbackType} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  ));

  WrappedComponent.displayName = `withLazyLoading(${LazyComponent.displayName || LazyComponent.name})`;
  return WrappedComponent;
};

/**
 * Pre-configured lazy components ready for use
 */
export const Dashboard = withLazyLoading(LazyDashboard);
export const Pacientes = withLazyLoading(LazyPacientes);
export const Citas = withLazyLoading(LazyCitas);
export const Tratamientos = withLazyLoading(LazyTratamientos);
export const Busqueda = withLazyLoading(LazyBusqueda);
export const DesignSystemDemo = withLazyLoading(LazyDesignSystemDemo);
export const LoginPage = withLazyLoading(LazyLoginPage);
// Temporarily disabled - files don't exist
// export const SearchAndImageDemo = withLazyLoading(LazySearchAndImageDemo);
// export const ResponsiveDemo = withLazyLoading(LazyResponsiveDemo);

/**
 * Preload function for critical routes
 */
export const preloadCriticalRoutes = () => {
  // Preload dashboard and most commonly accessed pages
  import('../../pages/Dashboard');
  import('../../pages/Pacientes');
  import('../../pages/Citas');
};

/**
 * Component for progressive image loading
 */
export const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  loadingClassName = 'bg-gray-200 animate-pulse',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setError(true);

  if (error && fallback) {
    return fallback;
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 ${loadingClassName}`} />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading="lazy"
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export { withLazyLoading, LazyLoadErrorBoundary, LazyLoadingFallback };
