import React, { memo, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Loading';
import { useStableCallback } from '../../hooks/usePerformance';

/**
 * Optimized Button component using Tailwind CSS with performance enhancements
 * Componente de botón optimizado para el sistema de diseño DentalERP
 */
const Button = memo(React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      onClick,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Memoize class calculations for better performance
    const buttonClasses = useMemo(() => {
      const baseClasses = 'btn-base inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
      
      const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-500',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500',
        outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border border-transparent focus:ring-yellow-500',
      };

      const sizeClasses = {
        xs: 'px-2.5 py-1.5 text-xs min-h-[28px]',
        sm: 'px-3 py-2 text-sm min-h-[32px]',
        md: 'px-4 py-2 text-sm min-h-[36px]',
        lg: 'px-4 py-2 text-base min-h-[40px]',
        xl: 'px-6 py-3 text-base min-h-[44px]',
      };

      const stateClasses = [
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        loading && 'cursor-wait',
        fullWidth && 'w-full',
      ].filter(Boolean);

      return clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        ...stateClasses,
        className
      );
    }, [variant, size, disabled, loading, fullWidth, className]);

    // Optimize click handler with useCallback
    const handleClick = useStableCallback((e) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    }, [disabled, loading, onClick]);

    // Memoize icon components
    const leftIconElement = useMemo(() => {
      if (loading) {
        return <Spinner size="sm" className="text-current" />;
      }
      return leftIcon;
    }, [loading, leftIcon]);

    const rightIconElement = useMemo(() => {
      return !loading ? rightIcon : null;
    }, [loading, rightIcon]);

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={buttonClasses}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {leftIconElement && (
          <span className="inline-flex items-center mr-2 -ml-0.5">
            {leftIconElement}
          </span>
        )}
        
        <span className={clsx(
          "inline-flex items-center",
          loading && 'opacity-75'
        )}>
          {children}
        </span>
        
        {rightIconElement && (
          <span className="inline-flex items-center ml-2 -mr-0.5">
            {rightIconElement}
          </span>
        )}
      </button>
    );
  }
));

Button.displayName = 'Button';

// Performance-optimized IconButton component
export const IconButton = memo(React.forwardRef(
  ({ icon, 'aria-label': ariaLabel, size = 'md', className, ...props }, ref) => {
    const iconSizeClasses = useMemo(() => ({
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }), []);

    const iconElement = useMemo(() => {
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, {
          className: clsx(iconSizeClasses[size], icon.props.className),
        });
      }
      return icon;
    }, [icon, size, iconSizeClasses]);

    return (
      <Button
        ref={ref}
        variant="ghost"
        size={size}
        className={clsx('btn-icon-only', className)}
        aria-label={ariaLabel}
        {...props}
      >
        {iconElement}
      </Button>
    );
  }
));

IconButton.displayName = 'IconButton';

// Performance-optimized ButtonGroup component
export const ButtonGroup = memo(({ 
  children, 
  variant = 'outline',
  size = 'md',
  className,
  ...props 
}) => {
  const enhancedChildren = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return React.cloneElement(child, {
        variant: child.props.variant || variant,
        size: child.props.size || size,
        className: clsx(
          child.props.className,
          'btn-group-item',
          index === 0 && 'btn-group-first',
          index === React.Children.count(children) - 1 && 'btn-group-last'
        ),
      });
    });
  }, [children, variant, size]);

  return (
    <div
      className={clsx('btn-group', className)}
      role="group"
      {...props}
    >
      {enhancedChildren}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default Button;
