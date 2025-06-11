import React from 'react';
import { clsx } from 'clsx';

/**
 * Badge component - Componente de etiqueta reutilizable
 * Para mostrar estados, categorías, y información contextual
 */
const Badge = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'badge-base';
    
    const variantClasses = {
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge-info',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
