import React from 'react';
import { clsx } from 'clsx';
import { ResponsiveGrid, ResponsiveFlex, Button } from './index';

/**
 * Responsive Form Component
 * Provides adaptive form layouts with mobile-first design
 */
const ResponsiveForm = React.forwardRef(
  (
    {
      children,
      onSubmit,
      variant = 'default',
      layout = 'vertical',
      spacing = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: '',
      card: 'bg-white p-6 rounded-lg shadow-sm border border-gray-200',
      elevated: 'bg-white p-6 sm:p-8 rounded-xl shadow-lg',
      minimal: 'bg-transparent',
    };

    const spacingClasses = {
      none: 'space-y-0',
      sm: 'space-y-3',
      default: 'space-y-4 sm:space-y-6',
      lg: 'space-y-6 sm:space-y-8',
    };

    const layoutClasses = {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-col sm:flex-row sm:items-end sm:space-x-4',
      grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    };

    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={clsx(
          variantClasses[variant],
          layoutClasses[layout],
          layout !== 'grid' && spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

ResponsiveForm.displayName = 'ResponsiveForm';

/**
 * Form Field Component with responsive behavior
 */
const FormField = React.forwardRef(
  (
    {
      children,
      label,
      error,
      hint,
      required = false,
      colSpan,
      className,
      ...props
    },
    ref
  ) => {
    const getColSpan = () => {
      if (!colSpan) return '';
      
      if (typeof colSpan === 'number') {
        return `col-span-${colSpan}`;
      }

      const classes = [];
      if (colSpan.default) classes.push(`col-span-${colSpan.default}`);
      if (colSpan.sm) classes.push(`sm:col-span-${colSpan.sm}`);
      if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`);
      if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`);

      return classes.join(' ');
    };

    return (
      <div ref={ref} className={clsx('form-field', getColSpan(), className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="form-field-input">
          {children}
        </div>
        
        {hint && !error && (
          <p className="mt-2 text-sm text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/**
 * Responsive Input Component
 */
const ResponsiveInput = React.forwardRef(
  (
    {
      type = 'text',
      size = 'default',
      variant = 'default',
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      default: 'px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
      lg: 'px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
      success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
      warning: 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500',
    };

    return (
      <input
        ref={ref}
        type={type}
        className={clsx(
          'block rounded-md border shadow-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'touch-manipulation',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

/**
 * Responsive Textarea Component
 */
const ResponsiveTextarea = React.forwardRef(
  (
    {
      rows = 4,
      size = 'default',
      variant = 'default',
      fullWidth = true,
      autoResize = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      default: 'px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
      lg: 'px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
      success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
      warning: 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500',
    };

    return (
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'block rounded-md border shadow-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'touch-manipulation',
          !autoResize && 'resize-none',
          autoResize && 'resize-y',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

/**
 * Responsive Select Component
 */
const ResponsiveSelect = React.forwardRef(
  (
    {
      options = [],
      placeholder = 'Select an option',
      size = 'default',
      variant = 'default',
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      default: 'px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
      lg: 'px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
      success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
      warning: 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500',
    };

    return (
      <select
        ref={ref}
        className={clsx(
          'block rounded-md border shadow-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'touch-manipulation',
          'bg-white',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

ResponsiveSelect.displayName = 'ResponsiveSelect';

/**
 * Form Action Buttons with responsive layout
 */
const FormActions = React.forwardRef(
  (
    {
      children,
      align = 'right',
      direction = 'horizontal-mobile-stack',
      spacing = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    const getDirection = () => {
      switch (direction) {
        case 'horizontal':
          return 'flex-row';
        case 'vertical':
          return 'flex-col';
        case 'horizontal-mobile-stack':
          return 'flex-col sm:flex-row';
        case 'vertical-mobile-horizontal':
          return 'flex-row sm:flex-col';
        default:
          return 'flex-col sm:flex-row';
      }
    };

    const spacingClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      default: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'flex',
          getDirection(),
          alignClasses[align],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';

/**
 * Responsive Form Grid for complex layouts
 */
const FormGrid = React.forwardRef(
  (
    {
      children,
      cols = { default: 1, sm: 2 },
      gap = 'default',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <ResponsiveGrid
        ref={ref}
        cols={cols}
        gap={gap}
        className={className}
        {...props}
      >
        {children}
      </ResponsiveGrid>
    );
  }
);

FormGrid.displayName = 'FormGrid';

export {
  ResponsiveForm,
  FormField,
  ResponsiveInput,
  ResponsiveTextarea,
  ResponsiveSelect,
  FormActions,
  FormGrid,
};

export default ResponsiveForm;
