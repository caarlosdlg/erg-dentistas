import { useState } from 'react'
import DesignSystemDemo from './pages/DesignSystemDemo'
import DesignSystemTest from './pages/DesignSystemTest'
import ResponsiveDemo from './pages/ResponsiveDemo'
import ResponsiveShowcase from './pages/ResponsiveShowcase'
import ResponsiveTestPage from './pages/ResponsiveTestPage'

function App() {
  const [currentPage, setCurrentPage] = useState('showcase')

  if (currentPage === 'showcase') {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
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
        <ResponsiveShowcase />
      </div>
    )
  }

  if (currentPage === 'responsive') {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setCurrentPage('showcase')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          >
            Showcase
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
        <ResponsiveDemo />
      </div>
    )
  }

  if (currentPage === 'test') {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setCurrentPage('showcase')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          >
            Showcase
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
            onClick={() => setCurrentPage('demo')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm"
          >
            System
          </button>
        </div>
        <DesignSystemTest />
      </div>
    )
  }

  if (currentPage === 'testing') {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setCurrentPage('showcase')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          >
            Showcase
          </button>
          <button 
            onClick={() => setCurrentPage('responsive')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-info text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
          >
            Basic Demo
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
        <ResponsiveTestPage />
      </div>
    )
  }

  if (currentPage === 'demo') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setCurrentPage('showcase')}
            className="px-2 py-1 sm:px-3 sm:py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          >
            Showcase
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
        </div>
        <DesignSystemDemo />
      </div>
    )
  }

  return (
    <>
      <div>
        <h1>DentalERP Frontend</h1>
        <button onClick={() => setCurrentPage('test')}>
          Ver Sistema de Diseño
        </button>
      </div>
    </>
  )
}

export default App
