import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ButtonTW } from '../ui';

/**
 * UserProfile Component
 * Muestra el perfil del usuario autenticado en la navegación
 */
const UserProfile = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {user.name || 'Usuario'}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-32">
            {user.email}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // TODO: Implementar vista de perfil
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4 mr-3" />
              Ver Perfil
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // TODO: Implementar configuración
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Configuración
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * LoginButton Component
 * Botón para mostrar cuando el usuario no está autenticado
 */
export const LoginButton = ({ className = '' }) => {
  return (
    <ButtonTW
      variant="primary"
      size="sm"
      onClick={() => window.location.href = '/login'}
      className={className}
    >
      Iniciar Sesión
    </ButtonTW>
  );
};

export default UserProfile;
