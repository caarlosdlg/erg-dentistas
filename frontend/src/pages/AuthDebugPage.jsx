import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthDebugPage = () => {
  const { user, tokens, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  const debugInfo = {
    // Estado del contexto
    contextState: {
      user: user,
      hasTokens: !!tokens,
      isLoading,
      isAuthenticated: isAuthenticated(),
    },
    // Estado del localStorage
    localStorage: {
      userStored: localStorage.getItem('dental_erp_user'),
      tokensStored: localStorage.getItem('dental_erp_tokens'),
    },
    // Info de navegación
    navigation: {
      currentPath: location.pathname,
      search: location.search,
      fullURL: window.location.href,
    },
    // Info del token
    tokenInfo: tokens?.access ? (() => {
      try {
        const payload = JSON.parse(atob(tokens.access.split('.')[1]));
        return {
          userId: payload.user_id,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString(),
          isExpired: payload.exp < (Date.now() / 1000)
        };
      } catch (e) {
        return { error: 'Cannot parse token' };
      }
    })() : null
  };

  const clearAuth = () => {
    localStorage.removeItem('dental_erp_user');
    localStorage.removeItem('dental_erp_tokens');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🔍 Debug de Autenticación</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado del Contexto */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Estado del Contexto</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo.contextState, null, 2)}
            </pre>
          </div>

          {/* LocalStorage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">LocalStorage</h2>
            <div className="space-y-2">
              <div>
                <strong>Usuario:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-32">
                  {debugInfo.localStorage.userStored || 'No almacenado'}
                </pre>
              </div>
              <div>
                <strong>Tokens:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-32">
                  {debugInfo.localStorage.tokensStored ? 
                    JSON.stringify(JSON.parse(debugInfo.localStorage.tokensStored), null, 2) : 
                    'No almacenado'
                  }
                </pre>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Navegación</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo.navigation, null, 2)}
            </pre>
          </div>

          {/* Info del Token */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Info del Token</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo.tokenInfo, null, 2) || 'No hay token'}
            </pre>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Acciones</h2>
          <div className="space-x-4">
            <button 
              onClick={clearAuth}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Limpiar Autenticación
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Ir al Login
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>

        {/* Estado en Tiempo Real */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Estado en Tiempo Real</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className={`p-4 rounded ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-semibold">Usuario</div>
              <div>{user ? '✅ Logueado' : '❌ No logueado'}</div>
            </div>
            <div className={`p-4 rounded ${tokens ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-semibold">Tokens</div>
              <div>{tokens ? '✅ Disponibles' : '❌ No disponibles'}</div>
            </div>
            <div className={`p-4 rounded ${isAuthenticated() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-semibold">Autenticado</div>
              <div>{isAuthenticated() ? '✅ Sí' : '❌ No'}</div>
            </div>
            <div className={`p-4 rounded ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              <div className="font-semibold">Loading</div>
              <div>{isLoading ? '⏳ Cargando' : '✅ Listo'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
