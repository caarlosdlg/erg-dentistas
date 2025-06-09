import React from 'react';
import AuthHeader from './AuthHeader';

const Navigation = ({ currentPage, setCurrentPage }) => {
  const navButtons = [
    { id: 'search', label: 'Search', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { id: 'search-demo', label: 'Search & Images', color: 'bg-pink-600 hover:bg-pink-700' },
    { id: 'showcase', label: 'Showcase', color: 'bg-success hover:bg-green-600' },
    { id: 'integration', label: 'Integration', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'responsive', label: 'Basic Demo', color: 'bg-info hover:bg-blue-600' },
    { id: 'testing', label: 'Testing', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'test', label: 'Test', color: 'bg-secondary-600 hover:bg-secondary-700' },
    { id: 'demo', label: 'System', color: 'bg-primary-600 hover:bg-primary-700' }
  ];

  // Filter buttons based on current page
  const getVisibleButtons = () => {
    switch (currentPage) {
      case 'search':
        return ['showcase', 'search-demo', 'integration'];
      case 'search-demo':
        return ['showcase', 'search', 'integration'];
      case 'showcase':
        return ['integration', 'search', 'search-demo', 'responsive', 'testing', 'test', 'demo'];
      case 'responsive':
        return ['showcase', 'integration', 'testing', 'test', 'demo'];
      case 'test':
        return ['showcase', 'responsive', 'integration', 'testing', 'demo'];
      case 'demo':
        return ['showcase', 'responsive', 'integration', 'testing', 'test'];
      case 'testing':
        return ['showcase', 'responsive', 'integration', 'test', 'demo'];
      case 'integration':
        return ['showcase', 'search', 'search-demo', 'responsive', 'testing', 'test', 'demo'];
      default:
        return ['search', 'search-demo', 'showcase'];
    }
  };

  const visibleButtons = getVisibleButtons();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2 items-end">
      {/* Auth Header - Always visible */}
      <div className="order-first sm:order-last">
        <AuthHeader />
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {visibleButtons.map(buttonId => {
          const button = navButtons.find(b => b.id === buttonId);
          if (!button) return null;
          
          return (
            <button
              key={buttonId}
              onClick={() => setCurrentPage(buttonId)}
              className={`px-2 py-1 sm:px-3 sm:py-2 ${button.color} text-white rounded-lg transition-colors text-xs sm:text-sm`}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
