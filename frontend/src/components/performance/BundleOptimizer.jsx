/**
 * Bundle Optimizer Component
 * Advanced performance optimization utilities for production builds
 */
import React, { memo, useCallback, useMemo, Suspense, lazy } from 'react';
import { clsx } from 'clsx';
import { useStableCallback, useResourcePreloader, useMemoryMonitor } from '../../hooks/usePerformance';

/**
 * Code splitting utility for dynamic imports
 */
const createAsyncComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  return memo((props) => (
    <Suspense fallback={fallback || <ComponentFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

/**
 * Optimized component fallback
 */
const ComponentFallback = memo(() => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center">
    <div className="text-gray-400">Cargando...</div>
  </div>
));

/**
 * Resource preloader component for critical assets
 */
const ResourcePreloader = memo(({ resources = [], onComplete }) => {
  const { preloadImage, preloadScript, preloadCSS } = useResourcePreloader();
  const [loaded, setLoaded] = React.useState(0);

  const preloadResources = useCallback(async () => {
    const promises = resources.map(async (resource) => {
      try {
        switch (resource.type) {
          case 'image':
            await preloadImage(resource.url);
            break;
          case 'script':
            await preloadScript(resource.url);
            break;
          case 'css':
            await preloadCSS(resource.url);
            break;
          default:
            console.warn(`Unknown resource type: ${resource.type}`);
        }
        setLoaded(prev => prev + 1);
      } catch (error) {
        console.error(`Failed to preload ${resource.url}:`, error);
      }
    });

    await Promise.allSettled(promises);
    onComplete?.();
  }, [resources, preloadImage, preloadScript, preloadCSS, onComplete]);

  React.useEffect(() => {
    if (resources.length > 0) {
      preloadResources();
    }
  }, [preloadResources]);

  if (resources.length === 0) return null;

  const progress = (loaded / resources.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 h-1">
      <div 
        className="h-full bg-blue-400 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

/**
 * Memory monitor component
 */
const MemoryMonitor = memo(({ showWarning = true }) => {
  const { memoryInfo, isLowMemory, requestGarbageCollection } = useMemoryMonitor();

  const formatBytes = useCallback((bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  if (!memoryInfo) return null;

  return (
    <div className={clsx(
      'fixed bottom-4 right-4 p-2 rounded-lg text-xs',
      isLowMemory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
    )}>
      <div>Memoria: {formatBytes(memoryInfo.used)} / {formatBytes(memoryInfo.limit)}</div>
      <div>Uso: {memoryInfo.percentage.toFixed(1)}%</div>
      {isLowMemory && showWarning && (
        <button
          onClick={requestGarbageCollection}
          className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs"
        >
          Limpiar
        </button>
      )}
    </div>
  );
});

/**
 * Performance optimizer wrapper component
 */
const PerformanceOptimizer = memo(({ 
  children, 
  enableMemoryMonitor = process.env.NODE_ENV === 'development',
  preloadResources = [],
  className = ''
}) => {
  const [isOptimized, setIsOptimized] = React.useState(false);

  // Initialize performance optimizations
  React.useEffect(() => {
    // Enable performance observers
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', entry.value);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }

      return () => observer.disconnect();
    }
  }, []);

  // Set up intersection observer for viewport optimization
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsOptimized(true);
        }
      });
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={clsx('performance-optimized', className)}>
      {preloadResources.length > 0 && (
        <ResourcePreloader 
          resources={preloadResources}
          onComplete={() => setIsOptimized(true)}
        />
      )}
      
      {isOptimized ? children : <ComponentFallback />}
      
      {enableMemoryMonitor && <MemoryMonitor />}
    </div>
  );
});

/**
 * Bundle size analyzer (development only)
 */
const BundleSizeAnalyzer = memo(() => {
  const [analysis, setAnalysis] = React.useState(null);

  const analyzeBundleSize = useCallback(async () => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      // Mock bundle analysis - in real app, this would connect to build tools
      const mockAnalysis = {
        totalSize: '2.1 MB',
        gzippedSize: '650 KB',
        chunks: [
          { name: 'vendor', size: '800 KB', gzipped: '250 KB' },
          { name: 'main', size: '400 KB', gzipped: '120 KB' },
          { name: 'dashboard', size: '300 KB', gzipped: '90 KB' },
          { name: 'patients', size: '250 KB', gzipped: '75 KB' },
          { name: 'ui-components', size: '200 KB', gzipped: '60 KB' },
        ],
        recommendations: [
          'Consider code splitting for large vendor libraries',
          'Implement tree shaking for unused exports',
          'Use dynamic imports for non-critical features',
          'Optimize image assets with WebP format',
        ]
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }
  }, []);

  React.useEffect(() => {
    analyzeBundleSize();
  }, [analyzeBundleSize]);

  if (!analysis) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="font-semibold mb-4">Análisis de Bundle</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Tamaño Total</div>
          <div className="font-bold text-lg">{analysis.totalSize}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Comprimido (GZIP)</div>
          <div className="font-bold text-lg text-green-600">{analysis.gzippedSize}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Chunks</h4>
        <div className="space-y-2">
          {analysis.chunks.map((chunk, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{chunk.name}</span>
              <span className="text-gray-600">
                {chunk.size} → {chunk.gzipped}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Recomendaciones</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

// Export utilities
export {
  createAsyncComponent,
  ComponentFallback,
  ResourcePreloader,
  MemoryMonitor,
  PerformanceOptimizer,
  BundleSizeAnalyzer,
};

export default PerformanceOptimizer;
