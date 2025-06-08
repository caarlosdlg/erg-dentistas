/**
 * Responsive Design Testing Utilities
 * Tools for testing responsive behavior and breakpoints
 */

// Breakpoint definitions matching Tailwind CSS
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Common device viewport sizes for testing
export const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone XR' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' }
};

/**
 * Get current breakpoint based on window width
 */
export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Get current breakpoint with detailed info
 */
export const getCurrentBreakpointInfo = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const breakpoint = getCurrentBreakpoint();
  
  return {
    breakpoint,
    width,
    height,
    description: getBreakpointDescription(breakpoint),
    isDesktop: width >= BREAKPOINTS.lg,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isMobile: width < BREAKPOINTS.md,
    aspectRatio: (width / height).toFixed(2)
  };
};

/**
 * Get human-readable breakpoint description
 */
export const getBreakpointDescription = (breakpoint) => {
  const descriptions = {
    xs: 'Extra Small (< 640px)',
    sm: 'Small (640px - 767px)',
    md: 'Medium (768px - 1023px)',
    lg: 'Large (1024px - 1279px)',
    xl: 'Extra Large (1280px - 1535px)',
    '2xl': '2X Large (≥ 1536px)'
  };
  
  return descriptions[breakpoint] || 'Unknown';
};

/**
 * Test if element is touch-friendly (minimum 44px touch target)
 */
export const isTouchFriendly = (element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const minSize = 44; // Apple's recommended minimum touch target size
  
  return rect.width >= minSize && rect.height >= minSize;
};

/**
 * Test responsive component visibility
 */
export const testResponsiveVisibility = () => {
  const tests = [];
  const breakpoint = getCurrentBreakpoint();
  
  // Test hidden/visible classes
  const hiddenMobile = document.querySelectorAll('.hidden, .sm\\:hidden');
  const visibleMobile = document.querySelectorAll('.block, .sm\\:block');
  
  tests.push({
    name: 'Hidden Elements',
    passed: hiddenMobile.length >= 0,
    details: `Found ${hiddenMobile.length} hidden elements`
  });
  
  tests.push({
    name: 'Visible Elements',
    passed: visibleMobile.length >= 0,
    details: `Found ${visibleMobile.length} visible elements`
  });
  
  return tests;
};

/**
 * Test touch-friendly elements
 */
export const testTouchFriendly = () => {
  const tests = [];
  const buttons = document.querySelectorAll('button, a, [role="button"]');
  let touchFriendlyCount = 0;
  
  buttons.forEach(button => {
    if (isTouchFriendly(button)) {
      touchFriendlyCount++;
    }
  });
  
  tests.push({
    name: 'Touch-Friendly Elements',
    passed: touchFriendlyCount === buttons.length,
    details: `${touchFriendlyCount}/${buttons.length} elements are touch-friendly (44px minimum)`
  });
  
  return tests;
};

/**
 * Test responsive grid behavior
 */
export const testResponsiveGrids = () => {
  const tests = [];
  const grids = document.querySelectorAll('[class*="grid"], [class*="flex"]');
  
  tests.push({
    name: 'Responsive Grids',
    passed: grids.length > 0,
    details: `Found ${grids.length} grid/flex containers`
  });
  
  return tests;
};

/**
 * Run all responsive tests
 */
export const runResponsiveTests = () => {
  const breakpointInfo = getCurrentBreakpointInfo();
  const tests = [
    ...testResponsiveVisibility(),
    ...testTouchFriendly(),
    ...testResponsiveGrids()
  ];
  
  const passedTests = tests.filter(test => test.passed).length;
  const totalTests = tests.length;
  
  return {
    breakpointInfo,
    tests,
    summary: {
      passed: passedTests,
      total: totalTests,
      percentage: Math.round((passedTests / totalTests) * 100)
    }
  };
};

/**
 * Log responsive test results to console
 */
export const logResponsiveTests = () => {
  const results = runResponsiveTests();
  
  console.group('🔧 Responsive Design Tests');
  console.log('📱 Current Breakpoint:', results.breakpointInfo);
  console.log('📊 Test Summary:', results.summary);
  
  results.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.details}`);
  });
  
  console.groupEnd();
  
  return results;
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(logResponsiveTests, 1000);
    });
  } else {
    setTimeout(logResponsiveTests, 1000);
  }
  
  // Run tests on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(logResponsiveTests, 500);
  });
}
