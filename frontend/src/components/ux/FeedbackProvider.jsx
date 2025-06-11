import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Feedback Context for managing user feedback and notifications
 * Provides toast notifications, loading states, and confirmation dialogs
 */
const FeedbackContext = createContext({});

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const Icon = icons[toast.type];
  
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800', 
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  useEffect(() => {
    if (toast.autoHide !== false) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.autoHide, toast.duration, onRemove]);

  return (
    <div
      className={`
        max-w-sm w-full ${bgColors[toast.type]} border rounded-lg pointer-events-auto 
        ring-1 ring-black ring-opacity-5 overflow-hidden shadow-lg transform transition-all 
        duration-300 ease-in-out translate-y-0 opacity-100
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColors[toast.type]}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {toast.title && (
              <p className={`text-sm font-medium ${textColors[toast.type]}`}>
                {toast.title}
              </p>
            )}
            <p className={`text-sm ${textColors[toast.type]} ${toast.title ? 'mt-1' : ''}`}>
              {toast.message}
            </p>
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    toast.action.handler();
                    onRemove(toast.id);
                  }}
                  className={`
                    text-sm bg-white px-3 py-2 rounded-md font-medium 
                    ${textColors[toast.type]} hover:bg-gray-50 focus:outline-none 
                    focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  `}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                bg-white rounded-md inline-flex ${textColors[toast.type]} 
                hover:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500
              `}
              onClick={() => onRemove(toast.id)}
              aria-label="Cerrar notificación"
            >
              <span className="sr-only">Cerrar</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingOverlay = ({ message, progress }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="loading-title"
  >
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <h3 id="loading-title" className="text-lg font-medium text-gray-900 mb-2">
        Procesando...
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}
    </div>
  </div>
);

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(null);

  const showToast = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration,
      autoHide: options.autoHide,
      action: options.action,
    };
    
    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showLoading = (message = 'Cargando...', options = {}) => {
    setLoading({
      message,
      progress: options.progress,
    });
  };

  const hideLoading = () => {
    setLoading(null);
  };

  const showSuccess = (message, options) => 
    showToast('success', message, options);
  
  const showError = (message, options) => 
    showToast('error', message, options);
  
  const showWarning = (message, options) => 
    showToast('warning', message, options);
  
  const showInfo = (message, options) => 
    showToast('info', message, options);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    showLoading,
    hideLoading,
    toasts,
    loading,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && <LoadingOverlay {...loading} />}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;
