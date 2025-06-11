import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from 'lodash-es';

/**
 * Performance optimization hooks for DentalERP frontend
 * Enhanced with aggressive caching and memory optimization
 */

/**
 * Enhanced debounced callback hook with cleanup
 * Prevents excessive API calls during user input
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
  }, [delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Enhanced throttled callback hook for scroll/resize events
 */
export const useThrottledCallback = (callback, delay = 100) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);
  const lastRunRef = useRef(0);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    return (...args) => {
      const now = Date.now();
      
      if (now - lastRunRef.current >= delay) {
        callbackRef.current(...args);
        lastRunRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRunRef.current = Date.now();
        }, delay - (now - lastRunRef.current));
      }
    };
  }, [delay]);
};

/**
 * Memoized stable reference hook
 * Prevents unnecessary re-renders when passing objects/arrays as props
 */
export const useStableCallback = (callback, deps = []) => {
  return useCallback(callback, deps);
};

export const useStableMemo = (factory, deps = []) => {
  return useMemo(factory, deps);
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renderCount.current} times, last render took ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });

  return { renderCount: renderCount.current };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [wasIntersecting, setWasIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting && !wasIntersecting) {
          setWasIntersecting(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [wasIntersecting]);

  return { targetRef, isIntersecting, wasIntersecting };
};

/**
 * Virtual list hook for large data sets
 */
export const useVirtualList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight,
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useThrottledCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, 16); // ~60fps

  return {
    containerRef,
    visibleItems,
    totalHeight,
    containerHeight,
    handleScroll,
  };
};

/**
 * Optimized form state hook
 */
export const useOptimizedForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouchedState] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = useCallback((name) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    reset,
  };
};

/**
 * Local storage hook with performance optimization and memory management
 */
export const useOptimizedLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

/**
 * Heavy computation hook with memoization and web workers
 */
export const useHeavyComputation = (computeFn, dependencies, options = {}) => {
  const { useWebWorker = false, timeout = 5000 } = options;
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const memoizedDeps = useMemo(() => dependencies, dependencies);

  useEffect(() => {
    if (!computeFn) return;

    setIsLoading(true);
    setError(null);

    const processComputation = async () => {
      try {
        if (useWebWorker && window.Worker) {
          // Use Web Worker for heavy computations (if available)
          const workerCode = `
            self.onmessage = function(e) {
              try {
                const result = (${computeFn.toString()})(e.data);
                self.postMessage({ success: true, result });
              } catch (error) {
                self.postMessage({ success: false, error: error.message });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const worker = new Worker(URL.createObjectURL(blob));

          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              worker.terminate();
              reject(new Error('Computation timeout'));
            }, timeout);

            worker.onmessage = (e) => {
              clearTimeout(timeoutId);
              worker.terminate();
              if (e.data.success) {
                resolve(e.data.result);
              } else {
                reject(new Error(e.data.error));
              }
            };

            worker.postMessage(memoizedDeps);
          });
        } else {
          // Fallback to main thread with timeout
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Computation timeout'));
            }, timeout);

            try {
              const result = computeFn(memoizedDeps);
              clearTimeout(timeoutId);
              resolve(result);
            } catch (error) {
              clearTimeout(timeoutId);
              reject(error);
            }
          });
        }
      } catch (err) {
        throw err;
      }
    };

    processComputation()
      .then(setResult)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [computeFn, memoizedDeps, useWebWorker, timeout]);

  return { result, isLoading, error };
};

/**
 * Resource preloader hook
 */
export const useResourcePreloader = () => {
  const [preloadedResources, setPreloadedResources] = useState(new Set());

  const preloadImage = useCallback(async (src) => {
    if (preloadedResources.has(src)) return true;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setPreloadedResources(prev => new Set([...prev, src]));
        resolve(true);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedResources]);

  const preloadScript = useCallback(async (src) => {
    if (preloadedResources.has(src)) return true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        setPreloadedResources(prev => new Set([...prev, src]));
        resolve(true);
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, [preloadedResources]);

  const preloadCSS = useCallback(async (href) => {
    if (preloadedResources.has(href)) return true;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        setPreloadedResources(prev => new Set([...prev, href]));
        resolve(true);
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }, [preloadedResources]);

  return { preloadImage, preloadScript, preloadCSS, preloadedResources };
};

/**
 * Memory monitoring hook
 */
export const useMemoryMonitor = (threshold = 50 * 1024 * 1024) => { // 50MB default
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [isLowMemory, setIsLowMemory] = useState(false);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = performance.memory;
      const memInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      setMemoryInfo(memInfo);
      setIsLowMemory(memory.usedJSHeapSize > threshold);
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000);

    return () => clearInterval(interval);
  }, [threshold]);

  const requestGarbageCollection = useCallback(() => {
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }, []);

  return { memoryInfo, isLowMemory, requestGarbageCollection };
};
