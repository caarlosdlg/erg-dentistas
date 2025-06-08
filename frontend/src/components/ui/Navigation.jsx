import React, { useState } from 'react';
import clsx from 'clsx';

const Navigation = ({
  variant = 'sidebar',
  items = [],
  currentPath = '',
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  logo,
  userInfo,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses = {
    sidebar: 'h-screen bg-white border-r border-gray-200 flex flex-col',
    topbar: 'w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4',
    mobile: 'fixed inset-0 z-50 bg-white'
  };

  const NavigationItem = ({ item, level = 0 }) => {
    const isActive = currentPath === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(false);

    const itemClasses = clsx(
      'flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-200',
      isActive && 'bg-primary-50 text-primary-600 border-r-2 border-primary-600',
      level > 0 && 'pl-8',
      collapsed && variant === 'sidebar' && 'justify-center px-2'
    );

    return (
      <div>
        <button
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            } else {
              onNavigate?.(item.path);
            }
          }}
          className={itemClasses}
        >
          {item.icon && (
            <span className={clsx(
              'flex-shrink-0',
              collapsed && variant === 'sidebar' ? 'mr-0' : 'mr-3'
            )}>
              {item.icon}
            </span>
          )}
          
          {(!collapsed || variant !== 'sidebar') && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {hasChildren && (
                <svg
                  className={clsx(
                    'w-4 h-4 transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && (!collapsed || variant !== 'sidebar') && (
          <div className="border-l-2 border-gray-200 ml-4">
            {item.children.map((child, index) => (
              <NavigationItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (variant === 'topbar') {
    return (
      <nav className={clsx(baseClasses.topbar, className)} {...props}>
        {logo && (
          <div className="flex items-center">
            {logo}
          </div>
        )}
        
        <div className="hidden md:flex items-center space-x-8">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate?.(item.path)}
              className={clsx(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                currentPath === item.path
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {userInfo && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{userInfo.name}</span>
              {userInfo.avatar && (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 md:hidden">
            <div className="py-2">
              {items.map((item, index) => (
                <NavigationItem key={index} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav 
      className={clsx(
        baseClasses.sidebar,
        collapsed ? 'w-16' : 'w-64',
        'transition-all duration-300',
        className
      )} 
      {...props}
    >
      {/* Header */}
      <div className={clsx(
        'flex items-center justify-between p-4 border-b border-gray-200',
        collapsed && 'justify-center'
      )}>
        {logo && (!collapsed || variant !== 'sidebar') && (
          <div className="flex items-center">
            {logo}
          </div>
        )}
        
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              className={clsx(
                'w-5 h-5 transition-transform duration-200',
                collapsed && 'rotate-180'
              )}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {items.map((item, index) => (
          <NavigationItem key={index} item={item} />
        ))}
      </div>

      {/* User Info */}
      {userInfo && (
        <div className={clsx(
          'border-t border-gray-200 p-4',
          collapsed && 'text-center'
        )}>
          <div className={clsx(
            'flex items-center',
            collapsed ? 'justify-center' : 'space-x-3'
          )}>
            {userInfo.avatar && (
              <img
                src={userInfo.avatar}
                alt={userInfo.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userInfo.role}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
