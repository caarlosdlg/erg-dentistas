import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(({
  variant = 'default',
  size = 'md',
  rows = 4,
  resize = 'vertical',
  error = false,
  disabled = false,
  placeholder,
  label,
  helperText,
  errorMessage,
  className,
  ...props
}, ref) => {
  const baseClasses = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 border rounded-lg';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500/20',
    filled: 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-primary-500/20 focus:bg-white',
    outlined: 'border-2 border-gray-300 bg-transparent focus:border-primary-500 focus:ring-primary-500/20'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const errorClasses = error 
    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
    : '';

  const disabledClasses = disabled 
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
    : '';

  const textareaClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    resizeClasses[resize],
    error && errorClasses,
    disabled && disabledClasses,
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={textareaClasses}
        {...props}
      />
      
      {(helperText || errorMessage) && (
        <p className={clsx(
          'mt-2 text-sm',
          error ? 'text-red-600' : 'text-gray-600'
        )}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
