/**
 * Accessibility testing and utilities for DentalERP
 * Pruebas de accesibilidad y utilidades WCAG 2.1 AA
 */

/**
 * Accessibility Auditor
 */
export class AccessibilityAuditor {
  constructor() {
    this.wcagLevel = 'AA';
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  // Run complete accessibility audit
  async runAudit() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];

    // Basic checks
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkARIALabels();
    this.checkHeadingStructure();
    this.checkFormLabels();
    this.checkImageAltText();
    this.checkLinkDescriptions();
    this.checkFocusManagement();
    this.checkSemanticHTML();
    this.checkScreenReaderSupport();

    return this.generateReport();
  }

  // Check color contrast ratios
  checkColorContrast() {
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, label, li');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return; // Skip transparent backgrounds
      }
      
      const contrast = this.calculateContrastRatio(color, backgroundColor);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || fontWeight >= 700));
      const minContrast = isLargeText ? 3 : 4.5;
      
      if (contrast < minContrast) {
        this.issues.push({
          type: 'color-contrast',
          element: element.tagName.toLowerCase(),
          text: element.textContent.substring(0, 50),
          contrast: contrast.toFixed(2),
          required: minContrast,
          severity: 'high',
          wcag: '1.4.3'
        });
      } else {
        this.successes.push({
          type: 'color-contrast',
          element: element.tagName.toLowerCase(),
          contrast: contrast.toFixed(2)
        });
      }
    });
  }

  // Calculate contrast ratio between two colors
  calculateContrastRatio(color1, color2) {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // Return max contrast if unable to parse
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Parse color string to RGB values
  parseColor(colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    return {
      r: imageData.data[0],
      g: imageData.data[1],
      b: imageData.data[2]
    };
  }

  // Calculate luminance
  getLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Check keyboard navigation
  checkKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.warnings.push({
          type: 'keyboard-navigation',
          element: element.tagName.toLowerCase(),
          issue: 'Positive tabindex found (avoid unless necessary)',
          severity: 'medium',
          wcag: '2.4.3'
        });
      }

      // Check if focusable elements have visible focus indicators
      const styles = window.getComputedStyle(element, ':focus');
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      if (outline === 'none' && boxShadow === 'none') {
        this.issues.push({
          type: 'keyboard-navigation',
          element: element.tagName.toLowerCase(),
          issue: 'No visible focus indicator',
          severity: 'high',
          wcag: '2.4.7'
        });
      }
    });
  }

  // Check ARIA labels and roles
  checkARIALabels() {
    // Check buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const hasText = button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledby = button.getAttribute('aria-labelledby');
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
        this.issues.push({
          type: 'aria-labels',
          element: 'button',
          issue: 'Button without accessible name',
          severity: 'high',
          wcag: '4.1.2'
        });
      }
    });

    // Check images without alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const ariaLabel = img.getAttribute('aria-label');
      const role = img.getAttribute('role');
      
      if (alt === null && !ariaLabel && role !== 'presentation') {
        this.issues.push({
          type: 'aria-labels',
          element: 'img',
          issue: 'Image without alt text',
          severity: 'high',
          wcag: '1.1.1'
        });
      }
    });

    // Check form controls
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledby) {
        this.issues.push({
          type: 'aria-labels',
          element: input.tagName.toLowerCase(),
          issue: 'Form control without label',
          severity: 'high',
          wcag: '3.3.2'
        });
      }
    });
  }

  // Check heading structure
  checkHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    // Check for H1
    if (!headings.length || headingLevels[0] !== 1) {
      this.issues.push({
        type: 'heading-structure',
        issue: 'Missing or incorrect H1',
        severity: 'medium',
        wcag: '1.3.1'
      });
    }

    // Check for skipped heading levels
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      
      if (current > previous + 1) {
        this.warnings.push({
          type: 'heading-structure',
          issue: `Heading level skipped from H${previous} to H${current}`,
          severity: 'medium',
          wcag: '1.3.1'
        });
      }
    }
  }

  // Check form labels
  checkFormLabels() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        const type = input.type;
        
        // Skip hidden and submit inputs
        if (type === 'hidden' || type === 'submit' || type === 'button') {
          return;
        }
        
        const hasLabel = !!document.querySelector(`label[for="${input.id}"]`);
        const hasAriaLabel = !!input.getAttribute('aria-label');
        const hasPlaceholder = !!input.getAttribute('placeholder');
        
        if (!hasLabel && !hasAriaLabel) {
          this.issues.push({
            type: 'form-labels',
            element: input.tagName.toLowerCase(),
            issue: 'Form input without proper label',
            severity: 'high',
            wcag: '3.3.2'
          });
        }
        
        if (hasPlaceholder && !hasLabel && !hasAriaLabel) {
          this.warnings.push({
            type: 'form-labels',
            element: input.tagName.toLowerCase(),
            issue: 'Placeholder used as label (not accessible)',
            severity: 'medium',
            wcag: '3.3.2'
          });
        }
      });
    });
  }

  // Check image alt text
  checkImageAltText() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');
      
      if (alt === null) {
        this.issues.push({
          type: 'image-alt',
          element: 'img',
          src: src?.substring(0, 50),
          issue: 'Missing alt attribute',
          severity: 'high',
          wcag: '1.1.1'
        });
      } else if (alt === '') {
        // Empty alt is OK for decorative images
        this.successes.push({
          type: 'image-alt',
          element: 'img',
          issue: 'Decorative image properly marked'
        });
      } else if (alt.length > 125) {
        this.warnings.push({
          type: 'image-alt',
          element: 'img',
          issue: 'Alt text too long (>125 characters)',
          severity: 'low',
          wcag: '1.1.1'
        });
      }
    });
  }

  // Check link descriptions
  checkLinkDescriptions() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');
      const title = link.getAttribute('title');
      
      if (!text && !ariaLabel && !title) {
        this.issues.push({
          type: 'link-descriptions',
          element: 'a',
          href: link.getAttribute('href')?.substring(0, 50),
          issue: 'Link without accessible text',
          severity: 'high',
          wcag: '2.4.4'
        });
      }
      
      // Check for generic link text
      const genericText = ['click here', 'read more', 'more', 'here', 'link'];
      if (genericText.includes(text.toLowerCase())) {
        this.warnings.push({
          type: 'link-descriptions',
          element: 'a',
          text: text,
          issue: 'Generic link text (not descriptive)',
          severity: 'medium',
          wcag: '2.4.4'
        });
      }
    });
  }

  // Check focus management
  checkFocusManagement() {
    // Check if there are any elements with positive tabindex
    const positiveTabindex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
    
    positiveTabindex.forEach(element => {
      const tabindex = parseInt(element.getAttribute('tabindex'));
      if (tabindex > 0) {
        this.warnings.push({
          type: 'focus-management',
          element: element.tagName.toLowerCase(),
          tabindex: tabindex,
          issue: 'Positive tabindex can disrupt tab order',
          severity: 'medium',
          wcag: '2.4.3'
        });
      }
    });
  }

  // Check semantic HTML
  checkSemanticHTML() {
    // Check for proper landmark usage
    const main = document.querySelectorAll('main');
    const nav = document.querySelectorAll('nav');
    const header = document.querySelectorAll('header');
    const footer = document.querySelectorAll('footer');
    
    if (main.length === 0) {
      this.warnings.push({
        type: 'semantic-html',
        issue: 'Missing main landmark',
        severity: 'medium',
        wcag: '1.3.1'
      });
    }
    
    if (main.length > 1) {
      this.warnings.push({
        type: 'semantic-html',
        issue: 'Multiple main landmarks (should be unique)',
        severity: 'medium',
        wcag: '1.3.1'
      });
    }

    // Check for proper list usage
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const listItems = list.querySelectorAll('li');
      if (listItems.length === 0) {
        this.warnings.push({
          type: 'semantic-html',
          element: list.tagName.toLowerCase(),
          issue: 'Empty list element',
          severity: 'low',
          wcag: '1.3.1'
        });
      }
    });
  }

  // Check screen reader support
  checkScreenReaderSupport() {
    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipToMain = Array.from(skipLinks).some(link => 
      link.textContent.toLowerCase().includes('skip') && 
      link.textContent.toLowerCase().includes('main')
    );
    
    if (!hasSkipToMain) {
      this.warnings.push({
        type: 'screen-reader',
        issue: 'Missing skip to main content link',
        severity: 'medium',
        wcag: '2.4.1'
      });
    }

    // Check for proper ARIA live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    this.successes.push({
      type: 'screen-reader',
      count: liveRegions.length,
      issue: `${liveRegions.length} ARIA live regions found`
    });
  }

  // Generate accessibility report
  generateReport() {
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;
    const totalSuccesses = this.successes.length;
    
    const score = Math.max(0, 100 - (totalIssues * 10) - (totalWarnings * 3));
    
    return {
      score,
      level: this.getAccessibilityLevel(score),
      summary: {
        issues: totalIssues,
        warnings: totalWarnings,
        successes: totalSuccesses,
      },
      details: {
        issues: this.issues,
        warnings: this.warnings,
        successes: this.successes,
      },
      recommendations: this.generateRecommendations(),
    };
  }

  // Get accessibility level based on score
  getAccessibilityLevel(score) {
    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    if (score >= 70) return 'A';
    return 'Below Standards';
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];
    
    const issueTypes = [...new Set(this.issues.map(issue => issue.type))];
    
    issueTypes.forEach(type => {
      switch (type) {
        case 'color-contrast':
          recommendations.push('Improve color contrast to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)');
          break;
        case 'keyboard-navigation':
          recommendations.push('Ensure all interactive elements are keyboard accessible with visible focus indicators');
          break;
        case 'aria-labels':
          recommendations.push('Add proper ARIA labels and descriptions to improve screen reader support');
          break;
        case 'heading-structure':
          recommendations.push('Use proper heading hierarchy (H1-H6) to create logical document structure');
          break;
        case 'form-labels':
          recommendations.push('Associate all form controls with proper labels');
          break;
        case 'image-alt':
          recommendations.push('Add descriptive alt text to all informative images');
          break;
        case 'link-descriptions':
          recommendations.push('Use descriptive link text that makes sense out of context');
          break;
      }
    });
    
    return recommendations;
  }
}

