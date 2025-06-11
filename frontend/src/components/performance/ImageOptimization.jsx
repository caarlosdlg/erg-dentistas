/**
 * Image optimization utilities for DentalERP
 * Optimización de imágenes con soporte WebP y lazy loading
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useIntersectionObserver } from '../../hooks/usePerformance';

/**
 * Image format detection and optimization
 */
export class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
    this.compressionLevel = 0.8;
  }

  // Detect supported image formats
  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const formats = {
      webp: false,
      avif: false,
      jpeg: true,
      png: true,
    };

    // Check WebP support
    try {
      formats.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      formats.webp = false;
    }

    // Check AVIF support (newer format)
    try {
      formats.avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      formats.avif = false;
    }

    return formats;
  }

  // Get optimal image format
  getOptimalFormat(originalFormat = 'jpeg') {
    if (this.supportedFormats.avif) return 'avif';
    if (this.supportedFormats.webp) return 'webp';
    return originalFormat;
  }

  // Generate responsive image srcSet
  generateSrcSet(baseUrl, sizes = [400, 800, 1200, 1600], format = null) {
    const optimalFormat = format || this.getOptimalFormat();
    
    return sizes.map(size => {
      const url = this.generateOptimizedUrl(baseUrl, {
        width: size,
        format: optimalFormat,
        quality: this.compressionLevel * 100
      });
      return `${url} ${size}w`;
    }).join(', ');
  }

  // Generate optimized image URL
  generateOptimizedUrl(baseUrl, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover'
    } = options;

    // In a real application, you'd use a service like Cloudinary, ImageKit, or your own image service
    const params = new URLSearchParams();
    
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    params.set('q', quality);
    params.set('f', format);
    params.set('fit', fit);

    return `${baseUrl}?${params.toString()}`;
  }

  // Compress image file
  async compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width: newWidth, height: newHeight } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(resolve, 'image/webp', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Calculate responsive dimensions
  calculateDimensions(originalWidth, originalHeight, maxWidth) {
    if (originalWidth <= maxWidth) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = originalHeight / originalWidth;
    return {
      width: maxWidth,
      height: Math.round(maxWidth * ratio)
    };
  }

  // Preload critical images
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Batch preload images
  async preloadImages(urls) {
    const promises = urls.map(url => this.preloadImage(url));
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        url: urls[index],
        loaded: result.status === 'fulfilled',
        image: result.status === 'fulfilled' ? result.value : null
      }));
    } catch (error) {
      console.error('Error preloading images:', error);
      return [];
    }
  }
}

// Global image optimizer instance
export const imageOptimizer = new ImageOptimizer();

/**
 * OptimizedImage Component
 * Imagen optimizada con lazy loading y formatos modernos
 */
export const OptimizedImage = React.memo(({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  placeholder = null,
  quality = 80,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const imgRef = useRef(null);

  // Intersection observer for lazy loading
  const isInView = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  });

  // Generate optimized sources
  const optimizedSources = React.useMemo(() => {
    if (!src) return [];

    const webpSrcSet = imageOptimizer.generateSrcSet(src, [400, 800, 1200, 1600], 'webp');
    const fallbackSrcSet = imageOptimizer.generateSrcSet(src, [400, 800, 1200, 1600], 'jpeg');

    return [
      { type: 'image/webp', srcSet: webpSrcSet },
      { type: 'image/jpeg', srcSet: fallbackSrcSet },
    ];
  }, [src]);

  // Handle image loading
  const handleLoad = useCallback((event) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event) => {
    setHasError(true);
    setIsLoaded(false);
    onError?.(event);
  }, [onError]);

  // Load image when in view or priority is set
  useEffect(() => {
    if (priority || isInView) {
      const mainSrc = imageOptimizer.generateOptimizedUrl(src, {
        width,
        height,
        quality,
        format: imageOptimizer.getOptimalFormat()
      });
      setCurrentSrc(mainSrc);
    }
  }, [src, width, height, quality, priority, isInView]);

  // Preload if priority
  useEffect(() => {
    if (priority && currentSrc) {
      imageOptimizer.preloadImage(currentSrc);
    }
  }, [priority, currentSrc]);

  // Render placeholder while loading
  if (!currentSrc && !priority) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      >
        {placeholder || (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 border border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  // Render optimized image
  return (
    <picture ref={imgRef} className={className}>
      {optimizedSources.map((source, index) => (
        <source
          key={index}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Image Gallery Component with optimization
 */
export const OptimizedGallery = React.memo(({ 
  images = [], 
  columns = 3,
  gap = 16,
  className = '',
  onImageClick 
}) => {
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // Preload visible images
  const preloadVisibleImages = useCallback(async (imageUrls) => {
    const results = await imageOptimizer.preloadImages(imageUrls);
    const loaded = new Set(
      results.filter(result => result.loaded).map(result => result.url)
    );
    setPreloadedImages(prev => new Set([...prev, ...loaded]));
  }, []);

  // Grid styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };

  return (
    <div className={`optimized-gallery ${className}`} style={gridStyle}>
      {images.map((image, index) => (
        <div
          key={image.id || index}
          className="gallery-item cursor-pointer overflow-hidden rounded-lg"
          onClick={() => onImageClick?.(image, index)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt || `Gallery image ${index + 1}`}
            width={image.width}
            height={image.height}
            className="w-full h-auto hover:scale-105 transition-transform duration-300"
            priority={index < 4} // Preload first 4 images
            quality={85}
          />
        </div>
      ))}
    </div>
  );
});

OptimizedGallery.displayName = 'OptimizedGallery';

/**
 * Background Image Component with optimization
 */
export const OptimizedBackgroundImage = React.memo(({
  src,
  children,
  className = '',
  overlay = false,
  overlayOpacity = 0.5,
  ...props
}) => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      const optimizedSrc = imageOptimizer.generateOptimizedUrl(src, {
        width: 1920,
        quality: 80,
        format: imageOptimizer.getOptimalFormat()
      });

      imageOptimizer.preloadImage(optimizedSrc).then(() => {
        setBackgroundImage(`url(${optimizedSrc})`);
        setIsLoaded(true);
      });
    }
  }, [src]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7,
      }}
      {...props}
    >
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

OptimizedBackgroundImage.displayName = 'OptimizedBackgroundImage';

/**
 * Utility functions
 */

// Convert image to WebP format
export const convertToWebP = async (file, quality = 0.8) => {
  return imageOptimizer.compressImage(file, 1920, quality);
};

// Get image dimensions
export const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Generate responsive sizes attribute
export const generateSizes = (breakpoints) => {
  return breakpoints
    .map(bp => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
    .join(', ');
};

// Image validation
export const validateImage = (file, maxSize = 5 * 1024 * 1024) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  return {
    isValid: validTypes.includes(file.type) && file.size <= maxSize,
    errors: [
      ...(!validTypes.includes(file.type) ? ['Invalid file type'] : []),
      ...(file.size > maxSize ? ['File too large'] : []),
    ]
  };
};
