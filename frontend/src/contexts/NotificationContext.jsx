import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button } from '../components/ui';

/**
 * Notification Context for managing app-wide notifications
 */
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification types and their default configurations
 */
const NOTIFICATION_TYPES = {
  success: {
    icon: '✅',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    duration: 5000
  },
  error: {
    icon: '❌',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    duration: 7000
  },
  warning: {
    icon: '⚠️',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    duration: 6000
  },
  info: {
    icon: 'ℹ️',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    duration: 5000
  }
};

/**
 * Individual Notification Component
 */
const NotificationItem = ({ notification, onClose }) => {
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  
  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg p-4 shadow-md transition-all duration-300 ease-in-out
        transform translate-x-0 opacity-100
      `}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="flex items-start">
        <div className={`${config.iconColor} mr-3 mt-0.5`}>
          <span className="text-lg">{config.icon}</span>
        </div>
        
        <div className="flex-1">
          {notification.title && (
            <h4 className="font-semibold mb-1">{notification.title}</h4>
          )}
          <p className="text-sm">{notification.message}</p>
          
          {notification.actions && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => {
                    action.onClick();
                    if (action.closeOnClick !== false) {
                      onClose();
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 ml-2`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Notification Container Component
 */
const NotificationContainer = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Notification Provider Component
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
    
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (notification.persistent !== true) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || config.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  // API operation notifications
  const notifySuccess = useCallback((operation, entity = '') => {
    const messages = {
      create: `${entity} creado exitosamente`,
      update: `${entity} actualizado exitosamente`,
      delete: `${entity} eliminado exitosamente`,
      save: `${entity} guardado exitosamente`,
      upload: `${entity} subido exitosamente`,
      import: `${entity} importado exitosamente`,
      export: `${entity} exportado exitosamente`
    };
    
    showSuccess(messages[operation] || `${operation} completado exitosamente`);
  }, [showSuccess]);

  const notifyError = useCallback((operation, entity = '', error = null) => {
    const messages = {
      create: `Error al crear ${entity}`,
      update: `Error al actualizar ${entity}`,
      delete: `Error al eliminar ${entity}`,
      save: `Error al guardar ${entity}`,
      upload: `Error al subir ${entity}`,
      import: `Error al importar ${entity}`,
      export: `Error al exportar ${entity}`,
      load: `Error al cargar ${entity}`,
      fetch: `Error al obtener ${entity}`
    };
    
    let message = messages[operation] || `Error en ${operation}`;
    
    if (error && error.message) {
      message += `: ${error.message}`;
    }
    
    showError(message, {
      actions: error && error.retry ? [
        {
          label: 'Reintentar',
          onClick: error.retry,
          variant: 'primary'
        }
      ] : undefined
    });
  }, [showError]);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySuccess,
    notifyError
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

/**
 * HOC for components that need notification functionality
 */
export const withNotifications = (Component) => {
  return function WrappedComponent(props) {
    const notifications = useNotifications();
    return <Component {...props} notifications={notifications} />;
  };
};

export default NotificationProvider;
