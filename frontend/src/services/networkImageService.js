/**
 * Network-aware image service for optimal loading based on connection quality
 */

class NetworkImageService {
  constructor() {
    this.connectionType = this.getConnectionType();
    this.effectiveType = this.getEffectiveType();
    this.isSlowConnection = this.checkSlowConnection();
    
    // Listen for network changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.updateConnectionInfo();
      });
    }
  }

  /**
   * Get current connection type
   */
  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.type || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Get effective connection type (4g, 3g, 2g, slow-2g)
   */
  getEffectiveType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || '4g';
    }
    return '4g';
  }

  /**
   * Check if connection is slow
   */
  checkSlowConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData === true ||
        (connection.downlink && connection.downlink < 1.5)
      );
    }
    return false;
  }

  /**
   * Update connection information
   */
  updateConnectionInfo() {
    this.connectionType = this.getConnectionType();
    this.effectiveType = this.getEffectiveType();
    this.isSlowConnection = this.checkSlowConnection();
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('networkchange', {
      detail: {
        connectionType: this.connectionType,
        effectiveType: this.effectiveType,
        isSlowConnection: this.isSlowConnection
      }
    }));
  }

  /**
   * Get optimal image quality based on network conditions
   */
  getOptimalQuality() {
    if (this.isSlowConnection) {
      return 'low';
    }
    
    switch (this.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return 'high';
    }
  }

  /**
   * Get optimal image format based on browser support and network
   */
  getOptimalFormat() {
    const supportsWebP = this.supportsWebP();
    const supportsAVIF = this.supportsAVIF();
    
    if (this.isSlowConnection) {
      if (supportsAVIF) return 'avif';
      if (supportsWebP) return 'webp';
      return 'jpeg';
    }
    
    if (supportsAVIF) return 'avif';
    if (supportsWebP) return 'webp';
    return 'jpeg';
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  supportsAVIF() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get loading strategy based on network conditions
   */
  getLoadingStrategy() {
    if (this.isSlowConnection) {
      return {
        lazy: true,
        placeholder: 'blur',
        quality: 'low',
        format: this.getOptimalFormat(),
        preload: false,
        progressive: true
      };
    }

    switch (this.effectiveType) {
      case 'slow-2g':
      case '2g':
        return {
          lazy: true,
          placeholder: 'blur',
          quality: 'low',
          format: this.getOptimalFormat(),
          preload: false,
          progressive: true
        };
      case '3g':
        return {
          lazy: true,
          placeholder: 'skeleton',
          quality: 'medium',
          format: this.getOptimalFormat(),
          preload: false,
          progressive: true
        };
      case '4g':
      default:
        return {
          lazy: false,
          placeholder: 'skeleton',
          quality: 'high',
          format: this.getOptimalFormat(),
          preload: true,
          progressive: false
        };
    }
  }

  /**
   * Generate optimized image URL with network-aware parameters
   */
  getOptimizedImageUrl(originalUrl, options = {}) {
    if (!originalUrl) return null;

    const strategy = this.getLoadingStrategy();
    const params = new URLSearchParams();

    // Apply network-aware quality
    const quality = options.quality || strategy.quality;
    if (quality !== 'original') {
      const qualityMap = { low: 60, medium: 80, high: 95 };
      params.set('quality', qualityMap[quality] || 80);
    }

    // Apply optimal format
    const format = options.format || strategy.format;
    if (format !== 'original') {
      params.set('format', format);
    }

    // Apply dimensions if provided
    if (options.width) params.set('w', options.width);
    if (options.height) params.set('h', options.height);

    // Apply progressive loading for slow connections
    if (strategy.progressive) {
      params.set('progressive', 'true');
    }

    // Return URL with parameters
    const separator = originalUrl.includes('?') ? '&' : '?';
    return params.toString() ? `${originalUrl}${separator}${params.toString()}` : originalUrl;
  }

  /**
   * Preload critical images
   */
  preloadImages(imageUrls, options = {}) {
    if (this.isSlowConnection && !options.force) {
      return Promise.resolve(); // Skip preloading on slow connections
    }

    const promises = imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = this.getOptimizedImageUrl(url, options);
      });
    });

    return Promise.allSettled(promises);
  }

  /**
   * Get recommended batch size for image loading
   */
  getBatchSize() {
    if (this.isSlowConnection) return 2;
    
    switch (this.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 2;
      case '3g':
        return 4;
      case '4g':
      default:
        return 8;
    }
  }

  /**
   * Check if data saver mode is enabled
   */
  isDataSaverEnabled() {
    if ('connection' in navigator) {
      return navigator.connection.saveData === true;
    }
    return false;
  }

  /**
   * Get network information for debugging
   */
  getNetworkInfo() {
    return {
      connectionType: this.connectionType,
      effectiveType: this.effectiveType,
      isSlowConnection: this.isSlowConnection,
      dataSaver: this.isDataSaverEnabled(),
      strategy: this.getLoadingStrategy()
    };
  }
}

export default new NetworkImageService();
