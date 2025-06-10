import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import GitHubLoginButton from '../components/auth/GitHubLoginButton';

const LoginPage = () => {
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginDev } = useAuth();

  // Demo users for quick access (manteniendo la funcionalidad pero usando API real)
  const demoUsers = [
    {
      id: 'admin',
      email: 'admin@dentalerp.com',
      first_name: 'Dr. Admin',
      last_name: 'Sistema',
      role: 'admin',
      avatar: '👨‍⚕️',
      description: 'Acceso completo al sistema',
      permissions: ['Gestión completa', 'Configuración', 'Reportes avanzados']
    },
    {
      id: 'dentist',
      email: 'dentista@dentalerp.com',
      first_name: 'Dr. Juan',
      last_name: 'Pérez',
      role: 'dentist',
      avatar: '🦷',
      description: 'Especialista en odontología',
      permissions: ['Gestión de pacientes', 'Tratamientos', 'Citas']
    },
    {
      id: 'receptionist',
      email: 'recepcion@dentalerp.com',
      first_name: 'María',
      last_name: 'González',
      role: 'receptionist',
      avatar: '👩‍💼',
      description: 'Gestión de citas y pacientes',
      permissions: ['Agendar citas', 'Registro pacientes', 'Reportes básicos']
    },
    {
      id: 'hygienist',
      email: 'higienista@dentalerp.com',
      first_name: 'Ana',
      last_name: 'Martínez',
      role: 'hygienist',
      avatar: '🧽',
      description: 'Higienista dental',
      permissions: ['Limpieza dental', 'Evaluaciones', 'Seguimiento']
    }
  ];

  const handleDemoLogin = async (demoUser) => {
    setIsLoading(true);
    try {
      // Usar la funcionalidad real de autenticación pero con datos demo
      await loginDev({
        email: demoUser.email,
        first_name: demoUser.first_name,
        last_name: demoUser.last_name,
        role: demoUser.role
      });
    } catch (error) {
      console.error('Error in demo login:', error);
    }
    setIsLoading(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-500',
      dentist: 'bg-blue-500',
      receptionist: 'bg-green-500',
      hygienist: 'bg-purple-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      dentist: 'Dentista',
      receptionist: 'Recepcionista',
      hygienist: 'Higienista'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Login form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">
                DentalERP
              </h1>
              <p className="text-gray-600 text-lg">Sistema de Gestión Dental Completo</p>
            </div>

            {/* Authentication options */}
            <div className="space-y-6">
              {/* Google OAuth */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <GoogleLoginButton />
              </div>

              {/* GitHub OAuth */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <GitHubLoginButton />
              </div>

              {/* Demo access */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">O accede como demo</span>
                </div>
              </div>

              <button
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center space-x-2"
              >
                <span>👥</span>
                <span>Usuarios Demo</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showDemoUsers ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Demo users grid */}
              {showDemoUsers && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 animate-fadeIn">
                  {demoUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleDemoLogin(user)}
                      disabled={isLoading}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white text-lg flex-shrink-0`}>
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {getRoleLabel(user.role)}
                          </p>
                          <p className="text-xs text-gray-400 leading-tight">
                            {user.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Terms */}
              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">
                  Al iniciar sesión, aceptas nuestros{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    términos de servicio
                  </a>{' '}
                  y{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    política de privacidad
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Features showcase */}
          <div className="hidden lg:block">
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Gestión Dental Moderna
                </h2>
                <p className="text-lg text-gray-600">
                  Todo lo que necesitas para administrar tu clínica dental
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gestión de Pacientes</h3>
                  <p className="text-sm text-gray-600">Historial médico completo y fácil acceso</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agenda Inteligente</h3>
                  <p className="text-sm text-gray-600">Programación automática y recordatorios</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Inventario</h3>
                  <p className="text-sm text-gray-600">Control de stock y suministros médicos</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reportes</h3>
                  <p className="text-sm text-gray-600">Análisis financiero y estadísticas</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">🚀 Demo Completo Disponible</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Explora todas las funcionalidades con datos reales de ejemplo
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">✓ Gestión completa</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">✓ Datos de prueba</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">✓ Sin limitaciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile features preview */}
        <div className="lg:hidden mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              ¿Nuevo en DentalERP?
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600">👥</span>
                </div>
                <p className="text-sm text-gray-600">Gestión de Pacientes</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600">📅</span>
                </div>
                <p className="text-sm text-gray-600">Agenda Digital</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600">📦</span>
                </div>
                <p className="text-sm text-gray-600">Control Inventario</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600">📊</span>
                </div>
                <p className="text-sm text-gray-600">Reportes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="font-medium text-gray-700">Iniciando sesión...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
