/**
 * Performance utilities for monitoring and optimization
 * Utilidades de rendimiento para monitoreo y optimización
 */

// Performance metrics collection
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
  }

  // Start measuring performance
  startMeasure(name) {
    if (!this.isEnabled) return;
    
    performance.mark(`${name}-start`);
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  }

  // End measuring performance
  endMeasure(name) {
    if (!this.isEnabled || !this.metrics.has(name)) return;
    
    const endTime = performance.now();
    const metric = this.metrics.get(name);
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    return metric.duration;
  }

  // Get metric by name
  getMetric(name) {
    return this.metrics.get(name);
  }

  // Get all metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals() {
    if (!this.isEnabled) return;

    // Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1];
      this.metrics.set('LCP', {
        value: lcpEntry.startTime,
        rating: lcpEntry.startTime <= 2500 ? 'good' : lcpEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
      });
    });

    // First Input Delay (FID)
    this.observePerformance('first-input', (entries) => {
      const fidEntry = entries[0];
      const fid = fidEntry.processingStart - fidEntry.startTime;
      this.metrics.set('FID', {
        value: fid,
        rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observePerformance('layout-shift', (entries) => {
      let cls = 0;
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      this.metrics.set('CLS', {
        value: cls,
        rating: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor'
      });
    });
  }

  // Generic performance observer
  observePerformance(type, callback) {
    if (!this.isEnabled || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  // Measure bundle size
  async measureBundleSize() {
    if (!navigator.connection) return null;

    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;

    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;
        if (resource.name.endsWith('.js')) {
          jsSize += resource.transferSize;
        } else if (resource.name.endsWith('.css')) {
          cssSize += resource.transferSize;
        }
      }
    });

    return {
      total: this.formatBytes(totalSize),
      javascript: this.formatBytes(jsSize),
      css: this.formatBytes(cssSize),
      compression: resources.some(r => r.encodedBodySize < r.decodedBodySize)
    };
  }

  // Format bytes to human readable
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Generate performance report
  generateReport() {
    return {
      metrics: this.getAllMetrics(),
      timing: this.getNavigationTiming(),
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo(),
    };
  }

  // Get navigation timing
  getNavigationTiming() {
    if (!this.isEnabled) return null;
    
    const timing = performance.getEntriesByType('navigation')[0];
    if (!timing) return null;

    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      timeToFirstByte: timing.responseStart - timing.requestStart,
    };
  }

  // Get memory information
  getMemoryInfo() {
    if (!this.isEnabled || !performance.memory) return null;
    
    return {
      usedJSHeapSize: this.formatBytes(performance.memory.usedJSHeapSize),
      totalJSHeapSize: this.formatBytes(performance.memory.totalJSHeapSize),
      jsHeapSizeLimit: this.formatBytes(performance.memory.jsHeapSizeLimit),
    };
  }

  // Get connection information
  getConnectionInfo() {
    if (!navigator.connection) return null;
    
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
    };
  }

  // Clear all data
  clear() {
    this.metrics.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React performance utilities
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(`${componentName}-render`);
      return () => {
        performanceMonitor.endMeasure(`${componentName}-render`);
      };
    });

    return React.createElement(WrappedComponent, props);
  });
};

// Performance debugging utilities
export const logPerformanceMetrics = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚀 Performance Metrics');
    console.table(performanceMonitor.getAllMetrics());
    console.log('📊 Navigation Timing:', performanceMonitor.getNavigationTiming());
    console.log('💾 Memory Info:', performanceMonitor.getMemoryInfo());
    console.log('🌐 Connection Info:', performanceMonitor.getConnectionInfo());
    console.groupEnd();
  }
};

// Bundle analysis utilities
export const analyzeBundleSize = async () => {
  const bundleInfo = await performanceMonitor.measureBundleSize();
  if (bundleInfo && process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Analysis');
    console.log('Total Size:', bundleInfo.total);
    console.log('JavaScript:', bundleInfo.javascript);
    console.log('CSS:', bundleInfo.css);
    console.log('Compression:', bundleInfo.compression ? 'Enabled' : 'Disabled');
    console.groupEnd();
  }
  return bundleInfo;
};

// Image optimization utilities
export const createOptimizedImageSrc = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fallbackFormat = 'jpg'
  } = options;

  // Simple implementation - in production you'd use a service like Cloudinary
  const params = new URLSearchParams();
  if (width) params.set('w', width);
  if (height) params.set('h', height);
  params.set('q', quality);
  params.set('f', format);

  return {
    webp: `${src}?${params.toString()}`,
    fallback: `${src}?${params.toString().replace(`f=${format}`, `f=${fallbackFormat}`)}`
  };
};

// Performance API utilities
export const measureAsyncOperation = async (name, operation) => {
  performanceMonitor.startMeasure(name);
  try {
    const result = await operation();
    const duration = performanceMonitor.endMeasure(name);
    console.log(`⏱️ ${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    performanceMonitor.endMeasure(name);
    throw error;
  }
};
