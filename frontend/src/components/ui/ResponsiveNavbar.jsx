import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

/**
 * Responsive Navigation Component
 * Provides mobile-first navigation with hamburger menu and responsive behavior
 */
const ResponsiveNavbar = React.forwardRef(
  (
    {
      children,
      brand,
      variant = 'primary',
      position = 'static',
      mobileBreakpoint = 'lg',
      className,
      ...props
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const variantClasses = {
      primary: 'bg-primary-600 text-white',
      secondary: 'bg-secondary-600 text-white',
      white: 'bg-white text-gray-900 border-b border-gray-200',
      transparent: 'bg-transparent text-white',
      dark: 'bg-gray-900 text-white',
    };

    const positionClasses = {
      static: 'relative',
      fixed: 'fixed top-0 left-0 right-0 z-50',
      sticky: 'sticky top-0 z-50',
    };

    const breakpointClasses = {
      sm: 'sm:hidden',
      md: 'md:hidden',
      lg: 'lg:hidden',
      xl: 'xl:hidden',
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Close mobile menu on escape key
    useEffect(() => {
      const handleEscape = (event) => {
        if (event.key === 'Escape' && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    return (
      <nav
        ref={ref}
        className={clsx(
          'w-full transition-all duration-200',
          variantClasses[variant],
          positionClasses[position],
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand/Logo */}
            <div className="flex-shrink-0">
              {brand}
            </div>

            {/* Desktop Navigation */}
            <div className={clsx('hidden', `${mobileBreakpoint}:flex`, `${mobileBreakpoint}:items-center`, `${mobileBreakpoint}:space-x-8`)}>
              {children}
            </div>

            {/* Mobile Menu Button */}
            <div className={clsx(`${mobileBreakpoint}:hidden`)}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors touch-manipulation"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <svg
                  className={clsx('h-6 w-6 transition-transform duration-200', {
                    'rotate-90': isMobileMenuOpen,
                  })}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={clsx(
            'mobile-menu-container',
            `${mobileBreakpoint}:hidden`,
            'overflow-hidden transition-all duration-300 ease-in-out',
            {
              'max-h-96 opacity-100': isMobileMenuOpen,
              'max-h-0 opacity-0': !isMobileMenuOpen,
            }
          )}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/20">
            {React.Children.map(children, (child, index) => (
              <div
                key={index}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }
);

ResponsiveNavbar.displayName = 'ResponsiveNavbar';

/**
 * Navigation Link Component
 */
const NavLink = React.forwardRef(
  (
    {
      children,
      href,
      active = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx(
          'transition-colors duration-200 font-medium',
          'hover:text-white/80 lg:hover:text-white/90',
          'focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-2 py-1',
          active && 'text-white font-semibold',
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';

/**
 * Navigation Button Component
 */
const NavButton = React.forwardRef(
  (
    {
      children,
      variant = 'ghost',
      size = 'sm',
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      ghost: 'bg-transparent border border-white/30 hover:bg-white/10 text-white',
      solid: 'bg-white text-gray-900 hover:bg-gray-50',
      outline: 'border border-white text-white hover:bg-white hover:text-gray-900',
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          'touch-manipulation',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NavButton.displayName = 'NavButton';

export { ResponsiveNavbar, NavLink, NavButton };
export default ResponsiveNavbar;
