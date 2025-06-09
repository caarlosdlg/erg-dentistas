import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginTest = () => {
  const { user, isAuthenticated, loginDev, logout, isLoading } = useAuth();

  const handleTestLogin = async () => {
    console.log('🔄 Iniciando test de login...');
    try {
      const result = await loginDev({
        email: 'test@dentalerp.com',
        first_name: 'Test',
        last_name: 'User'
      });
      console.log('✅ Login exitoso:', result);
    } catch (error) {
      console.error('❌ Error en login:', error);
    }
  };

  const handleTestLogout = () => {
    console.log('🔄 Iniciando logout...');
    logout();
    console.log('✅ Logout completado');
  };

  console.log('🔍 Estado actual:', { 
    user, 
    isAuthenticated: isAuthenticated(), 
    isLoading 
  });

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-yellow-800">🧪 Debug Login Test</h3>
      
      <div className="space-y-2 text-sm mb-4">
        <p><strong>Autenticado:</strong> <span className={isAuthenticated() ? 'text-green-600' : 'text-red-600'}>{isAuthenticated() ? '✅ Sí' : '❌ No'}</span></p>
        <p><strong>Cargando:</strong> <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>{isLoading ? '⏳ Sí' : '✅ No'}</span></p>
        <p><strong>Usuario:</strong> {user ? `${user.first_name} ${user.last_name} (${user.email})` : '❌ Ninguno'}</p>
        <p><strong>Context disponible:</strong> <span className="text-green-600">✅ Sí</span></p>
      </div>

      <div className="space-x-2">
        <button
          onClick={handleTestLogin}
          disabled={isLoading || isAuthenticated()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Cargando...' : '🔑 Test Login Directo'}
        </button>
        
        {isAuthenticated() && (
          <button
            onClick={handleTestLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🚪 Logout
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>👀 Revisa la consola del navegador para logs detallados</p>
      </div>
    </div>
  );
};

export default LoginTest;
