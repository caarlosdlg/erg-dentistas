import React from 'react';
import { clsx } from 'clsx';

/**
 * Container component using Tailwind CSS
 * Componente contenedor responsivo para DentalERP
 */
const Container = React.forwardRef(
  (
    {
      children,
      size = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      default: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'container mx-auto px-4 sm:px-6 lg:px-8',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
