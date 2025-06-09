import React, { useState } from 'react';
import { Lock, User, Mail, Chrome, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DevLoginModal = ({ isOpen, onClose }) => {
  const { loginDev, loginWithGoogleDev, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'dev@dentalerp.com',
    first_name: 'Usuario',
    last_name: 'Desarrollo'
  });
  const [loginType, setLoginType] = useState('credentials'); // 'credentials' or 'google'

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
