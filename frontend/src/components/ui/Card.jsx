import React from 'react';
import { clsx } from 'clsx';

/**
 * Enhanced Responsive Card component using Tailwind CSS
 * Componente de tarjeta responsiva mejorada para el sistema de diseño DentalERP
 */
const Card = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      responsiveSize,
      interactive = false,
      className,
      header,
      footer,
      mobileOptimized = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'card-base';
    
    const variantClasses = {
      default: 'card-default',
      elevated: 'card-elevated',
      outlined: 'card-outlined',
      filled: 'card-filled',
      gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100',
    };

    const sizeClasses = {
      sm: 'p-4 rounded-md',
      md: 'p-6 rounded-lg', 
      lg: 'p-8 rounded-xl',
      xl: 'p-10 rounded-2xl',
    };

    // Responsive size configuration
    const getResponsiveSize = () => {
      if (!responsiveSize) return sizeClasses[size];

      const classes = [];
      
      // Default size
      if (responsiveSize.default || size) {
        classes.push(sizeClasses[responsiveSize.default || size]);
      }
      
      // Responsive breakpoints
      if (responsiveSize.sm) classes.push(`sm:p-4 sm:rounded-md`);
      if (responsiveSize.md) classes.push(`md:p-6 md:rounded-lg`);
      if (responsiveSize.lg) classes.push(`lg:p-8 lg:rounded-xl`);
      if (responsiveSize.xl) classes.push(`xl:p-10 xl:rounded-2xl`);

      return classes.join(' ');
    };

    // Mobile optimization classes
    const mobileClasses = mobileOptimized ? 'touch-manipulation' : '';

    const interactiveClasses = interactive ? 
      'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : '';

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          responsiveSize ? getResponsiveSize() : sizeClasses[size],
          interactiveClasses,
          mobileClasses,
          className
        )}
        {...props}
      >
        {header && (
          <div className="card-header mb-4 pb-4 border-b border-neutral-200">
            {header}
          </div>
        )}
        
        <div className="card-content">
          {children}
        </div>
        
        {footer && (
          <div className="card-footer mt-4 pt-4 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
