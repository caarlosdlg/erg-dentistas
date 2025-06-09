import React, { useState } from 'react';
import { CategoryNavigation, CategoryPage } from '../components/categories';
import { ReviewsPage, ReviewStats } from '../components/reviews';
import { ButtonTW, CardTW, Badge } from '../components/ui';
import { useConnectivity } from '../hooks/useConnectivity';

const ComponentIntegrationTest = () => {
  const [activeComponent, setActiveComponent] = useState('categories');
  const { status, isLoading, testConnections, getStatusColor, getStatusText, isConnected, hasErrors } = useConnectivity();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-md p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Etapa 2 - Tarea 1: Component Integration Test
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <ButtonTW
              variant={activeComponent === 'categories' ? 'primary' : 'outline'}
              onClick={() => setActiveComponent('categories')}
              size="sm"
            >
              Category Navigation
            </ButtonTW>
            <ButtonTW
              variant={activeComponent === 'categoryPage' ? 'primary' : 'outline'}
              onClick={() => setActiveComponent('categoryPage')}
              size="sm"
            >
              Category Page
            </ButtonTW>
            <ButtonTW
              variant={activeComponent === 'reviews' ? 'primary' : 'outline'}
              onClick={() => setActiveComponent('reviews')}
              size="sm"
            >
              Reviews Page
            </ButtonTW>
            <ButtonTW
              variant={activeComponent === 'reviewStats' ? 'primary' : 'outline'}
              onClick={() => setActiveComponent('reviewStats')}
              size="sm"
            >
              Review Stats
            </ButtonTW>
          </div>
        </div>
      </div>

      {/* Component Display Area */}
      <div className="max-w-7xl mx-auto px-4">
        {activeComponent === 'categories' && (
          <CardTW className="p-6">
            <h2 className="text-xl font-semibold mb-4">Category Navigation Test</h2>
            <p className="text-gray-600 mb-6">
              Testing hierarchical category navigation with search and filtering
            </p>
            <CategoryNavigation />
          </CardTW>
        )}

        {activeComponent === 'categoryPage' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Category Page Test</h2>
            <p className="text-gray-600 mb-6">
              Testing full category page with treatments and reviews
            </p>
            <CategoryPage categoryId="1" />
          </div>
        )}

        {activeComponent === 'reviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reviews Page Test</h2>
            <p className="text-gray-600 mb-6">
              Testing review listing, filtering, and management
            </p>
            <ReviewsPage />
          </div>
        )}

        {activeComponent === 'reviewStats' && (
          <CardTW className="p-6">
            <h2 className="text-xl font-semibold mb-4">Review Statistics Test</h2>
            <p className="text-gray-600 mb-6">
              Testing review statistics and analytics display
            </p>
            <ReviewStats />
          </CardTW>
        )}
      </div>

      {/* API Connection Status */}
      <div className="fixed bottom-4 right-4 z-50">
        <CardTW className="p-4 bg-blue-50 border-blue-200 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">API Status</h3>
            <ButtonTW
              variant="outline"
              size="sm"
              onClick={testConnections}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? 'Testing...' : 'Refresh'}
            </ButtonTW>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.categories.status)}`}></div>
              <span className="text-blue-800">Categories API:</span>
              <Badge 
                variant={status.categories.status === 'connected' ? 'success' : 
                        status.categories.status === 'error' ? 'warning' : 'danger'}
                size="sm"
              >
                {getStatusText(status.categories.status)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.reviews.status)}`}></div>
              <span className="text-blue-800">Reviews API:</span>
              <Badge 
                variant={status.reviews.status === 'connected' ? 'success' : 
                        status.reviews.status === 'error' ? 'warning' : 'danger'}
                size="sm"
              >
                {getStatusText(status.reviews.status)}
              </Badge>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
              <p className="text-yellow-800">
                <strong>Demo Mode:</strong> Using mock data while API is unavailable.
              </p>
            </div>
          )}

          {status.lastChecked && (
            <div className="mt-2 text-xs text-gray-500">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </CardTW>
      </div>
    </div>
  );
};

export default ComponentIntegrationTest;
