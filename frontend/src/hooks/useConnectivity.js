import { useState, useEffect } from 'react';
import connectivityService from '../services/connectivityService';

/**
 * Hook for managing API connectivity status
 */
export const useConnectivity = () => {
  const [status, setStatus] = useState({
    categories: { status: 'testing', message: 'Testing connection...' },
    reviews: { status: 'testing', message: 'Testing connection...' },
    lastChecked: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const testConnections = async () => {
    setIsLoading(true);
    
    try {
      const [categoriesResult, reviewsResult] = await Promise.all([
        connectivityService.testConnection(),
        connectivityService.testReviewsConnection(),
      ]);

      setStatus({
        categories: categoriesResult,
        reviews: reviewsResult,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('Connectivity test failed:', error);
      setStatus({
        categories: { status: 'error', message: 'Connection test failed' },
        reviews: { status: 'error', message: 'Connection test failed' },
        lastChecked: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnections();
    
    // Test connectivity every 30 seconds
    const interval = setInterval(testConnections, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (connectionStatus) => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'testing':
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (connectionStatus) => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'disconnected':
        return 'Disconnected';
      case 'testing':
      default:
        return 'Testing';
    }
  };

  return {
    status,
    isLoading,
    testConnections,
    getStatusColor,
    getStatusText,
    isConnected: status.categories.status === 'connected' && status.reviews.status === 'connected',
    hasErrors: status.categories.status === 'error' || status.reviews.status === 'error',
  };
};
