import React, { useState } from 'react';

/**
 * Design System Demo Page
 * Página de demostración del sistema de diseño DentalERP
 * Pure Tailwind CSS implementation - without UI components
 */
const DesignSystemDemo = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    priority: '',
    specialty: ''
  });

  // Helper function to get card classes based on variant
  const getCardClasses = (variant = 'default', interactive = false) => {
    const baseClasses = "rounded-lg p-6";
    
    const variantClasses = {
      'default': "bg-white border border-gray-200 shadow-sm",
      'elevated': "bg-white border border-gray-200 shadow-md",
      'outlined': "bg-white border-2 border-gray-300",
      'filled': "bg-gray-50 border border-gray-200",
      'gradient': "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
    };
    
    const interactiveClasses = interactive 
      ? "transition-all duration-200 hover:shadow-md cursor-pointer" 
      : "";
    
    return `${baseClasses} ${variantClasses[variant]} ${interactiveClasses}`;
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Helper function for button styles
  const getButtonClasses = (variant = 'primary', size = 'md', fullWidth = false, disabled = false, isLoading = false) => {
    const baseClasses = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const sizeClasses = {
      'sm': 'px-3 py-1.5 text-sm',
      'md': 'px-4 py-2',
      'lg': 'px-5 py-2 text-lg',
      'xl': 'px-6 py-3 text-lg'
    };
    
    const variantClasses = {
      'primary': `bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'secondary': `bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 
                   ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'outline': `border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'ghost': `text-gray-600 hover:bg-gray-100 focus:ring-primary-500 
               ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'success': `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'warning': `bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'danger': `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      'info': `bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = isLoading ? 'relative !text-transparent' : '';
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${loadingClass}`;
  };
  
  // Helper function for badge styles
  const getBadgeClasses = (variant = 'primary', size = 'md') => {
    const baseClasses = "inline-flex items-center rounded-full font-medium";
    
    const sizeClasses = {
      'sm': 'px-2 py-0.5 text-xs',
      'md': 'px-2.5 py-0.5 text-sm',
      'lg': 'px-3 py-1 text-base'
    };
    
    const variantClasses = {
      'primary': 'bg-primary-100 text-primary-800',
      'secondary': 'bg-secondary-100 text-secondary-800',
      'success': 'bg-green-100 text-green-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
      'info': 'bg-blue-100 text-blue-800'
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };
  
  // Helper function for loading spinner 
  const getLoadingSpinner = (variant = 'spinner', size = 'md', text = '') => {
    const sizeValues = {
      'sm': 'w-4 h-4',
      'md': 'w-6 h-6',
      'lg': 'w-8 h-8',
      'xl': 'w-10 h-10'
    };
    
    // Common wrapper classes
    const wrapperClasses = "flex items-center justify-center";
    
    // Render spinner
    if (variant === 'spinner') {
      return (
        <div className={`${wrapperClasses} ${text ? 'space-x-2' : ''}`}>
          <svg className={`${sizeValues[size]} text-primary-600 animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
      );
    }
    
    // Render dots
    if (variant === 'dots') {
      const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3';
      return (
        <div className={`${wrapperClasses} ${text ? 'space-x-2' : ''}`}>
          <div className="flex space-x-1">
            <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${dotSize} bg-primary-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
          {text && <span className="text-sm text-gray-600 ml-2">{text}</span>}
        </div>
      );
    }
    
    // Render pulse
    if (variant === 'pulse') {
      return (
        <div className={`${wrapperClasses} ${text ? 'space-x-2' : ''}`}>
          <div className={`${sizeValues[size]} rounded-full bg-primary-600 animate-pulse`}></div>
          {text && <span className="text-sm text-gray-600 ml-2">{text}</span>}
        </div>
      );
    }
    
    // Render bars
    if (variant === 'bars') {
      const barWidth = size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-2.5';
      const barHeight = size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : size === 'lg' ? 'h-5' : 'h-6';
      
      return (
        <div className={`${wrapperClasses} ${text ? 'space-x-2' : ''}`}>
          <div className="flex items-end space-x-1">
            <div className={`${barWidth} ${barHeight} bg-primary-600 animate-pulse`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${barWidth} ${barHeight} bg-primary-600 animate-pulse`} style={{ animationDelay: '150ms', animationDuration: '800ms' }}></div>
            <div className={`${barWidth} ${barHeight} bg-primary-600 animate-pulse`} style={{ animationDelay: '300ms' }}></div>
          </div>
          {text && <span className="text-sm text-gray-600 ml-2">{text}</span>}
        </div>
      );
    }
    
    return null;
  };
  
  // Input field with label component
  const InputField = ({ 
    label, 
    type = 'text', 
    placeholder = '', 
    value = '', 
    onChange, 
    variant = 'default', 
    leftIcon, 
    error = false,
    errorMessage = '',
    helperText = '',
    required = false,
    ...props 
  }) => {
    const inputClasses = `w-full rounded-md px-3 py-2 ${
      variant === 'filled' 
        ? 'bg-gray-100 border border-gray-200 focus:bg-white' 
        : variant === 'outlined'
          ? 'bg-white border-2 border-gray-300' 
          : 'bg-white border border-gray-300'
    } ${
      error 
        ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'focus:ring-primary-500 focus:border-primary-500'
    } ${leftIcon ? 'pl-10' : ''}`;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  };
  
  // Textarea component
  const TextareaField = ({
    label,
    placeholder = '',
    value = '',
    onChange,
    rows = 3,
    variant = 'default',
    error = false,
    errorMessage = '',
    helperText = '',
    required = false,
    ...props
  }) => {
    const textareaClasses = `w-full rounded-md px-3 py-2 ${
      variant === 'filled' 
        ? 'bg-gray-100 border border-gray-200 focus:bg-white' 
        : variant === 'outlined'
          ? 'bg-white border-2 border-gray-300' 
          : 'bg-white border border-gray-300'
    } ${
      error 
        ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'focus:ring-primary-500 focus:border-primary-500'
    }`;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          className={textareaClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  };
  
  // Select component
  const SelectField = ({
    label,
    placeholder = '',
    value = '',
    onChange,
    options = [],
    variant = 'default',
    leftIcon,
    error = false,
    errorMessage = '',
    helperText = '',
    required = false,
    children,
    ...props
  }) => {
    const selectClasses = `w-full rounded-md px-3 py-2 ${
      variant === 'filled' 
        ? 'bg-gray-100 border border-gray-200 focus:bg-white' 
        : variant === 'outlined'
          ? 'bg-white border-2 border-gray-300' 
          : 'bg-white border border-gray-300'
    } ${
      error 
        ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' 
        : 'focus:ring-primary-500 focus:border-primary-500'
    } ${leftIcon ? 'pl-10' : ''}`;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <select
            className={selectClasses}
            value={value}
            onChange={onChange}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.length > 0 ? 
              options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))
              : children
            }
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  };
  
  // Button component
  const Button = ({ 
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    disabled = false,
    loading = false,
    onClick,
    ...props
  }) => {
    return (
      <button
        className={getButtonClasses(variant, size, fullWidth, disabled, loading)}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {children}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>
    );
  };
  
  // Badge component
  const Badge = ({ variant = 'primary', size = 'md', children }) => {
    return (
      <span className={getBadgeClasses(variant, size)}>
        {children}
      </span>
    );
  };
  
  // Modal component
  const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
      'sm': 'max-w-md',
      'md': 'max-w-lg',
      'lg': 'max-w-2xl',
      'xl': 'max-w-4xl',
      'full': 'max-w-full mx-4'
    };
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={onClose}
          ></div>
          
          {/* Modal content */}
          <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full p-6 z-10 transform transition-all`}>
            {/* Header */}
            {title && (
              <div className="mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Table component
  const Table = ({ 
    data = [], 
    columns = [], 
    variant = 'default',
    size = 'md',
    striped = false,
    hoverable = false,
    emptyMessage = 'No data available',
    loading = false
  }) => {
    const tableClasses = `min-w-full divide-y divide-gray-200 ${
      variant === 'bordered' ? 'border border-gray-200' : ''
    }`;
    
    const thClasses = `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
      size === 'sm' ? 'py-2' : size === 'lg' ? 'py-4' : ''
    }`;
    
    const tdClasses = `px-6 py-4 whitespace-nowrap ${
      size === 'sm' ? 'py-2 text-sm' : size === 'lg' ? 'py-4' : ''
    }`;
    
    // If loading, show skeleton table
    if (loading) {
      return (
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            {getLoadingSpinner('spinner', 'lg')}
          </div>
          <table className={tableClasses}>
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} scope="col" className={thClasses}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(3)].map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className={tdClasses}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    // If no data, show empty message
    if (data.length === 0) {
      return (
        <div className="text-center py-8 bg-white">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  scope="col" 
                  className={`${thClasses} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr 
                key={row.id || rowIdx} 
                className={`${striped && rowIdx % 2 !== 0 ? 'bg-gray-50' : ''} ${hoverable ? 'hover:bg-gray-50' : ''}`}
              >
                {columns.map((column, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={`${tdClasses} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {column.render 
                      ? column.render(row[column.dataIndex], row) 
                      : row[column.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Navigation component
  const Navigation = ({
    variant = 'sidebar',
    items = [],
    currentPath = '',
    collapsed = false,
    logo,
    userInfo,
  }) => {
    const [openDropdowns, setOpenDropdowns] = useState({});
    
    const toggleDropdown = (path) => {
      setOpenDropdowns(prev => ({
        ...prev,
        [path]: !prev[path]
      }));
    };
    
    if (variant === 'sidebar') {
      return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
          {/* Logo & Brand */}
          <div className="p-4 border-b border-gray-200">
            {logo}
          </div>
          
          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = currentPath === item.path || (item.children && item.children.some(child => child.path === currentPath));
                const hasChildren = item.children && item.children.length > 0;
                
                return (
                  <li key={item.path}>
                    <div 
                      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                        isActive 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => hasChildren && toggleDropdown(item.path)}
                    >
                      <div className="flex items-center">
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
                      </div>
                      {hasChildren && (
                        <svg 
                          className={`w-4 h-4 transition-transform ${openDropdowns[item.path] ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Dropdown Items */}
                    {hasChildren && openDropdowns[item.path] && (
                      <ul className="pl-10 mt-1 space-y-1">
                        {item.children.map(child => (
                          <li key={child.path}>
                            <a 
                              className={`block px-3 py-2 text-sm rounded-md cursor-pointer ${
                                currentPath === child.path 
                                  ? 'bg-primary-50 text-primary-600' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User Info */}
          {userInfo && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                {userInfo.avatar && (
                  <img 
                    src={userInfo.avatar} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full mr-3"
                  />
                )}
                <div className={collapsed ? 'sr-only' : ''}>
                  <p className="font-medium text-gray-700">{userInfo.name}</p>
                  {userInfo.role && (
                    <p className="text-xs text-gray-500">{userInfo.role}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (variant === 'topbar') {
      return (
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Logo */}
            <div className="flex items-center">
              {logo}
            </div>
            
            {/* Nav Items */}
            <div className="hidden md:flex items-center space-x-4">
              {items.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <div key={item.path} className="relative group">
                    <a
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </a>
                    
                    {/* Dropdown for items with children */}
                    {item.children && item.children.length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                        {item.children.map(child => (
                          <a 
                            key={child.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* User Info */}
            {userInfo && (
              <div className="flex items-center">
                {userInfo.avatar && (
                  <img 
                    src={userInfo.avatar} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{userInfo.name}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Navigation items
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      label: 'Pacientes',
      path: '/patients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      children: [
        { label: 'Lista de Pacientes', path: '/patients/list' },
        { label: 'Nuevo Paciente', path: '/patients/new' },
        { label: 'Historial Médico', path: '/patients/history' }
      ]
    },
    {
      label: 'Citas',
      path: '/appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Tratamientos',
      path: '/treatments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Sistema de Diseño DentalERP
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Componentes reutilizables diseñados para crear interfaces coherentes y profesionales 
            en el sistema de gestión dental. Basado en Tailwind CSS con una paleta de colores 
            específica para el sector médico.
          </p>
        </div>

        {/* Color Palette */}
        <div className={`mb-8 ${getCardClasses()}`}>
          <h2 className="text-2xl font-semibold mb-6">Paleta de Colores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Colors */}
            <div>
              <h3 className="text-lg font-medium mb-4">Colores Primarios (Azul Dental)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className={`h-12 rounded-md bg-primary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs mt-1 text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Colors */}
            <div>
              <h3 className="text-lg font-medium mb-4">Colores Secundarios (Verde Médico)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className={`h-12 rounded-md bg-secondary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs mt-1 text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className={`mb-8 ${getCardClasses()}`}>
          <h2 className="text-2xl font-semibold mb-6">Tipografía</h2>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1 - Para títulos principales</h1>
              <p className="text-neutral-600 text-sm mt-1">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2 - Para secciones importantes</h2>
              <p className="text-neutral-600 text-sm mt-1">text-3xl font-semibold</p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Heading 3 - Para subsecciones</h3>
              <p className="text-neutral-600 text-sm mt-1">text-2xl font-medium</p>
            </div>
            <div>
              <p className="text-base">
                Texto normal - Para contenido general y descripciones largas. 
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p className="text-neutral-600 text-sm mt-1">text-base</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">
                Texto secundario - Para información complementaria y metadatos
              </p>
              <p className="text-neutral-600 text-sm mt-1">text-sm text-neutral-600</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={`mb-8 ${getCardClasses()}`}>
          <h2 className="text-2xl font-semibold mb-6">Botones</h2>
          
          <div className="space-y-6">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones Primarios</h3>
              <div className="flex flex-wrap gap-4">
                <button className={getButtonClasses('primary', 'sm')}>Pequeño</button>
                <button className={getButtonClasses('primary', 'md')}>Mediano</button>
                <button className={getButtonClasses('primary', 'lg')}>Grande</button>
                <button className={getButtonClasses('primary', 'xl')}>Extra Grande</button>
                <button 
                  className={getButtonClasses('primary', 'md', false, false, loading)}
                  onClick={handleLoadingDemo}
                >
                  {loading ? 'Cargando...' : 'Con Loading'}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
                <button className={getButtonClasses('primary', 'md', false, true)} disabled>
                  Deshabilitado
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones Secundarios</h3>
              <div className="flex flex-wrap gap-4">
                <button className={getButtonClasses('secondary')}>Secundario</button>
                <button className={getButtonClasses('outline')}>Outline</button>
                <button className={getButtonClasses('ghost')}>Ghost</button>
              </div>
            </div>

            {/* State Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones de Estado</h3>
              <div className="flex flex-wrap gap-4">
                <button className={getButtonClasses('success')}>Éxito</button>
                <button className={getButtonClasses('warning')}>Advertencia</button>
                <button className={getButtonClasses('danger')}>Peligro</button>
                <button className={getButtonClasses('info')}>Información</button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botón de Ancho Completo</h3>
              <button className={getButtonClasses('primary', 'md', true)}>
                Botón de Ancho Completo
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tarjetas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Por Defecto</h3>
              <p className="text-neutral-600 mb-4">
                Contenido de la tarjeta con estilo por defecto.
              </p>
              <Button variant="primary" size="sm">Acción</Button>
            </Card>

            <Card variant="elevated">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Elevada</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con sombra más pronunciada para destacar.
              </p>
              <Button variant="secondary" size="sm">Acción</Button>
            </Card>

            <Card variant="outlined">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Outlined</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con borde marcado y sin sombra.
              </p>
              <Button variant="outline" size="sm">Acción</Button>
            </Card>

            <Card variant="filled">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Filled</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con fondo gris claro.
              </p>
              <Button variant="ghost" size="sm">Acción</Button>
            </Card>

            <Card variant="gradient">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Gradiente</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con gradiente sutil de marca.
              </p>
              <Button variant="primary" size="sm">Acción</Button>
            </Card>

            <Card interactive>
              <h3 className="text-lg font-semibold mb-2">Tarjeta Interactiva</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con efectos hover para interacción.
              </p>
              <Button variant="info" size="sm">Acción</Button>
            </Card>
          </div>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Tamaños</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="primary" size="sm">Pequeño</Badge>
                <Badge variant="primary" size="md">Mediano</Badge>
                <Badge variant="primary" size="lg">Grande</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="primary">Primario</Badge>
                <Badge variant="secondary">Secundario</Badge>
                <Badge variant="success">Éxito</Badge>
                <Badge variant="warning">Advertencia</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Información</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Casos de Uso</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span>Estado del paciente:</span>
                  <Badge variant="success">Activo</Badge>
                  <Badge variant="warning">Pendiente</Badge>
                  <Badge variant="error">Inactivo</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span>Prioridad de cita:</span>
                  <Badge variant="error">Urgente</Badge>
                  <Badge variant="warning">Alta</Badge>
                  <Badge variant="info">Normal</Badge>
                  <Badge variant="secondary">Baja</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span>Estado de tratamiento:</span>
                  <Badge variant="primary">En progreso</Badge>
                  <Badge variant="success">Completado</Badge>
                  <Badge variant="warning">Pausado</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Components */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componentes de Formulario</h2>
          
          <div className="space-y-8">
            {/* Input Fields */}
            <div>
              <h3 className="text-lg font-medium mb-4">Campos de Entrada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  placeholder="Ingrese su nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  variant="filled"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />
                <Input
                  label="Teléfono"
                  placeholder="(555) 123-4567"
                  variant="outlined"
                  error={false}
                  helperText="Incluya código de área"
                />
                <Input
                  label="Campo con Error"
                  placeholder="Ejemplo de error"
                  error={true}
                  errorMessage="Este campo es requerido"
                />
              </div>
            </div>

            {/* Textarea */}
            <div>
              <h3 className="text-lg font-medium mb-4">Área de Texto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textarea
                  label="Observaciones"
                  placeholder="Escriba sus observaciones aquí..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                />
                <Textarea
                  label="Notas Adicionales"
                  placeholder="Información adicional..."
                  variant="filled"
                  rows={4}
                  helperText="Máximo 500 caracteres"
                />
              </div>
            </div>

            {/* Select Fields */}
            <div>
              <h3 className="text-lg font-medium mb-4">Campos de Selección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Prioridad"
                  placeholder="Seleccione una prioridad"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  options={[
                    { value: 'low', label: 'Baja' },
                    { value: 'medium', label: 'Media' },
                    { value: 'high', label: 'Alta' },
                    { value: 'urgent', label: 'Urgente' }
                  ]}
                />
                <Select
                  label="Especialidad"
                  placeholder="Seleccione especialidad"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  variant="filled"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  }
                >
                  <option value="orthodontics">Ortodoncia</option>
                  <option value="endodontics">Endodoncia</option>
                  <option value="surgery">Cirugía Oral</option>
                  <option value="periodontics">Periodoncia</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Modal Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente Modal</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Abrir Modal
              </Button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Ejemplo de Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  Este es un ejemplo de modal con el diseño del sistema DentalERP. 
                  Los modales son útiles para formularios, confirmaciones y mostrar información detallada.
                </p>
                
                <div className="space-y-3">
                  <Input
                    label="Nombre del Paciente"
                    placeholder="Ingrese el nombre"
                  />
                  <Select
                    label="Tipo de Cita"
                    placeholder="Seleccione el tipo"
                    options={[
                      { value: 'consultation', label: 'Consulta' },
                      { value: 'cleaning', label: 'Limpieza' },
                      { value: 'treatment', label: 'Tratamiento' }
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary">
                    Guardar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </Card>

        {/* Loading Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Carga</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Variantes de Loading</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <Loading variant="spinner" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Spinner</p>
                </div>
                <div className="text-center">
                  <Loading variant="dots" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Dots</p>
                </div>
                <div className="text-center">
                  <Loading variant="pulse" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Pulse</p>
                </div>
                <div className="text-center">
                  <Loading variant="bars" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Bars</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Con Texto</h3>
              <div className="flex justify-center">
                <Loading variant="spinner" size="md" text="Cargando datos del paciente..." />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Diferentes Tamaños</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <Loading variant="spinner" size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Pequeño</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="md" />
                  <p className="text-xs text-gray-600 mt-1">Mediano</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="lg" />
                  <p className="text-xs text-gray-600 mt-1">Grande</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="xl" />
                  <p className="text-xs text-gray-600 mt-1">Extra Grande</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Table Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Tabla</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Tabla de Dentistas</h3>
              <Table
                data={tableData}
                columns={tableColumns}
                variant="default"
                size="md"
                striped={true}
                hoverable={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Tabla Vacía</h3>
              <Table
                data={[]}
                columns={tableColumns}
                emptyMessage="No hay dentistas registrados"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Tabla Cargando</h3>
              <Table
                data={[]}
                columns={tableColumns}
                loading={true}
              />
            </div>
          </div>
        </Card>

        {/* Navigation Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Navegación</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Navegación Lateral</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <Navigation
                  variant="sidebar"
                  items={navItems}
                  currentPath="/patients"
                  collapsed={false}
                  logo={
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">DE</span>
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">DentalERP</span>
                    </div>
                  }
                  userInfo={{
                    name: "Dr. Juan Pérez",
                    role: "Administrador",
                    avatar: "https://via.placeholder.com/32x32/0066cc/ffffff?text=JP"
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Navegación Superior</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Navigation
                  variant="topbar"
                  items={navItems}
                  currentPath="/dashboard"
                  logo={
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">DE</span>
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">DentalERP</span>
                    </div>
                  }
                  userInfo={{
                    name: "Dr. Juan Pérez",
                    avatar: "https://via.placeholder.com/32x32/0066cc/ffffff?text=JP"
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Guías de Uso</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Colores</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li><strong>Azul Primario:</strong> Para acciones principales y elementos de navegación</li>
                <li><strong>Verde Secundario:</strong> Para confirmaciones y estados positivos</li>
                <li><strong>Rojo:</strong> Para alertas, errores y acciones destructivas</li>
                <li><strong>Amarillo:</strong> Para advertencias y elementos que requieren atención</li>
                <li><strong>Azul Claro:</strong> Para información neutral y elementos informativos</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Tipografía</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li><strong>Inter:</strong> Fuente principal para interfaces y contenido general</li>
                <li><strong>Poppins:</strong> Fuente secundaria para títulos y elementos destacados</li>
                <li>Usar jerarquía clara: H1 para páginas, H2 para secciones, H3 para subsecciones</li>
                <li>Mantener contraste adecuado para accesibilidad</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Espaciado</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Usar escala de espaciado consistente (4, 8, 12, 16, 24, 32px)</li>
                <li>Mayor espaciado entre secciones diferentes</li>
                <li>Espaciado uniforme dentro de grupos relacionados</li>
                <li>Considerar responsive design en todos los breakpoints</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Accesibilidad</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Contraste mínimo 4.5:1 para texto normal</li>
                <li>Contraste mínimo 3:1 para texto grande</li>
                <li>Focus indicators visibles en todos los elementos interactivos</li>
                <li>Uso de atributos ARIA apropiados</li>
                <li>Navegación por teclado en todos los componentes</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo;
