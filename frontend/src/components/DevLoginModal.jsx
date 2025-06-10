import React, { useState } from 'react';
import { Lock, User, Mail, Chrome, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DevLoginModal = ({ isOpen, onClose }) => {
  const { loginDev, loginWithGoogleDev, loginWithGitHubDev, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'dev@dentalerp.com',
    first_name: 'Usuario',
    last_name: 'Desarrollo'
  });
  const [loginType, setLoginType] = useState('credentials'); // 'credentials', 'google', or 'github'

  console.log('🔍 DevLoginModal renderizando:', { isOpen, isLoading });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔄 Iniciando login desde modal...', formData);
    try {
      if (loginType === 'google') {
        console.log('🔄 Login con Google...');
        await loginWithGoogleDev();
      } else if (loginType === 'github') {
        console.log('🔄 Login con GitHub...');
        await loginWithGitHubDev();
      } else {
        console.log('🔄 Login con credenciales...', formData);
        await loginDev(formData);
      }
      console.log('✅ Login exitoso, cerrando modal...');
      onClose();
    } catch (error) {
      console.error('❌ Error en login de desarrollo:', error);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔄 Iniciando Google login...');
    setLoginType('google');
    try {
      await loginWithGoogleDev();
      console.log('✅ Google login exitoso, cerrando modal...');
      onClose();
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
    }
  };

  const handleGitHubLogin = async () => {
    console.log('🔄 Iniciando GitHub login...');
    setLoginType('github');
    try {
      await loginWithGitHubDev();
      console.log('✅ GitHub login exitoso, cerrando modal...');
      onClose();
    } catch (error) {
      console.error('❌ Error en login con GitHub:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lock className="w-6 h-6 mr-2 text-blue-600" />
            Iniciar Sesión (Desarrollo)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Modo Desarrollo:</strong> Este login es solo para pruebas. 
            No requiere credenciales reales.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="usuario@dentalerp.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apellido"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading && loginType === 'credentials' ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando Sesión...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
            >
              {isLoading && loginType === 'google' ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Conectando con Google...
                </>
              ) : (
                <>
                  <Chrome className="w-4 h-4 mr-2 text-blue-500" />
                  Continuar con Google
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading && loginType === 'github' ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Conectando con GitHub...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Continuar con GitHub
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            Este es un entorno de desarrollo. Los datos son simulados y no se envían a ningún servidor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevLoginModal;
