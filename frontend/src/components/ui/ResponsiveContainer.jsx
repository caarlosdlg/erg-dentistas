import React from 'react';
import { clsx } from 'clsx';

/**
 * Responsive Container Component
 * Provides responsive layout containers with padding and max-width constraints
 */
const ResponsiveContainer = React.forwardRef(
  (
    {
      children,
      size = 'default',
      padding = 'default',
      className,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'max-w-xs',      // 320px
      sm: 'max-w-sm',      // 384px
      md: 'max-w-md',      // 448px
      lg: 'max-w-lg',      // 512px
      xl: 'max-w-xl',      // 576px
      '2xl': 'max-w-2xl',  // 672px
      '3xl': 'max-w-3xl',  // 768px
      '4xl': 'max-w-4xl',  // 896px
      '5xl': 'max-w-5xl',  // 1024px
      '6xl': 'max-w-6xl',  // 1152px
      '7xl': 'max-w-7xl',  // 1280px
      full: 'max-w-full',
      none: '',
      default: 'max-w-7xl', // Default to 7xl
    };

    const paddingClasses = {
      none: '',
      xs: 'px-2 sm:px-4',
      sm: 'px-4 sm:px-6',
      default: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16',
    };

    return (
      <Component
        ref={ref}
        className={clsx(
          'mx-auto',
          sizeClasses[size],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

export default ResponsiveContainer;
