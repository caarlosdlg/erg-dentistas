import React from 'react';
import { clsx } from 'clsx';

/**
 * Enhanced Input component using Tailwind CSS
 * Componente de entrada mejorado para formularios DentalERP
 */
const Input = React.forwardRef(
  (
    {
      type = 'text',
      label,
      placeholder,
      helperText,
      error,
      required = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      size = 'md',
      variant = 'default',
      className,
      labelClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'input-base';
    
    const variantClasses = {
      default: 'input-default',
      filled: 'bg-neutral-50 border-neutral-200 focus:bg-white',
      underlined: 'border-0 border-b-2 rounded-none bg-transparent focus:ring-0',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const errorClasses = error ? 
      'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
      'focus:ring-primary-500 focus:border-primary-500';

    const disabledClasses = disabled ? 
      'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '';

    return (
      <div className={clsx('space-y-1', containerClassName)}>
        {label && (
          <label 
            className={clsx(
              'block text-sm font-medium text-neutral-700',
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className={clsx(iconSizeClasses[size], 'text-neutral-400')} />
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              sizeClasses[size],
              errorClasses,
              disabledClasses,
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className={clsx(iconSizeClasses[size], 'text-neutral-400')} />
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p className={clsx(
            'text-sm',
            error ? 'text-red-600' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component
 */
const Textarea = React.forwardRef(
  (
    {
      label,
      placeholder,
      helperText,
      error,
      required = false,
      disabled = false,
      rows = 4,
      resize = 'vertical',
      className,
      labelClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'input-base';
    
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const errorClasses = error ? 
      'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
      'focus:ring-primary-500 focus:border-primary-500';

    const disabledClasses = disabled ? 
      'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '';

    return (
      <div className={clsx('space-y-1', containerClassName)}>
        {label && (
          <label 
            className={clsx(
              'block text-sm font-medium text-neutral-700',
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            baseClasses,
            'px-4 py-2.5 text-sm',
            resizeClasses[resize],
            errorClasses,
            disabledClasses,
            className
          )}
          {...props}
        />
        
        {(helperText || error) && (
          <p className={clsx(
            'text-sm',
            error ? 'text-red-600' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select component
 */
const Select = React.forwardRef(
  (
    {
      label,
      placeholder,
      helperText,
      error,
      required = false,
      disabled = false,
      children,
      size = 'md',
      className,
      labelClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'input-base appearance-none';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    const errorClasses = error ? 
      'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 
      'focus:ring-primary-500 focus:border-primary-500';

    const disabledClasses = disabled ? 
      'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '';

    return (
      <div className={clsx('space-y-1', containerClassName)}>
        {label && (
          <label 
            className={clsx(
              'block text-sm font-medium text-neutral-700',
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={clsx(
              baseClasses,
              sizeClasses[size],
              errorClasses,
              disabledClasses,
              'pr-10 bg-white',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5 text-neutral-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        
        {(helperText || error) && (
          <p className={clsx(
            'text-sm',
            error ? 'text-red-600' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Export all components
export { Input, Textarea, Select };
export default Input;
