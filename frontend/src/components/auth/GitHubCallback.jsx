import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const GitHubCallback = () => {
  const { loginWithGitHub } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Obtener el código de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Error en OAuth de GitHub:', error);
        // Redirigir de vuelta al login en caso de error
        window.location.href = '/';
        return;
      }

      if (code) {
        try {
          console.log('🔄 Procesando código de GitHub OAuth:', code);
          await loginWithGitHub(code);
          // El loginWithGitHub manejará la redirección después del login exitoso
        } catch (error) {
          console.error('Error procesando callback de GitHub:', error);
          // Redirigir de vuelta al login en caso de error
          window.location.href = '/';
        }
      } else {
        // No hay código, redirigir al login
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [loginWithGitHub]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Completando autenticación con GitHub...
        </h2>
        <p className="text-gray-500">
          Por favor espera mientras procesamos tu login
        </p>
      </div>
    </div>
  );
};

export default GitHubCallback;