// Global accessibility auditor
export const accessibilityAuditor = new AccessibilityAuditor();

/**
 * Accessibility testing utilities
 */

// Run quick accessibility check
export const quickA11yCheck = async () => {
  const report = await accessibilityAuditor.runAudit();
  
  if (process.env.NODE_ENV === 'development') {
    console.group('♿ Accessibility Report');
    console.log(`Score: ${report.score}/100 (${report.level})`);
    console.log(`Issues: ${report.summary.issues}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Successes: ${report.summary.successes}`);
    
    if (report.details.issues.length > 0) {
      console.group('🚨 Issues');
      console.table(report.details.issues);
      console.groupEnd();
    }
    
    if (report.details.warnings.length > 0) {
      console.group('⚠️ Warnings');
      console.table(report.details.warnings);
      console.groupEnd();
    }
    
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
    
    console.groupEnd();
  }
  
  return report;
};

// Keyboard navigation tester
export const testKeyboardNavigation = () => {
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  console.log(`Found ${focusableElements.length} focusable elements`);
  
  // Test tab order
  const tabOrder = Array.from(focusableElements).map((el, index) => ({
    index,
    element: el.tagName.toLowerCase(),
    tabIndex: el.tabIndex,
    id: el.id,
    class: el.className,
  }));
  
  console.table(tabOrder);
  return tabOrder;
};

// Screen reader announcement tester
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus trap utility
export const createFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Handle escape key to close modals, etc.
      element.dispatchEvent(new CustomEvent('focustrap-escape'));
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// ARIA live region utility
export const createLiveRegion = (type = 'polite') => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', type);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = `live-region-${Date.now()}`;
  
  document.body.appendChild(liveRegion);
  
  return {
    announce: (message) => {
      liveRegion.textContent = message;
    },
    destroy: () => {
      document.body.removeChild(liveRegion);
    },
  };
};
