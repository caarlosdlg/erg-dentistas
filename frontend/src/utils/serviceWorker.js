/**
 * Service Worker registration and management utilities
 * Registro y gestión del Service Worker para DentalERP
 */

// Service Worker registration configuration
const SW_CONFIG = {
  swUrl: '/sw.js',
  scope: '/',
  updateViaCache: 'none', // Always check for updates
};

// Service Worker registration state
let registration = null;
let isUpdateAvailable = false;

/**
 * Register Service Worker
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 Service Workers not supported');
    return null;
  }

  try {
    console.log('🔧 Registering Service Worker...');
    
    registration = await navigator.serviceWorker.register(SW_CONFIG.swUrl, {
      scope: SW_CONFIG.scope,
      updateViaCache: SW_CONFIG.updateViaCache,
    });

    console.log('✅ Service Worker registered successfully');

    // Handle service worker updates
    handleServiceWorkerUpdates(registration);

    // Setup message channel
    setupMessageChannel();

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Handle Service Worker updates
 */
const handleServiceWorkerUpdates = (registration) => {
  // New service worker installing
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    console.log('🔄 New Service Worker installing...');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('🆕 New update available');
          isUpdateAvailable = true;
          notifyUpdateAvailable();
        } else {
          // First time installation
          console.log('✅ Service Worker installed for the first time');
          notifyInstalled();
        }
      }
    });
  });

  // Service worker became active
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    console.log('🔄 New Service Worker activated, refreshing...');
    refreshing = true;
    window.location.reload();
  });
};

/**
 * Setup message channel with Service Worker
 */
const setupMessageChannel = () => {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('📦 Cache updated:', payload);
        break;
      case 'OFFLINE_STATUS':
        handleOfflineStatus(payload);
        break;
      default:
        console.log('📨 Message from SW:', event.data);
    }
  });
};

/**
 * Update Service Worker
 */
export const updateServiceWorker = async () => {
  if (!registration) {
    console.warn('🚫 No Service Worker registration found');
    return false;
  }

  try {
    console.log('🔄 Checking for Service Worker updates...');
    await registration.update();
    return true;
  } catch (error) {
    console.error('❌ Service Worker update failed:', error);
    return false;
  }
};

/**
 * Skip waiting and activate new Service Worker
 */
export const skipWaitingAndReload = () => {
  if (!registration || !registration.waiting) {
    console.warn('🚫 No waiting Service Worker found');
    return;
  }

  console.log('⏭️ Skipping waiting Service Worker...');
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
};

/**
 * Get cache information
 */
export const getCacheInfo = async () => {
  if (!navigator.serviceWorker.controller) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_CACHE_INFO' },
      [messageChannel.port2]
    );
  });
};

/**
 * Unregister Service Worker
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('🗑️ Unregistering Service Worker...');
      await registration.unregister();
      console.log('✅ Service Worker unregistered');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Service Worker unregistration failed:', error);
    return false;
  }
};

/**
 * Check if app is running in standalone mode (PWA)
 */
export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
};

/**
 * Check if device is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Setup online/offline event listeners
 */
export const setupOnlineOfflineListeners = (callbacks = {}) => {
  const { onOnline, onOffline } = callbacks;

  const handleOnline = () => {
    console.log('🌐 App is online');
    if (onOnline) onOnline();
  };

  const handleOffline = () => {
    console.log('📴 App is offline');
    if (onOffline) onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Notify user about update availability
 */
const notifyUpdateAvailable = () => {
  // Dispatch custom event for update notification
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: {
      message: 'Nueva versión disponible',
      action: 'Actualizar aplicación',
      callback: skipWaitingAndReload
    }
  }));
};

/**
 * Notify user about first installation
 */
const notifyInstalled = () => {
  // Dispatch custom event for installation notification
  window.dispatchEvent(new CustomEvent('sw-installed', {
    detail: {
      message: 'Aplicación instalada correctamente',
      description: 'Ahora funciona sin conexión'
    }
  }));
};

/**
 * Handle offline status changes
 */
const handleOfflineStatus = (isOffline) => {
  window.dispatchEvent(new CustomEvent('offline-status-change', {
    detail: { isOffline }
  }));
};

/**
 * Install prompt for PWA
 */
let deferredPrompt = null;

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('💾 Install prompt triggered');
    event.preventDefault();
    deferredPrompt = event;

    // Dispatch custom event to show install button
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { prompt: deferredPrompt }
    }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('📱 PWA installed');
    deferredPrompt = null;
    
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

/**
 * Show install prompt
 */
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    console.warn('🚫 No install prompt available');
    return false;
  }

  try {
    console.log('📱 Showing install prompt...');
    deferredPrompt.prompt();
    
    const result = await deferredPrompt.userChoice;
    console.log('📊 Install prompt result:', result.outcome);
    
    deferredPrompt = null;
    return result.outcome === 'accepted';
  } catch (error) {
    console.error('❌ Install prompt failed:', error);
    return false;
  }
};

/**
 * Initialize all Service Worker features
 */
export const initializeServiceWorker = async (options = {}) => {
  const {
    enableInstallPrompt = true,
    enableOnlineOfflineListeners = true,
    onOnline,
    onOffline,
    onUpdateAvailable,
    onInstalled
  } = options;

  // Register Service Worker
  const registration = await registerServiceWorker();

  // Setup install prompt
  if (enableInstallPrompt) {
    setupInstallPrompt();
  }

  // Setup online/offline listeners
  if (enableOnlineOfflineListeners) {
    setupOnlineOfflineListeners({ onOnline, onOffline });
  }

  // Setup custom event listeners
  if (onUpdateAvailable) {
    window.addEventListener('sw-update-available', onUpdateAvailable);
  }

  if (onInstalled) {
    window.addEventListener('sw-installed', onInstalled);
  }

  return {
    registration,
    isStandalone: isStandalone(),
    isOnline: isOnline(),
    updateServiceWorker,
    getCacheInfo,
    showInstallPrompt,
  };
};
