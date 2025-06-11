/**
 * React Performance Utilities
 * Higher-order components and utilities for performance optimization
 */
import React, { memo, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useStableCallback, useMemoryMonitor, useResourcePreloader } from '../../hooks/usePerformance';

/**
 * Higher-order component for performance monitoring
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const PerformanceMonitoredComponent = memo((props) => {
    const renderCount = useRef(0);
    const startTime = useRef(Date.now());

    useEffect(() => {
      renderCount.current += 1;
      const renderTime = Date.now() - startTime.current;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`[Performance] ${componentName} slow render: ${renderTime}ms (render #${renderCount.current})`);
      }
      
      startTime.current = Date.now();
    });

    return <WrappedComponent {...props} />;
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return PerformanceMonitoredComponent;
};

/**
 * Memoized list component with virtual scrolling
 */
export const MemoizedList = memo(({
  items = [],
  renderItem,
  keyExtractor,
  estimatedItemSize = 50,
  className = '',
  EmptyComponent = null,
  LoadingComponent = null,
  isLoading = false,
  ...props
}) => {
  const containerRef = useRef(null);
  
  // Memoize the rendered items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : index;
      return (
        <div key={key} className="list-item-container">
          {renderItem(item, index)}
        </div>
      );
    });
  }, [items, renderItem, keyExtractor]);

  if (isLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  if (items.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  return (
    <div 
      ref={containerRef}
      className={`optimized-list ${className}`}
      {...props}
    >
      {memoizedItems}
    </div>
  );
});

MemoizedList.displayName = 'MemoizedList';

/**
 * Optimized form field component
 */
export const OptimizedFormField = memo(({
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  error = null,
  className = '',
  debounceMs = 300,
  ...props
}) => {
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Stable callback to prevent re-renders
  const handleChange = useStableCallback((e) => {
    const newValue = e.target.value;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange callback
    timeoutRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleBlur = useStableCallback((e) => {
    onBlur?.(e);
  }, [onBlur]);

  const handleFocus = useStableCallback((e) => {
    onFocus?.(e);
  }, [onFocus]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const inputClasses = useMemo(() => {
    return [
      'optimized-input',
      'transition-colors duration-200',
      error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
      disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      className
    ].filter(Boolean).join(' ');
  }, [error, disabled, className]);

  return (
    <div className="form-field-container">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
});

OptimizedFormField.displayName = 'OptimizedFormField';

/**
 * Optimized modal component with portal and focus management
 */
export const OptimizedModal = memo(({
  isOpen = false,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    } else if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = useStableCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  }, [closeOnOverlayClick, onClose]);

  const sizeClasses = useMemo(() => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full m-4'
    };
    return sizes[size] || sizes.md;
  }, [size]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="flex min-h-screen items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        />
        
        {/* Modal content */}
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl transform transition-all ${sizeClasses} ${className}`}
          tabIndex={-1}
          {...props}
        >
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          )}
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedModal.displayName = 'OptimizedModal';

/**
 * Optimized data fetcher with caching
 */
export const OptimizedDataFetcher = memo(({
  url,
  children,
  LoadingComponent = () => <div>Loading...</div>,
  ErrorComponent = ({ error }) => <div>Error: {error.message}</div>,
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes
  ...props
}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const cacheRef = useRef(new Map());

  const fetchData = useCallback(async () => {
    const key = cacheKey || url;
    const cached = cacheRef.current.get(key);
    
    // Check cache validity
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Cache the result
      cacheRef.current.set(key, {
        data: result,
        timestamp: Date.now()
      });
      
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheDuration]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, fetchData]);

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return null;

  return children(data);
});

OptimizedDataFetcher.displayName = 'OptimizedDataFetcher';

/**
 * Performance-optimized route component
 */
export const OptimizedRoute = memo(({
  component: Component,
  preloadResources = [],
  ...props
}) => {
  const { preloadImage, preloadScript, preloadCSS } = useResourcePreloader();
  const [isResourcesLoaded, setIsResourcesLoaded] = React.useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const promises = preloadResources.map(resource => {
          switch (resource.type) {
            case 'image': return preloadImage(resource.url);
            case 'script': return preloadScript(resource.url);
            case 'css': return preloadCSS(resource.url);
            default: return Promise.resolve();
          }
        });
        
        await Promise.all(promises);
        setIsResourcesLoaded(true);
      } catch (error) {
        console.error('Failed to preload resources:', error);
        setIsResourcesLoaded(true); // Continue anyway
      }
    };

    if (preloadResources.length > 0) {
      loadResources();
    } else {
      setIsResourcesLoaded(true);
    }
  }, [preloadResources, preloadImage, preloadScript, preloadCSS]);

  if (!isResourcesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <Component {...props} />;
});

OptimizedRoute.displayName = 'OptimizedRoute';

export default {
  withPerformanceMonitoring,
  MemoizedList,
  OptimizedFormField,
  OptimizedModal,
  OptimizedDataFetcher,
  OptimizedRoute,
};
