import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download } from 'lucide-react';
import clsx from 'clsx';
import OptimizedImage from './OptimizedImage';

const ImageGallery = ({
  images = [],
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  aspectRatio = 'square',
  showLightbox = true,
  showDownload = false,
  quality = 'medium',
  className,
  onImageClick,
  ...props
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});

  // Grid classes based on columns prop
  const gridClasses = useMemo(() => {
    const classes = ['grid', 'gap-4'];
    
    if (typeof columns === 'number') {
      classes.push(`grid-cols-${columns}`);
    } else {
      Object.entries(columns).forEach(([breakpoint, cols]) => {
        if (breakpoint === 'sm') {
          classes.push(`grid-cols-${cols}`);
        } else {
          classes.push(`${breakpoint}:grid-cols-${cols}`);
        }
      });
    }
    
    return classes.join(' ');
  }, [columns]);

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  // Handle image click
  const handleImageClick = useCallback((image, index) => {
    if (onImageClick) {
      onImageClick(image, index);
    } else if (showLightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  }, [onImageClick, showLightbox]);

  // Lightbox navigation
  const navigateLightbox = useCallback((direction) => {
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev < images.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : images.length - 1;
      }
    });
  }, [images.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!lightboxOpen) return;
    
    switch (e.key) {
      case 'Escape':
        setLightboxOpen(false);
        break;
      case 'ArrowLeft':
        navigateLightbox('prev');
        break;
      case 'ArrowRight':
        navigateLightbox('next');
        break;
    }
  }, [lightboxOpen, navigateLightbox]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle image load state
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: 'loaded' }));
  }, []);

  const handleImageError = useCallback((imageId) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: 'error' }));
  }, []);

  // Download image
  const downloadImage = useCallback(async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🖼️</div>
        <p>No hay imágenes para mostrar</p>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div className={clsx(gridClasses, className)} {...props}>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={clsx(
              'relative group cursor-pointer overflow-hidden rounded-lg',
              'hover:shadow-lg transition-shadow duration-200',
              aspectRatioClasses[aspectRatio] || aspectRatioClasses.square
            )}
            onClick={() => handleImageClick(image, index)}
          >
            <OptimizedImage
              src={image.url || image.src}
              alt={image.alt || image.caption || `Imagen ${index + 1}`}
              quality={quality}
              className="w-full h-full object-cover"
              onLoad={() => handleImageLoad(image.id || index)}
              onError={() => handleImageError(image.id || index)}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* Image caption */}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">
                  {image.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && showLightbox && currentImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
            
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Download button */}
            {showDownload && (
              <button
                onClick={() => downloadImage(currentImage.url || currentImage.src, currentImage.filename)}
                className="absolute top-4 right-16 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <Download className="w-6 h-6" />
              </button>
            )}

            {/* Main image */}
            <div className="max-w-full max-h-full">
              <img
                src={currentImage.url || currentImage.src}
                alt={currentImage.alt || currentImage.caption || `Imagen ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image info */}
            {currentImage.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
                  <p className="font-medium">{currentImage.caption}</p>
                  {images.length > 1 && (
                    <p className="text-sm opacity-75 mt-1">
                      {currentImageIndex + 1} de {images.length}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
