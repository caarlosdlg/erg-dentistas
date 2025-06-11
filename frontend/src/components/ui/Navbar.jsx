import React, { useState } from 'react';
import { clsx } from 'clsx';

/**
 * Navigation component using Tailwind CSS
 * Componente de navegación mejorado para DentalERP
 */
const Navbar = React.forwardRef(
  (
    {
      brand,
      children,
      variant = 'default',
      position = 'static',
      className,
      ...props
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const variantClasses = {
      default: 'bg-white border-b border-neutral-200 shadow-sm',
      primary: 'bg-primary-500 text-white',
      secondary: 'bg-secondary-500 text-white',
      transparent: 'bg-transparent',
      dark: 'bg-neutral-900 text-white',
    };

    const positionClasses = {
      static: 'relative',
      fixed: 'fixed top-0 left-0 right-0 z-50',
      sticky: 'sticky top-0 z-50',
    };

    return (
      <nav
        ref={ref}
        className={clsx(
          'transition-all duration-200',
          variantClasses[variant],
          positionClasses[position],
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            {brand && (
              <div className="flex-shrink-0">
                {brand}
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {children}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
              {children}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';

/**
 * Navigation Link component
 */
const NavLink = React.forwardRef(
  (
    {
      children,
      href,
      active = false,
      disabled = false,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';
    
    const variantClasses = {
      default: active
        ? 'bg-primary-100 text-primary-700'
        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
      primary: active
        ? 'bg-white bg-opacity-20 text-white'
        : 'text-white text-opacity-75 hover:bg-white hover:bg-opacity-10 hover:text-opacity-100',
      secondary: active
        ? 'bg-white bg-opacity-20 text-white'
        : 'text-white text-opacity-75 hover:bg-white hover:bg-opacity-10 hover:text-opacity-100',
    };

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    const Component = href ? 'a' : 'button';

    return (
      <Component
        ref={ref}
        href={href}
        disabled={disabled}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          disabledClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NavLink.displayName = 'NavLink';

/**
 * Navigation Dropdown component
 */
const NavDropdown = React.forwardRef(
  (
    {
      trigger,
      children,
      position = 'bottom-start',
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
      'bottom-start': 'top-full left-0',
      'bottom-end': 'top-full right-0',
      'top-start': 'bottom-full left-0',
      'top-end': 'bottom-full right-0',
    };

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors duration-200"
          {...props}
        >
          {trigger}
          <svg
            className={clsx(
              'ml-1 h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div
              className={clsx(
                'absolute z-50 mt-1 min-w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5',
                positionClasses[position],
                className
              )}
            >
              <div className="py-1">
                {children}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

NavDropdown.displayName = 'NavDropdown';

/**
 * Navigation Dropdown Item component
 */
const NavDropdownItem = React.forwardRef(
  (
    {
      children,
      href,
      onClick,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-200';
    
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    const Component = href ? 'a' : 'button';

    return (
      <Component
        ref={ref}
        href={href}
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          baseClasses,
          disabledClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NavDropdownItem.displayName = 'NavDropdownItem';

// Assign sub-components
Navbar.Link = NavLink;
Navbar.Dropdown = NavDropdown;
Navbar.DropdownItem = NavDropdownItem;

export { Navbar, NavLink, NavDropdown, NavDropdownItem };
export default Navbar;
