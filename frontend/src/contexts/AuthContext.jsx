import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Auth Context
 * Maneja el estado de autenticación global de la aplicación
 */
const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar token guardado al iniciar la aplicación
  useEffect(() => {
    const checkAuth = () => {
      try {
        // MODO DESARROLLO: Omitir login y usar usuario por defecto
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          // Simular usuario autenticado para desarrollo
          const mockUser = {
            id: 1,
            email: 'dev@dentalerp.com',
            name: 'Usuario Desarrollo',
            role: 'admin'
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (tokenData) => {
    try {
      // Enviar token al backend para validación
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tokenData.credential || tokenData.access_token,
          client_id: tokenData.client_id
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación con el servidor');
      }

      const data = await response.json();
      
      // Guardar datos en localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Actualizar estado
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Actualizar estado
    setUser(null);
    setIsAuthenticated(false);
    
    // Opcional: Notificar al backend del logout
    try {
      fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
