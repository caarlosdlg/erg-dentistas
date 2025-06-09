import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import AuthHeader from './components/AuthHeader'
import DesignSystemDemo from './pages/DesignSystemDemo'
import DesignSystemTest from './pages/DesignSystemTest'
import ResponsiveDemo from './pages/ResponsiveDemo'
import ResponsiveShowcase from './pages/ResponsiveShowcase'
import ResponsiveTestPage from './pages/ResponsiveTestPage'
import ComponentIntegrationTest from './pages/ComponentIntegrationTest'
import SearchPage from './pages/SearchPage'
import SimpleSearchPage from './pages/SimpleSearchPage'
import SearchAndImageDemo from './pages/SearchAndImageDemo'

function App() {
  const [currentPage, setCurrentPage] = useState('search-demo')

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {/* Header with authentication and navigation */}
        <div className="fixed top-0 left-0 right-0 z-[60] bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">DentalERP</h1>
              <div className="hidden sm:flex space-x-2">
                <button 
                  onClick={() => setCurrentPage('showcase')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'showcase' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Showcase
                </button>
                <button 
                  onClick={() => setCurrentPage('search')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'search' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Search
                </button>
                <button 
                  onClick={() => setCurrentPage('search-demo')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'search-demo' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Search & Images
                </button>
                <button 
                  onClick={() => setCurrentPage('demo')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'demo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  System
                </button>
                <button 
                  onClick={() => setCurrentPage('test')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'test' ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Test
                </button>
                <button 
                  onClick={() => setCurrentPage('integration')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === 'integration' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Integration
                </button>
              </div>
            </div>
            <AuthHeader />
          </div>
        </div>
        
        {/* Content with top padding to account for fixed header */}
        <div className="pt-20">
          {currentPage === 'showcase' && <ResponsiveShowcase />}
          {currentPage === 'search' && <SimpleSearchPage />}
          {currentPage === 'search-demo' && <SearchAndImageDemo />}
          {currentPage === 'responsive' && <ResponsiveDemo />}
          {currentPage === 'test' && <DesignSystemTest />}
          {currentPage === 'testing' && <ResponsiveTestPage />}
          {currentPage === 'demo' && (
            <div className="bg-neutral-50 min-h-screen">
              <DesignSystemDemo />
            </div>
          )}
          {currentPage === 'integration' && <ComponentIntegrationTest />}
          {!['showcase', 'search', 'search-demo', 'responsive', 'test', 'testing', 'demo', 'integration'].includes(currentPage) && (
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">DentalERP Frontend</h1>
              <button 
                onClick={() => setCurrentPage('test')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver Sistema de Diseño
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
