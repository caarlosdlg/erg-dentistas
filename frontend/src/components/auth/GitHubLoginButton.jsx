import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GitHubLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGitHub, loginWithGitHubDev, loginDev } = useAuth();
  const navigate = useNavigate();

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const isGitHubConfigured = GITHUB_CLIENT_ID && GITHUB_CLIENT_ID !== 'your-github-client-id';

  const handleGitHubLogin = async () => {
    if (!isGitHubConfigured) {
      // Use development mode if GitHub is not configured
      await handleDevelopmentLogin();
      return;
    }

    setIsLoading(true);
    try {
      // Redirect to GitHub OAuth
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
      
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error('Error iniciando autenticación con GitHub:', error);
      setIsLoading(false);
    }
  };

  const handleDevelopmentLogin = async () => {
    setIsLoading(true);
    
    console.log('🚀 GitHub Development Login - SIEMPRE redirige al dashboard');
    
    try {
      // Intentar login de desarrollo con GitHub
      await loginWithGitHubDev();
      console.log('✅ GitHub development login exitoso');
    } catch (error) {
      console.log('⚠️ Error en GitHub development login, usando fallback:', error.message);
      
      // Si falla, usar usuario predefinido
      try {
        await loginDev({
          email: 'github-fallback@dentalerp.com',
          first_name: 'GitHub',
          last_name: 'Fallback',
          role: 'user'
        });
      } catch (fallbackError) {
        console.error('❌ Error incluso con GitHub fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
      
      // SIEMPRE redirigir al dashboard
      console.log('🎯 SIEMPRE navegando a /dashboard desde GitHub button...');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isGitHubConfigured && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Autenticación con GitHub
          </p>
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span>Continuar con GitHub</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          {isGitHubConfigured ? 'O usa modo desarrollo:' : 'Modo desarrollo - GitHub OAuth no configurado'}
        </p>
        <button
          onClick={handleDevelopmentLogin}
          disabled={isLoading}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span>🔒 GitHub (Desarrollo)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GitHubLoginButton;
