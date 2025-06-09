import React, { useState } from 'react';
import { Lock, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DevLoginModal from './DevLoginModal';

const AuthHeader = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  console.log('🔍 AuthHeader renderizando:', { 
    user, 
    isAuthenticated: isAuthenticated(), 
    isLoading,
    showLoginModal 
  });

  const handleLogout = () => {
    console.log('🔄 Ejecutando logout desde AuthHeader...');
    logout();
    setShowUserMenu(false);
  };

  const handleOpenLoginModal = () => {
    console.log('🔄 Abriendo modal de login...');
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    console.log('🔄 Cerrando modal de login...');
    setShowLoginModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  if (isAuthenticated()) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">
            {user?.first_name} {user?.last_name}
          </span>
          <span className="text-xs bg-green-200 px-2 py-1 rounded">
            {user?.role === 'admin' ? 'Admin' : 'Usuario'}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  {user?.google_id && (
                    <div className="text-xs text-blue-600">Conectado con Google</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenLoginModal}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">🔒 Iniciar Sesión (Desarrollo)</span>
      </button>

      <DevLoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
      />
    </>
  );
};

export default AuthHeader;
