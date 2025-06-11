import React from 'react';
import { clsx } from 'clsx';

/**
 * Alert component - Componente de alerta reutilizable
 * Para mostrar mensajes importantes, notificaciones y feedback
 */
const Alert = React.forwardRef(
  (
    {
      children,
      variant = 'info',
      size = 'md',
      dismissible = false,
      onDismiss,
      icon: Icon,
      title,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg border p-4 transition-all duration-200';

    const variantClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      primary: 'bg-primary-50 border-primary-200 text-primary-800',
      secondary: 'bg-secondary-50 border-secondary-200 text-secondary-800',
    };

    const sizeClasses = {
      sm: 'p-3 text-sm',
      md: 'p-4 text-base',
      lg: 'p-5 text-lg',
    };

    const iconClasses = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex items-start gap-3">
          {Icon && (
            <Icon className={clsx('flex-shrink-0 w-5 h-5 mt-0.5', iconClasses[variant])} />
          )}
          
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold mb-1">{title}</h4>
            )}
            <div>{children}</div>
          </div>

          {dismissible && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
              aria-label="Cerrar alerta"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
