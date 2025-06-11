import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Accessibility Context for managing global a11y features
 * Provides keyboard navigation, focus management, and screen reader support
 */
const AccessibilityContext = createContext({});

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [focusOutlineEnabled, setFocusOutlineEnabled] = useState(true);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        setFocusOutlineEnabled(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply focus outline styles based on keyboard usage
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .js-focus-visible :focus:not([data-focus-visible-added]) {
        outline: none !important;
        box-shadow: none !important;
      }
      
      .js-focus-visible [data-focus-visible-added] {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
      }
    `;

    if (focusOutlineEnabled) {
      document.head.appendChild(style);
      document.body.classList.add('js-focus-visible');
    }

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      document.body.classList.remove('js-focus-visible');
    };
  }, [focusOutlineEnabled]);

  // Screen reader announcements
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Clean up after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  // Skip to content functionality
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content') || 
                      document.querySelector('main') ||
                      document.querySelector('[role="main"]');
    
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const value = {
    isKeyboardUser,
    announce,
    skipToContent,
    focusOutlineEnabled,
    setFocusOutlineEnabled,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Skip to content link */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToContent();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-primary-600 text-white px-4 py-2 rounded-md z-50 
                   focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Saltar al contenido principal
      </a>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => (
            <div key={a.id}>{a.message}</div>
          ))
        }
      </div>
      
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => (
            <div key={a.id}>{a.message}</div>
          ))
        }
      </div>
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
