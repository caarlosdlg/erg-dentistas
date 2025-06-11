import React, { memo, useCallback, useMemo, forwardRef } from 'react';
import { clsx } from 'clsx';
import { useStableCallback } from '../../hooks/usePerformance';
import { useFeedback, useAccessibility } from '../ux';

/**
 * Enhanced Form Input with accessibility and performance optimizations
 */
const FormInput = memo(forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  onChange,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const { announce } = useAccessibility();
  const { showError } = useFeedback();

  // Generate unique IDs for accessibility
  const inputId = useMemo(() => 
    props.id || `input-${Math.random().toString(36).substr(2, 9)}`, 
    [props.id]
  );
  
  const errorId = useMemo(() => `${inputId}-error`, [inputId]);
  const helperId = useMemo(() => `${inputId}-helper`, [inputId]);

  // Stable event handlers
  const handleFocus = useStableCallback((e) => {
    onFocus?.(e);
    if (helperText) {
      announce(helperText);
    }
  }, [onFocus, helperText, announce]);

  const handleBlur = useStableCallback((e) => {
    onBlur?.(e);
    if (error) {
      announce(`Error: ${error}`, 'assertive');
    }
  }, [onBlur, error, announce]);

  const handleChange = useStableCallback((e) => {
    onChange?.(e);
    // Clear previous errors when user starts typing
    if (error && e.target.value) {
      // Could trigger error clearing in parent component
    }
  }, [onChange, error]);

  // Memoized class calculations
  const inputClasses = useMemo(() => {
    return clsx(
      // Base styles
      'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset',
      'placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
      'transition-colors duration-200',
      
      // State styles
      {
        'ring-gray-300 focus:ring-primary-600': !error && !disabled,
        'ring-red-300 focus:ring-red-500 text-red-900': error && !disabled,
        'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed': disabled,
        'pr-10': rightIcon || loading,
        'pl-10': leftIcon,
      },
      
      className
    );
  }, [error, disabled, rightIcon, leftIcon, loading, className]);

  const labelClasses = useMemo(() => {
    return clsx(
      'block text-sm font-medium leading-6',
      {
        'text-gray-900': !error,
        'text-red-600': error,
      },
      labelClassName
    );
  }, [error, labelClassName]);

  // Build aria-describedby
  const describedBy = useMemo(() => {
    const ids = [];
    if (error) ids.push(errorId);
    if (helperText) ids.push(helperId);
    if (ariaDescribedBy) ids.push(ariaDescribedBy);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [error, helperText, ariaDescribedBy, errorId, helperId]);

  return (
    <div className={clsx('space-y-1', containerClassName)}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-sm">
              {leftIcon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled || loading}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />

        {/* Right Icon or Loading */}
        {(rightIcon || loading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
            ) : (
              <span className="text-gray-400 sm:text-sm">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p id={helperId} className={clsx('text-sm text-gray-600', helperClassName)}>
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className={clsx('text-sm text-red-600', errorClassName)}
        >
          {error}
        </p>
      )}
    </div>
  );
}));

FormInput.displayName = 'FormInput';

/**
 * Enhanced Textarea component
 */
const Textarea = memo(forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  resize = 'vertical',
  className = '',
  containerClassName = '',
  maxLength,
  showCharCount = false,
  ...props
}, ref) => {
  const { announce } = useAccessibility();
  const [charCount, setCharCount] = React.useState(props.defaultValue?.length || 0);

  const textareaId = useMemo(() => 
    props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`, 
    [props.id]
  );

  const handleChange = useStableCallback((e) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
    
    if (maxLength && e.target.value.length > maxLength * 0.9) {
      const remaining = maxLength - e.target.value.length;
      announce(`${remaining} caracteres restantes`);
    }
  }, [props.onChange, maxLength, announce]);

  const textareaClasses = useMemo(() => {
    return clsx(
      'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset',
      'placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
      'transition-colors duration-200',
      {
        'ring-gray-300 focus:ring-primary-600': !error && !disabled,
        'ring-red-300 focus:ring-red-500': error && !disabled,
        'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed': disabled,
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both',
      },
      className
    );
  }, [error, disabled, resize, className]);

  return (
    <div className={clsx('space-y-1', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        className={textareaClasses}
        onChange={handleChange}
        {...props}
      />

      <div className="flex justify-between items-center">
        <div>
          {helperText && !error && (
            <p className="text-sm text-gray-600">{helperText}</p>
          )}
          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}
        </div>
        
        {(showCharCount || maxLength) && (
          <p className="text-sm text-gray-500">
            {charCount}{maxLength && `/${maxLength}`}
          </p>
        )}
      </div>
    </div>
  );
}));

Textarea.displayName = 'Textarea';

/**
 * Enhanced Select component
 */
const Select = memo(forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...',
  options = [],
  loading = false,
  searchable = false,
  className = '',
  containerClassName = '',
  children,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { announce } = useAccessibility();

  const selectId = useMemo(() => 
    props.id || `select-${Math.random().toString(36).substr(2, 9)}`, 
    [props.id]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const handleToggle = useStableCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      announce(`Lista desplegable abierta, ${options.length} opciones disponibles`);
    }
  }, [isOpen, options.length, announce]);

  const selectClasses = useMemo(() => {
    return clsx(
      'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900',
      'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600',
      'sm:text-sm sm:leading-6 transition-colors duration-200',
      {
        'bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
        'ring-red-300 focus:ring-red-500': error && !disabled,
      },
      className
    );
  }, [disabled, error, className]);

  if (searchable) {
    // Custom searchable select implementation would go here
    // For brevity, returning basic select
  }

  return (
    <div className={clsx('space-y-1', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled || loading}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {children || options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}));

Select.displayName = 'Select';

export { FormInput, Textarea, Select };
export default FormInput;
