import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

/**
 * Enhanced Responsive Modal component
 * Componente de modal responsivo mejorado para el sistema de diseño DentalERP
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  mobileFullScreen = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ...props
}) => {
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Mobile responsive classes
  const mobileClasses = mobileFullScreen 
    ? 'max-h-screen sm:max-h-[90vh] w-full sm:w-auto sm:mx-4 rounded-none sm:rounded-2xl'
    : 'max-h-[90vh] w-full mx-4 rounded-2xl';

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

    const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={clsx(
          'relative bg-white shadow-xl transform transition-all overflow-hidden',
          sizeClasses[size],
          mobileClasses,
          className
        )}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate mr-4">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-80px)] sm:max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal subcomponents with responsive enhancements
Modal.Header = ({ children, className }) => (
  <div className={clsx('p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10', className)}>
    {children}
  </div>
);

Modal.Body = ({ children, className }) => (
  <div className={clsx('p-4 sm:p-6 overflow-y-auto', className)}>
    {children}
  </div>
);

Modal.Footer = ({ children, className }) => (
  <div className={clsx(
    'p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10',
    'rounded-b-none sm:rounded-b-2xl',
    className
  )}>
    {children}
  </div>
);

export default Modal;
