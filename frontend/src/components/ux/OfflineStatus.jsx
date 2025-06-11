w/**
 * Offline Status Indicator Component
 * Shows offline/online status and sync progress
 */
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useFeedback } from '../ux';
import { isOnline } from '../../utils/serviceWorker';
import { offlineFormManager, syncQueueManager, BackgroundSync } from '../../utils/indexedDB';

/**
 * Offline Status Badge
 */
const OfflineStatusBadge = ({ 
  isOffline, 
  pendingCount = 0, 
  syncing = false,
  className = '',
  showDetails = true 
}) => {
  const getStatusColor = () => {
    if (syncing) return 'bg-blue-500';
    if (isOffline) return 'bg-red-500';
    if (pendingCount > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (syncing) return ArrowPathIcon;
    if (isOffline) return ExclamationTriangleIcon;
    if (pendingCount > 0) return CloudArrowUpIcon;
    return CheckCircleIcon;
  };

  const getStatusText = () => {
    if (syncing) return 'Sincronizando...';
    if (isOffline) return 'Sin conexión';
    if (pendingCount > 0) return `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`;
    return 'En línea';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={clsx(
      'flex items-center space-x-2 px-3 py-1 rounded-full text-white text-sm font-medium',
      getStatusColor(),
      className
    )}>
      <StatusIcon className={clsx(
        'h-4 w-4',
        syncing && 'animate-spin'
      )} />
      {showDetails && <span>{getStatusText()}</span>}
    </div>
  );
};

/**
 * Main Offline Status Component
 */
const OfflineStatus = ({ 
  position = 'top-right',
  persistent = false,
  showCounter = true,
  autoHide = true,
  className = ''
}) => {
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingFormsCount, setPendingFormsCount] = useState(0);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [isVisible, setIsVisible] = useState(!autoHide || !isOnline() || pendingFormsCount > 0);
  
  const { showSuccess, showError, showInfo } = useFeedback();

  const totalPending = pendingFormsCount + pendingQueueCount;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showSuccess('Conexión restaurada', { duration: 3000 });
      
      // Auto sync when coming online
      if (totalPending > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      showInfo('Modo sin conexión activado', { 
        duration: 5000,
        title: 'Sin conexión',
        autoHide: false 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [totalPending, showSuccess, showInfo]);

  // Update pending counts
  useEffect(() => {
    const updateCounts = async () => {
      try {
        const [pendingForms, pendingQueue] = await Promise.all([
          offlineFormManager.getPendingForms(),
          syncQueueManager.getPendingItems()
        ]);
        
        setPendingFormsCount(pendingForms.length);
        setPendingQueueCount(pendingQueue.length);
      } catch (error) {
        console.error('Failed to update pending counts:', error);
      }
    };

    updateCounts();
    
    // Update counts periodically
    const interval = setInterval(updateCounts, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto show/hide logic
  useEffect(() => {
    if (autoHide) {
      const shouldShow = isOffline || totalPending > 0 || syncing;
      setIsVisible(shouldShow);
    } else {
      setIsVisible(true);
    }
  }, [isOffline, totalPending, syncing, autoHide]);

  // Handle manual sync
  const handleSync = async () => {
    if (syncing || isOffline) return;

    setSyncing(true);
    showInfo('Iniciando sincronización...', { duration: 2000 });

    try {
      await Promise.all([
        BackgroundSync.syncPendingForms(),
        BackgroundSync.syncQueueItems(),
        BackgroundSync.register()
      ]);

      // Update counts after sync
      const [pendingForms, pendingQueue] = await Promise.all([
        offlineFormManager.getPendingForms(),
        syncQueueManager.getPendingItems()
      ]);
      
      setPendingFormsCount(pendingForms.length);
      setPendingQueueCount(pendingQueue.length);

      const remainingCount = pendingForms.length + pendingQueue.length;
      
      if (remainingCount === 0) {
        showSuccess('Sincronización completada', { duration: 3000 });
      } else {
        showError(`${remainingCount} elementos no se pudieron sincronizar`, { duration: 5000 });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      showError('Error durante la sincronización', { duration: 5000 });
    } finally {
      setSyncing(false);
    }
  };

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!isVisible && !persistent) return null;

  return (
    <div className={clsx(
      'fixed z-50 transition-all duration-300',
      positionClasses[position],
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      className
    )}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <WifiIcon className={clsx(
              'h-5 w-5',
              isOffline ? 'text-red-500' : 'text-green-500'
            )} />
            <span className="font-medium text-gray-900">
              {isOffline ? 'Sin conexión' : 'En línea'}
            </span>
          </div>
          
          <OfflineStatusBadge
            isOffline={isOffline}
            pendingCount={totalPending}
            syncing={syncing}
            showDetails={false}
          />
        </div>

        {/* Pending Items */}
        {showCounter && totalPending > 0 && (
          <div className="mb-3 space-y-1">
            {pendingFormsCount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Formularios pendientes:</span>
                <span className="font-medium">{pendingFormsCount}</span>
              </div>
            )}
            {pendingQueueCount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Acciones pendientes:</span>
                <span className="font-medium">{pendingQueueCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Sync Button */}
        {!isOffline && totalPending > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className={clsx(
              'w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              syncing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            <CloudArrowUpIcon className={clsx(
              'h-4 w-4',
              syncing && 'animate-pulse'
            )} />
            <span>
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </span>
          </button>
        )}

        {/* Offline Message */}
        {isOffline && (
          <div className="text-xs text-gray-500 text-center">
            Los datos se sincronizarán automáticamente cuando se restaure la conexión
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Minimal Status Bar Component
 */
export const OfflineStatusBar = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const [forms, queue] = await Promise.all([
          offlineFormManager.getPendingForms(),
          syncQueueManager.getPendingItems()
        ]);
        setPendingCount(forms.length + queue.length);
      } catch (error) {
        console.error('Failed to get pending count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={clsx(
      'bg-yellow-50 border-b border-yellow-200 px-4 py-2',
      className
    )}>
      <div className="flex items-center justify-center space-x-2 text-sm text-yellow-800">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>
          {isOffline 
            ? 'Sin conexión - Trabajando en modo offline'
            : `${pendingCount} elementos pendientes de sincronización`
          }
        </span>
      </div>
    </div>
  );
};

export default OfflineStatus;
