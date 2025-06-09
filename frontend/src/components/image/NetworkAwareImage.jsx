import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';
import networkImageService from '../../services/networkImageService';

const NetworkAwareImage = ({
  src,
  alt = '',
  className,
  lazy,
  quality,
  sizes,
  fallbackSrc,
  onLoad,
  onError,
  placeholder,
  showNetworkIndicator = false,
  adaptToNetwork = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [networkStrategy, setNetworkStrategy] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Initialize network strategy
  useEffect(() => {
    if (adaptToNetwork) {
      const strategy = networkImageService.getLoadingStrategy();
      const info = networkImageService.getNetworkInfo();
      setNetworkStrategy(strategy);
      setNetworkInfo(info);
      
      // Set initial in-view state based on network strategy
      setIsInView(!strategy.lazy);
    } else {
      setIsInView(!lazy);
    }
  }, [adaptToNetwork, lazy]);

  // Listen for network changes
  useEffect(() => {
    if (!adaptToNetwork) return;

    const handleNetworkChange = (event) => {
      const strategy = networkImageService.getLoadingStrategy();
      const info = networkImageService.getNetworkInfo();
      setNetworkStrategy(strategy);
      setNetworkInfo(info);
      
      // Reload image with new strategy if needed
      if (src && isInView) {
        const optimizedSrc = networkImageService.getOptimizedImageUrl(src, {
          quality: quality || strategy.quality,
          ...props
        });
        setCurrentSrc(optimizedSrc);
      }
    };

    window.addEventListener('networkchange', handleNetworkChange);
    return () => window.removeEventListener('networkchange', handleNetworkChange);
  }, [adaptToNetwork, src, quality, isInView, props]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const shouldUseLazy = adaptToNetwork ? networkStrategy?.lazy : lazy;
    
    if (!shouldUseLazy || isInView || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: adaptToNetwork && networkStrategy?.lazy ? '100px' : '50px',
        threshold: 0.1
      }
    );

    observer.observe(imgRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView, networkStrategy, adaptToNetwork]);

  // Update src when in view or props change
  useEffect(() => {
    if (!isInView || !src) return;

    let optimizedSrc;
    if (adaptToNetwork && networkStrategy) {
      optimizedSrc = networkImageService.getOptimizedImageUrl(src, {
        quality: quality || networkStrategy.quality,
        ...props
      });
    } else {
      optimizedSrc = src;
    }

    setCurrentSrc(optimizedSrc);
  }, [src, isInView, quality, networkStrategy, adaptToNetwork, props]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.(e);
    }
  };

  // Get placeholder type
  const getPlaceholderType = () => {
    if (placeholder) return placeholder;
    if (adaptToNetwork && networkStrategy) {
      return networkStrategy.placeholder;
    }
    return 'blur';
  };

  // Placeholder component
  const Placeholder = () => {
    const placeholderType = getPlaceholderType();
    
    if (placeholderType === 'blur') {
      return (
        <div className={clsx(
          'absolute inset-0 bg-gray-200 animate-pulse',
          'flex items-center justify-center'
        )}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      );
    }
    
    if (placeholderType === 'skeleton') {
      return (
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        </div>
      );
    }

    return null;
  };

  // Error component
  const ErrorState = () => (
    <div className={clsx(
      'absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300',
      'flex flex-col items-center justify-center text-gray-500'
    )}>
      <AlertCircle className="w-8 h-8 mb-2" />
      <span className="text-sm">Error al cargar imagen</span>
    </div>
  );

  // Network indicator
  const NetworkIndicator = () => {
    if (!showNetworkIndicator || !networkInfo) return null;

    const isSlowConnection = networkInfo.isSlowConnection;
    const effectiveType = networkInfo.effectiveType;

    return (
      <div className="absolute top-2 right-2 z-10">
        <div className={clsx(
          'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
          isSlowConnection 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        )}>
          {isSlowConnection ? (
            <WifiOff className="w-3 h-3" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          <span>{effectiveType.toUpperCase()}</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={imgRef} className={clsx('relative overflow-hidden', className)}>
      {/* Network indicator */}
      <NetworkIndicator />
      
      {/* Placeholder */}
      {!isLoaded && !hasError && <Placeholder />}
      
      {/* Error state */}
      {hasError && <ErrorState />}
      
      {/* Main image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden'
          )}
          {...props}
        />
      )}

      {/* Loading overlay for slow connections */}
      {adaptToNetwork && networkInfo?.isSlowConnection && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-blue-50 border border-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-blue-600">Cargando imagen optimizada...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkAwareImage;
