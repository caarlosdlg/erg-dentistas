import React from 'react';
import { clsx } from 'clsx';

/**
 * Enhanced Card component using Tailwind CSS
 * Componente de tarjeta mejorado para el sistema de diseño DentalERP
 */
const Card = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      interactive = false,
      className,
      header,
      footer,
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

    const interactiveClasses = interactive ? 
      'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : '';

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          interactiveClasses,
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

// Sub-components for better composition
Card.Header = React.forwardRef(({ children, className, ...props }, ref) => (
  <div 
    ref={ref}
    className={clsx('card-header', className)} 
    {...props}
  >
    {children}
  </div>
));

Card.Content = React.forwardRef(({ children, className, ...props }, ref) => (
  <div 
    ref={ref}
    className={clsx('card-content', className)} 
    {...props}
  >
    {children}
  </div>
));

Card.Footer = React.forwardRef(({ children, className, ...props }, ref) => (
  <div 
    ref={ref}
    className={clsx('card-footer', className)} 
    {...props}
  >
    {children}
  </div>
));

Card.Header.displayName = 'Card.Header';
Card.Content.displayName = 'Card.Content';
Card.Footer.displayName = 'Card.Footer';

export default Card;
