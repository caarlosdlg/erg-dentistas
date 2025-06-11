import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from './components/auth/UserProfile';

// Import existing pages
import DesignSystemDemo from './pages/DesignSystemDemo';
import DesignSystemTest from './pages/DesignSystemTest';
import ResponsiveDemo from './pages/ResponsiveDemo';
import ResponsiveShowcase from './pages/ResponsiveShowcase';
import ResponsiveTestPage from './pages/ResponsiveTestPage';
import ComponentIntegrationTest from './pages/ComponentIntegrationTest';

function AppWithAuth() {
  const [currentPage, setCurrentPage] = useState('showcase');

  // Navigation component with authentication
  const Navigation = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2 items-center">
      <UserProfile />
      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          onClick={() => setCurrentPage('integration')}
          className="px-2 py-1 sm:px-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
        >
          Integration
        </button>
        <button 
          onClick={() => setCurrentPage('responsive')}
          className="px-2 py-1 sm:px-3 sm:py-2 bg-info text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
        >
          Basic Demo
        </button>
        <button 
          onClick={() => setCurrentPage('testing')}
          className="px-2 py-1 sm:px-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
        >
          Testing
        </button>
        <button 
          onClick={() => setCurrentPage('test')}
          className="px-2 py-1 sm:px-3 sm:py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-xs sm:text-sm"
        >
          Test
        </button>
        <button 
          onClick={() => setCurrentPage('demo')}
          className="px-2 py-1 sm:px-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm"
        >
          System
        </button>
      </div>
    </div>
  );

  // Main content component
  const MainContent = () => {
    if (currentPage === 'showcase') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <ResponsiveShowcase />
        </div>
      );
    }

    if (currentPage === 'integration') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <ComponentIntegrationTest />
        </div>
      );
    }

    if (currentPage === 'responsive') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <ResponsiveDemo />
        </div>
      );
    }

    if (currentPage === 'testing') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <ResponsiveTestPage />
        </div>
      );
    }

    if (currentPage === 'test') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <DesignSystemTest />
        </div>
      );
    }

    if (currentPage === 'demo') {
      return (
        <div className="min-h-screen">
          <Navigation />
          <DesignSystemDemo />
        </div>
      );
    }

    return <ResponsiveShowcase />;
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default AppWithAuth;
