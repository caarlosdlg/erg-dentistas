import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      const { tokens } = useAuth();
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          refresh_token: tokens?.refresh,
        }),
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      logout();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user.google_profile?.picture ? (
          <img
            src={user.google_profile.picture}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-8 h-8 rounded-full"
          />
        ) : user.github_profile?.avatar_url ? (
          <img
            src={user.github_profile.avatar_url}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {user.first_name?.[0] || user.email?.[0] || 'U'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.first_name || user.email}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isMenuOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <button
            onClick={() => {/* Aquí podrías abrir un modal de perfil */}}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Ver perfil
          </button>
          
          <button
            onClick={() => {/* Aquí podrías abrir configuración */}}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Configuración
          </button>
          
          <hr className="my-1" />
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
