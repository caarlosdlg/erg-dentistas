import React, { useState } from 'react';
import { Card, Button, Input, Flex } from '../components/ui';

/**
 * Login Component - Real authentication system
 */
const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo users for quick testing
  const demoUsers = [
    {
      email: 'admin@dentalerp.com',
      password: 'admin123',
      role: 'admin',
      name: 'Dr. Admin Sistema',
      specialty: 'Administrador'
    },
    {
      email: 'doctor@dentalerp.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Juan Pérez',
      specialty: 'Odontología General'
    },
    {
      email: 'recepcion@dentalerp.com',
      password: 'recepcion123',
      role: 'receptionist',
      name: 'María González',
      specialty: 'Recepcionista'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check demo users
      const user = demoUsers.find(u => 
        u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Successful login
        const userData = {
          id: Date.now(),
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
          isAuthenticated: true,
          token: 'demo-jwt-token-' + Date.now()
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('dentalerp_user', JSON.stringify(userData));
        
        onLogin(userData);
      } else {
        setError('Credenciales incorrectas. Use uno de los usuarios demo.');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUser) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <Card.Content className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🦷</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DentalERP</h1>
              <p className="text-gray-600">Sistema de Gestión Dental</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap={4}>
                <Input
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="usuario@dentalerp.com"
                  required
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  label="Contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  disabled={isLoading}
                  className="mt-2"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Flex>
            </form>

            {/* Demo Users */}
            <div className="mt-8">
              <div className="text-center text-sm text-gray-500 mb-4">
                Usuarios Demo para Pruebas:
              </div>
              <div className="space-y-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(user)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email} • {user.specialty}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Register */}
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 text-sm"
                disabled={isLoading}
              >
                ¿No tienes cuenta? Registrarse
              </button>
            </div>
          </Card.Content>
        </Card>

        {/* Quick Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistema Demo - Versión 1.0.0</p>
          <p>Todos los datos son simulados para propósitos de demostración</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
