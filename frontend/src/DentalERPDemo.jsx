import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRouter from './router/AppRouter';

// Import demo pages for testing
import DesignSystemDemo from './pages/DesignSystemDemo';
import DesignSystemTest from './pages/DesignSystemTest';
import ResponsiveDemo from './pages/ResponsiveDemo';
import ResponsiveShowcase from './pages/ResponsiveShowcase';

/**
 * Main Demo Application with Authentication
 * Complete DentalERP demo with GitHub OAuth and development mode
 */
function DentalERPDemo() {
  const [demoMode, setDemoMode] = useState('erp'); // erp, showcase, components

  // Navigation header for switching between demo modes
  const DemoNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🦷</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">DentalERP Demo</h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <button
              onClick={() => setDemoMode('erp')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                demoMode === 'erp'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              🏥 Sistema ERP
            </button>
            <button
              onClick={() => setDemoMode('showcase')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                demoMode === 'showcase'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              🎨 Showcase
            </button>
            <button
              onClick={() => setDemoMode('components')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                demoMode === 'components'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              🧩 Componentes
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="hidden sm:inline">Demo Version 1.0</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-4 flex space-x-1">
        <button
          onClick={() => setDemoMode('erp')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            demoMode === 'erp'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          🏥 ERP
        </button>
        <button
          onClick={() => setDemoMode('showcase')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            demoMode === 'showcase'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          🎨 Showcase
        </button>
        <button
          onClick={() => setDemoMode('components')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            demoMode === 'components'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
          }`}
        >
          🧩 Componentes
        </button>
      </div>
    </div>
  );

  // Render current demo content
  const renderDemoContent = () => {
    switch (demoMode) {
      case 'erp':
        return <AppRouter />;
      case 'showcase':
        return <ResponsiveShowcase />;
      case 'components':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">Sistema de Diseño</h2>
                  <DesignSystemTest />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">Demo Responsive</h2>
                  <ResponsiveDemo />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AppRouter />;
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-50">
        <DemoNavigation />
        {renderDemoContent()}
      </div>
    </GoogleOAuthProvider>
  );
}

export default DentalERPDemo;
