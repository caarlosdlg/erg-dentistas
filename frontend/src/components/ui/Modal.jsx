import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

/**
 * Modal component using Tailwind CSS
 * Componente de modal para dialogs y overlays en DentalERP
 */
const Modal = React.forwardRef(
  (
    {
      children,
      isOpen = false,
      onClose,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      title,
      footer,
      className,
      overlayClassName,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape || !isOpen) return;

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    };

    const modalContent = (
      <div 
        className={clsx(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Modal */}
        <div
          ref={ref}
          className={clsx(
            'relative bg-white rounded-lg shadow-xl transform transition-all w-full',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

/**
 * ConfirmDialog component - specific modal for confirmations
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  ...props
}) => {
  const variantClasses = {
    danger: 'btn-danger',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    warning: 'btn-warning',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-base btn-outline"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className={clsx('btn-base', variantClasses[variant])}
          >
            {confirmText}
          </button>
        </>
      }
      {...props}
    >
      {message && (
        <p className="text-neutral-600">
          {message}
        </p>
      )}
    </Modal>
  );
};

export { Modal, ConfirmDialog };
export default Modal;
