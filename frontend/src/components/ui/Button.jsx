import React from 'react';
import { clsx } from 'clsx';

/**
 * Enhanced Responsive Button component using Tailwind CSS
 * Componente de botón responsivo mejorado para el sistema de diseño DentalERP
 */
const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      responsiveSize,
      loading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      responsiveFullWidth,
      mobileOptimized = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn-base';
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
      warning: 'btn-warning',
      info: 'btn-info',
    };

    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
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
      if (responsiveSize.sm) classes.push(`sm:px-3 sm:py-2 sm:text-sm`);
      if (responsiveSize.md) classes.push(`md:px-4 md:py-2.5 md:text-sm`);
      if (responsiveSize.lg) classes.push(`lg:px-6 lg:py-3 lg:text-base`);
      if (responsiveSize.xl) classes.push(`xl:px-8 xl:py-4 xl:text-lg`);

      return classes.join(' ');
    };

    // Responsive full width configuration
    const getResponsiveFullWidth = () => {
      if (responsiveFullWidth === true) return 'w-full';
      if (responsiveFullWidth === false) return '';
      if (fullWidth) return 'w-full';
      
      if (typeof responsiveFullWidth === 'object') {
        const classes = [];
        
        if (responsiveFullWidth.default) classes.push('w-full');
        if (responsiveFullWidth.sm === false) classes.push('sm:w-auto');
        if (responsiveFullWidth.sm === true) classes.push('sm:w-full');
        if (responsiveFullWidth.md === false) classes.push('md:w-auto');
        if (responsiveFullWidth.md === true) classes.push('md:w-full');
        if (responsiveFullWidth.lg === false) classes.push('lg:w-auto');
        if (responsiveFullWidth.lg === true) classes.push('lg:w-full');
        
        return classes.join(' ');
      }
      
      return '';
    };

    // Mobile optimization classes
    const mobileClasses = mobileOptimized ? 'touch-manipulation min-h-[44px] min-w-[44px]' : '';

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          responsiveSize ? getResponsiveSize() : sizeClasses[size],
          getResponsiveFullWidth(),
          mobileClasses,
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && LeftIcon && (
          <LeftIcon className="w-4 h-4" />
        )}
        
        <span className={loading ? 'opacity-70' : ''}>
          {children}
        </span>
        
        {!loading && RightIcon && (
          <RightIcon className="w-4 h-4" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
