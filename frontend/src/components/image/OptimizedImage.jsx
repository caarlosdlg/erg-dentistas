import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const OptimizedImage = ({
  src,
  alt = '',
  className,
  lazy = true,
  quality = 'medium',
  sizes,
  fallbackSrc,
  onLoad,
  onError,
  placeholder = 'blur',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState(lazy ? null : src);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Quality settings for image optimization
  const qualityParams = {
    low: { quality: 60, format: 'webp' },
    medium: { quality: 80, format: 'webp' },
    high: { quality: 95, format: 'webp' },
    original: {}
  };

  // Generate optimized image URL
  const getOptimizedSrc = (originalSrc, quality) => {
    if (!originalSrc) return null;
    
    // If it's already optimized or external URL, return as is
    if (originalSrc.includes('?') || !originalSrc.startsWith('/')) {
      return originalSrc;
    }

    const params = qualityParams[quality];
    if (!params || Object.keys(params).length === 0) {
      return originalSrc;
    }

    const urlParams = new URLSearchParams(params);
    return `${originalSrc}?${urlParams.toString()}`;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(getOptimizedSrc(src, quality));
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, lazy, isInView, quality]);

  // Update src when props change
  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(getOptimizedSrc(src, quality));
    }
  }, [src, quality, lazy]);

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

  // Placeholder component
  const Placeholder = () => {
    if (placeholder === 'blur') {
      return (
        <div className={clsx(
          'absolute inset-0 bg-gray-200 animate-pulse',
          'flex items-center justify-center'
        )}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      );
    }
    
    if (placeholder === 'skeleton') {
      return (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
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

  return (
    <div ref={imgRef} className={clsx('relative overflow-hidden', className)}>
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
    </div>
  );
};

export default OptimizedImage;
