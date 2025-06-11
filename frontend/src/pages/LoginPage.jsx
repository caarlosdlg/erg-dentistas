import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton, { CustomGoogleButton } from '../components/auth/GoogleLoginButton';
import { Container, CardTW, Alert } from '../components/ui';

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";

/**
 * LoginPage Component
 * Página de inicio de sesión con autenticación de Google
 */
const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const [error, setError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleLoginSuccess = (result) => {
    console.log('Login exitoso:', result);
    setError(null);
    // La navegación se manejará automáticamente por el redirect arriba
  };

  const handleLoginError = (error) => {
    console.error('Error de login:', error);
    setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    setLoginLoading(false);
  };

  const handleCustomLogin = () => {
    setLoginLoading(true);
    setError(null);
    // El loading se manejará en el componente GoogleLoginButton
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="sm" className="w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦷</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DentalERP
            </h1>
            <p className="text-gray-600">
              Sistema de gestión para clínicas dentales
            </p>
          </div>

          <CardTW className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600">
                Accede a tu cuenta con Google
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}

            <div className="space-y-4">
              {/* Botón de Google OAuth estándar */}
              <div>
                <GoogleLoginButton
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  disabled={loginLoading}
                  text="continue_with"
                />
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Botón personalizado */}
              <CustomGoogleButton
                onClick={handleCustomLogin}
                loading={loginLoading}
                disabled={loginLoading}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </CardTW>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para acceder?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Contacta soporte
              </a>
            </p>
          </div>
        </Container>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
