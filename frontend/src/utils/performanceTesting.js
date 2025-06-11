/**
 * Performance Testing and Optimization Utilities
 * Herramientas para testing y optimización de rendimiento
 */
import { performanceMonitor } from './performance';
import { AccessibilityAuditor } from './accessibility';
import { auditSEO } from './seo';

/**
 * Comprehensive Performance Test Suite
 */
export class PerformanceTestSuite {
  constructor() {
    this.results = {
      performance: {},
      accessibility: {},
      seo: {},
      lighthouse: {},
      bundle: {},
    };
  }

  /**
   * Run complete performance audit
   */
  async runCompleteAudit() {
    console.group('🚀 Running Complete Performance Audit');
    
    try {
      // Performance metrics
      await this.testPerformanceMetrics();
      
      // Accessibility audit
      await this.testAccessibility();
      
      // SEO audit
      await this.testSEO();
      
      // Bundle analysis
      await this.testBundleSize();
      
      // Generate recommendations
      this.generateRecommendations();
      
      console.log('✅ Complete audit finished');
      return this.results;
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test performance metrics
   */
  async testPerformanceMetrics() {
    console.log('📊 Testing performance metrics...');
    
    // Start monitoring
    performanceMonitor.monitorCoreWebVitals();
    
    // Wait for metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Collect results
    const metrics = performanceMonitor.getAllMetrics();
    const timing = performanceMonitor.getNavigationTiming();
    const memory = performanceMonitor.getMemoryInfo();
    const connection = performanceMonitor.getConnectionInfo();
    
    this.results.performance = {
      coreWebVitals: metrics,
      timing,
      memory,
      connection,
      score: this.calculatePerformanceScore(metrics, timing),
    };
    
    console.log('✅ Performance metrics collected');
  }

  /**
   * Test accessibility
   */
  async testAccessibility() {
    console.log('♿ Testing accessibility...');
    
    const auditor = new AccessibilityAuditor();
    const results = await auditor.runAudit();
    
    this.results.accessibility = results;
    console.log(`✅ Accessibility audit completed - Score: ${results.score}/100`);
  }

  /**
   * Test SEO
   */
  async testSEO() {
    console.log('🔍 Testing SEO...');
    
    const results = auditSEO();
    this.results.seo = results;
    
    console.log(`✅ SEO audit completed - Score: ${results.score}/100`);
  }

  /**
   * Test bundle size
   */
  async testBundleSize() {
    console.log('📦 Testing bundle size...');
    
    const bundleInfo = await performanceMonitor.measureBundleSize();
    this.results.bundle = bundleInfo;
    
    console.log('✅ Bundle analysis completed');
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore(metrics, timing) {
    let score = 100;
    
    // Core Web Vitals scoring
    if (metrics.LCP) {
      if (metrics.LCP.rating === 'poor') score -= 30;
      else if (metrics.LCP.rating === 'needs-improvement') score -= 15;
    }
    
    if (metrics.FID) {
      if (metrics.FID.rating === 'poor') score -= 25;
      else if (metrics.FID.rating === 'needs-improvement') score -= 10;
    }
    
    if (metrics.CLS) {
      if (metrics.CLS.rating === 'poor') score -= 20;
      else if (metrics.CLS.rating === 'needs-improvement') score -= 8;
    }
    
    // Timing scoring
    if (timing) {
      if (timing.domContentLoaded > 3000) score -= 15;
      else if (timing.domContentLoaded > 1500) score -= 8;
      
      if (timing.loadComplete > 5000) score -= 10;
      else if (timing.loadComplete > 3000) score -= 5;
    }
    
    return Math.max(0, score);
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    if (this.results.performance.score < 80) {
      recommendations.push({
        category: 'Performance',
        priority: 'high',
        issue: 'Overall performance score is below optimal',
        solution: 'Review Core Web Vitals and optimize critical resources',
      });
    }
    
    if (this.results.performance.coreWebVitals.LCP?.rating === 'poor') {
      recommendations.push({
        category: 'Performance',
        priority: 'high',
        issue: 'Largest Contentful Paint is too slow',
        solution: 'Optimize images, reduce server response time, and eliminate render-blocking resources',
      });
    }
    
    if (this.results.performance.coreWebVitals.FID?.rating === 'poor') {
      recommendations.push({
        category: 'Performance',
        priority: 'medium',
        issue: 'First Input Delay is too high',
        solution: 'Reduce JavaScript execution time and optimize main thread work',
      });
    }
    
    if (this.results.performance.coreWebVitals.CLS?.rating === 'poor') {
      recommendations.push({
        category: 'Performance',
        priority: 'medium',
        issue: 'Cumulative Layout Shift is too high',
        solution: 'Set explicit dimensions for images and avoid inserting content above existing content',
      });
    }
    
    // Accessibility recommendations
    if (this.results.accessibility.score < 90) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'high',
        issue: 'Accessibility score needs improvement',
        solution: 'Review and fix accessibility issues found in the audit',
      });
    }
    
    // SEO recommendations
    if (this.results.seo.score < 80) {
      recommendations.push({
        category: 'SEO',
        priority: 'medium',
        issue: 'SEO optimization can be improved',
        solution: 'Implement missing meta tags and improve content structure',
      });
    }
    
    this.results.recommendations = recommendations;
    
    console.group('💡 Optimization Recommendations');
    recommendations.forEach(rec => {
      console.log(`[${rec.priority.toUpperCase()}] ${rec.category}: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
    });
    console.groupEnd();
  }

  /**
   * Export results to JSON
   */
  exportResults() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DentalERP Performance Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; }
    .score-card { background: white; border-radius: 8px; padding: 20px; margin: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .score { font-size: 3em; font-weight: bold; margin: 10px 0; }
    .good { color: #10b981; }
    .warning { color: #f59e0b; }
    .poor { color: #ef4444; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .recommendations { background: white; border-radius: 8px; padding: 20px; margin-top: 20px; }
    .rec-item { margin: 10px 0; padding: 10px; border-left: 4px solid #3b82f6; background: #f1f5f9; }
    .high { border-left-color: #ef4444; }
    .medium { border-left-color: #f59e0b; }
    .low { border-left-color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 DentalERP Performance Report</h1>
      <p>Generated on ${new Date().toLocaleString('es-ES')}</p>
    </div>
    
    <div class="grid">
      <div class="score-card">
        <h2>📊 Performance</h2>
        <div class="score ${this.getScoreClass(this.results.performance.score)}">${this.results.performance.score || 'N/A'}</div>
        <p>Overall performance score based on Core Web Vitals</p>
      </div>
      
      <div class="score-card">
        <h2>♿ Accessibility</h2>
        <div class="score ${this.getScoreClass(this.results.accessibility.score)}">${this.results.accessibility.score || 'N/A'}</div>
        <p>WCAG 2.1 AA compliance score</p>
      </div>
      
      <div class="score-card">
        <h2>🔍 SEO</h2>
        <div class="score ${this.getScoreClass(this.results.seo.score)}">${this.results.seo.score || 'N/A'}</div>
        <p>Search engine optimization score</p>
      </div>
    </div>
    
    <div class="recommendations">
      <h2>💡 Recommendations</h2>
      ${this.results.recommendations?.map(rec => `
        <div class="rec-item ${rec.priority}">
          <strong>[${rec.priority.toUpperCase()}] ${rec.category}:</strong> ${rec.issue}<br>
          <em>Solution: ${rec.solution}</em>
        </div>
      `).join('') || '<p>No recommendations available</p>'}
    </div>
  </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Get CSS class for score
   */
  getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 70) return 'warning';
    return 'poor';
  }
}

/**
 * Quick performance check
 */
export const quickPerformanceCheck = async () => {
  const suite = new PerformanceTestSuite();
  return await suite.runCompleteAudit();
};

/**
 * Automated performance monitoring
 */
export const startPerformanceMonitoring = (interval = 30000) => {
  console.log('🔄 Starting automated performance monitoring...');
  
  const monitor = setInterval(async () => {
    try {
      const report = performanceMonitor.generateReport();
      
      // Check for performance issues
      const issues = [];
      
      if (report.memory && report.memory.usedJSHeapSize > '50 MB') {
        issues.push('High memory usage detected');
      }
      
      if (report.timing && report.timing.domContentLoaded > 3000) {
        issues.push('Slow DOM content loaded time');
      }
      
      if (issues.length > 0) {
        console.warn('⚠️ Performance issues detected:', issues);
      }
      
    } catch (error) {
      console.error('❌ Performance monitoring error:', error);
    }
  }, interval);
  
  return monitor;
};

/**
 * Performance optimization suggestions
 */
export const getOptimizationSuggestions = () => [
  {
    category: 'Images',
    suggestions: [
      'Use WebP format for images when supported',
      'Implement lazy loading for images below the fold',
      'Optimize image dimensions for different screen sizes',
      'Use responsive images with srcset',
    ]
  },
  {
    category: 'JavaScript',
    suggestions: [
      'Implement code splitting for route-based chunks',
      'Use React.memo for expensive components',
      'Optimize re-renders with useCallback and useMemo',
      'Remove unused JavaScript code',
    ]
  },
  {
    category: 'CSS',
    suggestions: [
      'Remove unused CSS styles',
      'Use CSS-in-JS for component-scoped styles',
      'Implement critical CSS inlining',
      'Optimize CSS delivery',
    ]
  },
  {
    category: 'Network',
    suggestions: [
      'Enable GZIP/Brotli compression',
      'Use HTTP/2 server push for critical resources',
      'Implement service worker for caching',
      'Optimize API response times',
    ]
  },
  {
    category: 'Bundle',
    suggestions: [
      'Analyze bundle size with webpack-bundle-analyzer',
      'Tree-shake unused dependencies',
      'Use dynamic imports for large libraries',
      'Implement module federation for micro-frontends',
    ]
  }
];

// Global performance test suite instance
export const performanceTestSuite = new PerformanceTestSuite();
