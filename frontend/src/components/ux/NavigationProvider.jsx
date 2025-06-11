import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Navigation Context for managing navigation state and flow
 * Provides breadcrumbs, navigation history, and page transitions
 */
const NavigationContext = createContext({});

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

// Page metadata configuration
const pageConfig = {
  '/': {
    title: 'Dashboard',
    breadcrumb: 'Inicio',
    icon: '📊',
    description: 'Panel principal del sistema DentalERP',
  },
  '/pacientes': {
    title: 'Gestión de Pacientes',
    breadcrumb: 'Pacientes',
    icon: '👥',
    description: 'Administrar información de pacientes',
    parent: '/',
  },
  '/citas': {
    title: 'Gestión de Citas',
    breadcrumb: 'Citas',
    icon: '📅',
    description: 'Programar y gestionar citas médicas',
    parent: '/',
  },
  '/tratamientos': {
    title: 'Tratamientos',
    breadcrumb: 'Tratamientos',
    icon: '🦷',
    description: 'Catálogo de tratamientos dentales',
    parent: '/',
  },
  '/busqueda': {
    title: 'Búsqueda Avanzada',
    breadcrumb: 'Búsqueda',
    icon: '🔍',
    description: 'Búsqueda avanzada en el sistema',
    parent: '/',
  },
  '/design-system': {
    title: 'Sistema de Diseño',
    breadcrumb: 'Diseño',
    icon: '🎨',
    description: 'Demostración del sistema de diseño',
    parent: '/',
  },
};

const Breadcrumb = ({ items }) => (
  <nav className="flex mb-4" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      {items.map((item, index) => (
        <li key={item.path} className="inline-flex items-center">
          {index > 0 && (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {index === items.length - 1 ? (
            <span
              className="ml-1 text-sm font-medium text-gray-500 md:ml-2"
              aria-current="page"
            >
              {item.icon} {item.breadcrumb}
            </span>
          ) : (
            <a
              href={item.path}
              className="inline-flex items-center ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
            >
              {item.icon} {item.breadcrumb}
            </a>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const PageHeader = ({ title, description, actions }) => (
  <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  </div>
);

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update history when location changes
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, location.pathname];
      // Keep only last 10 entries
      return newHistory.slice(-10);
    });

    // Page transition effect
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Update page title
  useEffect(() => {
    const currentPage = pageConfig[location.pathname];
    if (currentPage) {
      document.title = `${currentPage.title} - DentalERP`;
    }
  }, [location.pathname]);

  // Generate breadcrumb items
  const getBreadcrumbs = () => {
    const currentPage = pageConfig[location.pathname];
    if (!currentPage) return [];

    const items = [];
    let current = currentPage;

    // Build breadcrumb chain
    while (current) {
      items.unshift({
        path: Object.keys(pageConfig).find(key => pageConfig[key] === current),
        ...current,
      });
      
      if (current.parent) {
        current = pageConfig[current.parent];
      } else {
        break;
      }
    }

    return items;
  };

  const getCurrentPage = () => {
    return pageConfig[location.pathname] || {
      title: 'Página',
      breadcrumb: 'Página',
      icon: '📄',
    };
  };

  const canGoBack = () => {
    return history.length > 1;
  };

  const goBack = () => {
    if (canGoBack()) {
      window.history.back();
    }
  };

  const getPageActions = () => {
    // Return common actions for the current page
    const actions = [];

    if (canGoBack()) {
      actions.push(
        <button
          key="back"
          onClick={goBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          ← Atrás
        </button>
      );
    }

    return actions;
  };

  const value = {
    currentPage: getCurrentPage(),
    breadcrumbs: getBreadcrumbs(),
    history,
    isTransitioning,
    canGoBack,
    goBack,
    getPageActions,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Navigation components for easy use
export const NavigationBreadcrumb = () => {
  const { breadcrumbs } = useNavigation();
  
  if (breadcrumbs.length <= 1) return null;
  
  return <Breadcrumb items={breadcrumbs} />;
};

export const NavigationPageHeader = ({ title, description, additionalActions = [] }) => {
  const { currentPage, getPageActions } = useNavigation();
  
  const finalTitle = title || currentPage.title;
  const finalDescription = description || currentPage.description;
  const actions = [...getPageActions(), ...additionalActions];

  return (
    <PageHeader 
      title={finalTitle}
      description={finalDescription}
      actions={actions}
    />
  );
};

export const NavigationPageTransition = ({ children }) => {
  const { isTransitioning } = useNavigation();
  
  return (
    <div
      className={`transition-opacity duration-150 ${
        isTransitioning ? 'opacity-75' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
};

export default NavigationProvider;
