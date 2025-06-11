import React, { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { useIntersectionObserver } from '../../hooks/usePerformance';

/**
 * Optimized Image component with lazy loading and performance enhancements
 */
export const OptimizedImage = React.memo(({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  loadingClassName = 'bg-gray-200 animate-pulse',
  aspectRatio = 'aspect-video',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(priority ? src : null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { targetRef, isIntersecting, wasIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Load image when it enters viewport or is priority
  useEffect(() => {
    if ((priority || isIntersecting || wasIntersecting) && !currentSrc && !hasError) {
      setCurrentSrc(src);
    }
  }, [src, priority, isIntersecting, wasIntersecting, currentSrc, hasError]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.(e);
  };

  return (
    <div
      ref={targetRef}
      className={clsx(aspectRatio, 'relative overflow-hidden', className)}
      {...props}
    >
      {!isLoaded && currentSrc && (
        <div className={clsx('absolute inset-0', loadingClassName)} />
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Optimized Card component with virtual scrolling for large lists
 */
export const VirtualizedCardList = React.memo(({
  items = [],
  renderCard,
  cardHeight = 200,
  containerHeight = 600,
  gap = 16,
  className = '',
  loadingCard: LoadingCard,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const itemHeight = cardHeight + gap;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 4);
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight,
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight - gap;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  if (items.length === 0 && LoadingCard) {
    return (
      <div className={clsx('grid gap-4', className)}>
        {Array.from({ length: visibleCount }, (_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
              height: cardHeight,
            }}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedCardList.displayName = 'VirtualizedCardList';

/**
 * Optimized Search Input with debounced search
 */
export const DebouncedSearchInput = React.memo(({
  onSearch,
  delay = 300,
  placeholder = 'Buscar...',
  className = '',
  clearable = true,
  ...props
}) => {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      onSearch('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      onSearch(value);
      setIsSearching(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md',
          'leading-5 bg-white placeholder-gray-500 focus:outline-none',
          'focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500',
          'focus:border-primary-500 sm:text-sm',
          className
        )}
        {...props}
      />

      <div className="absolute inset-y-0 right-0 flex items-center">
        {isSearching && (
          <div className="pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        {clearable && value && !isSearching && (
          <button
            onClick={handleClear}
            className="pr-3 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar búsqueda"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

DebouncedSearchInput.displayName = 'DebouncedSearchInput';

/**
 * Progressive Loading Container
 */
export const ProgressiveLoader = React.memo(({
  children,
  fallback,
  minLoadTime = 300,
  className = '',
}) => {
  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Ensure minimum loading time for smooth transitions
    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => setShowContent(true), 50);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  return (
    <div className={clsx('transition-all duration-300', className)}>
      {!isReady && fallback}
      {isReady && (
        <div
          className={clsx(
            'transition-opacity duration-300',
            showContent ? 'opacity-100' : 'opacity-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
});

ProgressiveLoader.displayName = 'ProgressiveLoader';

export default {
  OptimizedImage,
  VirtualizedCardList,
  DebouncedSearchInput,
  ProgressiveLoader,
};
