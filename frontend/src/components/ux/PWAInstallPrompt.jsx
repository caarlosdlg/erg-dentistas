/**
 * PWA Install Prompt Component
 * Prompts users to install the PWA with enhanced UX
 */
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  DevicePhoneMobileIcon,
  XMarkIcon,
  CloudArrowDownIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ButtonTW, Modal } from '../ui';
import { useFeedback } from '../ux';
import { showInstallPrompt, isStandalone } from '../../utils/serviceWorker';

/**
 * PWA Install Banner
 */
const PWAInstallBanner = ({ 
  onInstall, 
  onDismiss, 
  variant = 'banner',
  className = '' 
}) => {
  const features = [
    { icon: '⚡', text: 'Acceso instantáneo' },
    { icon: '📱', text: 'Funciona offline' },
    { icon: '🔔', text: 'Notificaciones push' },
    { icon: '💾', text: 'Menos consumo de datos' }
  ];

  if (variant === 'modal') {
    return (
      <div className={clsx('text-center space-y-6', className)}>
        {/* App Icon */}
        <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
          <DevicePhoneMobileIcon className="h-8 w-8 text-white" />
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Instalar DentalERP
          </h3>
          <p className="text-gray-600">
            Obtén acceso rápido y funciones offline instalando nuestra aplicación
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{feature.icon}</span>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <ButtonTW
            onClick={onInstall}
            className="w-full"
            size="lg"
          >
            <CloudArrowDownIcon className="h-5 w-5 mr-2" />
            Instalar aplicación
          </ButtonTW>
          
          <button
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Recordar más tarde
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg shadow-lg',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <DevicePhoneMobileIcon className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Instalar DentalERP</h4>
            <p className="text-sm text-primary-100 mb-3">
              Instala nuestra app para acceso rápido y funciones offline
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <ButtonTW
                onClick={onInstall}
                variant="secondary"
                size="sm"
                className="bg-white text-primary-600 hover:bg-gray-50"
              >
                Instalar
              </ButtonTW>
              
              <button
                onClick={onDismiss}
                className="text-xs text-primary-100 hover:text-white underline"
              >
                No, gracias
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-primary-100 hover:text-white p-1"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Install Success Component
 */
const InstallSuccess = ({ onClose }) => (
  <div className="text-center space-y-4">
    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircleIcon className="h-8 w-8 text-green-600" />
    </div>
    
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ¡Aplicación instalada!
      </h3>
      <p className="text-gray-600">
        DentalERP se ha instalado correctamente. Puedes acceder desde tu pantalla de inicio.
      </p>
    </div>
    
    <ButtonTW onClick={onClose} variant="primary">
      Continuar
    </ButtonTW>
  </div>
);

/**
 * Main PWA Install Prompt Component
 */
const PWAInstallPrompt = ({ 
  variant = 'banner',
  showRating = true,
  autoShow = true,
  delay = 5000,
  className = ''
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const { showSuccess, showError, showInfo } = useFeedback();

  // Check if already installed or prompt is available
  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      setIsAvailable(false);
      return;
    }

    // Check if user has already dismissed recently
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsAvailable(true);
      
      if (autoShow) {
        setTimeout(() => {
          setIsVisible(true);
        }, delay);
      }
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstallSuccess(true);
      setIsAvailable(false);
      showSuccess('Aplicación instalada correctamente', { duration: 5000 });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for custom PWA events
    const handlePWAInstallAvailable = (e) => {
      setDeferredPrompt(e.detail.prompt);
      setIsAvailable(true);
    };

    const handlePWAInstalled = () => {
      setIsVisible(false);
      setInstallSuccess(true);
      showSuccess('Aplicación instalada', { duration: 3000 });
    };

    window.addEventListener('pwa-install-available', handlePWAInstallAvailable);
    window.addEventListener('pwa-installed', handlePWAInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
      window.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, [autoShow, delay, showSuccess]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      showError('Instalación no disponible en este navegador');
      return;
    }

    setIsInstalling(true);

    try {
      const result = await showInstallPrompt();
      
      if (result) {
        setIsVisible(false);
        setInstallSuccess(true);
        showSuccess('Instalación iniciada', { duration: 3000 });
      } else {
        showInfo('Instalación cancelada', { duration: 2000 });
      }
    } catch (error) {
      console.error('Install failed:', error);
      showError('Error durante la instalación');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    showInfo('Puedes instalar la app desde el menú del navegador', { duration: 4000 });
  };

  const handleShowPrompt = () => {
    if (isAvailable && !isDismissed) {
      setIsVisible(true);
    }
  };

  // Don't render if not available, dismissed, or already installed
  if (!isAvailable || isDismissed || isStandalone()) {
    return null;
  }

  // Modal variant
  if (variant === 'modal') {
    return (
      <>
        <Modal
          isOpen={isVisible}
          onClose={handleDismiss}
          size="sm"
          showCloseButton={false}
        >
          {installSuccess ? (
            <InstallSuccess onClose={() => setInstallSuccess(false)} />
          ) : (
            <PWAInstallBanner
              variant="modal"
              onInstall={handleInstall}
              onDismiss={handleDismiss}
            />
          )}
        </Modal>
        
        {/* Floating Install Button */}
        {!isVisible && !installSuccess && (
          <button
            onClick={handleShowPrompt}
            className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 z-40"
            aria-label="Instalar aplicación"
          >
            <CloudArrowDownIcon className="h-6 w-6" />
          </button>
        )}
      </>
    );
  }

  // Banner variant
  return (
    <>
      {isVisible && (
        <div className={clsx(
          'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50',
          'transform transition-all duration-300 ease-in-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
          className
        )}>
          <PWAInstallBanner
            variant="banner"
            onInstall={handleInstall}
            onDismiss={handleDismiss}
          />
        </div>
      )}
      
      {/* Rating Prompt */}
      {showRating && installSuccess && (
        <Modal
          isOpen={installSuccess}
          onClose={() => setInstallSuccess(false)}
          size="sm"
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Te gusta DentalERP?
              </h3>
              <p className="text-gray-600">
                Ayúdanos dejando una calificación en la tienda de aplicaciones
              </p>
            </div>
            
            <div className="flex space-x-2">
              <ButtonTW
                onClick={() => setInstallSuccess(false)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Ahora no
              </ButtonTW>
              
              <ButtonTW
                onClick={() => {
                  setInstallSuccess(false);
                  showSuccess('¡Gracias por tu apoyo!');
                }}
                size="sm"
                className="flex-1"
              >
                Calificar
              </ButtonTW>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

/**
 * Install Button Component
 */
export const PWAInstallButton = ({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  children = 'Instalar App',
  ...props 
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { showSuccess, showError } = useFeedback();

  useEffect(() => {
    if (isStandalone()) return;

    const handlePWAInstallAvailable = () => {
      setIsAvailable(true);
    };

    const handlePWAInstalled = () => {
      setIsAvailable(false);
    };

    window.addEventListener('pwa-install-available', handlePWAInstallAvailable);
    window.addEventListener('pwa-installed', handlePWAInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handlePWAInstallAvailable);
      window.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const result = await showInstallPrompt();
      
      if (result) {
        showSuccess('Instalación iniciada');
      }
    } catch (error) {
      showError('Error durante la instalación');
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isAvailable || isStandalone()) {
    return null;
  }

  return (
    <ButtonTW
      onClick={handleInstall}
      loading={isInstalling}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      <CloudArrowDownIcon className="h-4 w-4 mr-2" />
      {children}
    </ButtonTW>
  );
};

export default PWAInstallPrompt;
