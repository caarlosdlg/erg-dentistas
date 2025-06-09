import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState(null);

  // Cargar datos del usuario desde localStorage al inicializar
  useEffect(() => {
    const storedTokens = localStorage.getItem('dental_erp_tokens');
    const storedUser = localStorage.getItem('dental_erp_user');

    if (storedTokens && storedUser) {
      try {
        setTokens(JSON.parse(storedTokens));
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('dental_erp_tokens');
        localStorage.removeItem('dental_erp_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Función para verificar si el token ha expirado
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Función para refrescar el token
  const refreshToken = async () => {
    if (!tokens?.refresh) {
      logout();
      return null;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          ...tokens,
          access: data.access,
        };
        setTokens(newTokens);
        localStorage.setItem('dental_erp_tokens', JSON.stringify(newTokens));
        return data.access;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  };

  // Función para obtener token válido
  const getValidToken = async () => {
    if (!tokens?.access) return null;

    if (isTokenExpired(tokens.access)) {
      return await refreshToken();
    }

    return tokens.access;
  };

  // Función de login para desarrollo (sin backend)
  const loginDev = async (credentials = {}) => {
    setIsLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: 1,
      email: credentials.email || 'dev@dentalerp.com',
      first_name: credentials.first_name || 'Usuario',
      last_name: credentials.last_name || 'Desarrollo',
      is_staff: true,
      is_superuser: true,
      role: 'admin'
    };

    const mockTokens = {
      access: 'dev-access-token-' + Date.now(),
      refresh: 'dev-refresh-token-' + Date.now()
    };

    login(mockUser, mockTokens);
    setIsLoading(false);
    
    return { user: mockUser, tokens: mockTokens };
  };

  // Login con Google para desarrollo
  const loginWithGoogleDev = async () => {
    setIsLoading(true);
    
    // Simular delay de Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: 2,
      email: 'carlos@dentalerp.com',
      first_name: 'Carlos',
      last_name: 'Delgado',
      is_staff: true,
      is_superuser: false,
      role: 'dentist',
      google_id: 'mock-google-id'
    };

    const mockTokens = {
      access: 'google-dev-access-token-' + Date.now(),
      refresh: 'google-dev-refresh-token-' + Date.now()
    };

    login(mockUser, mockTokens);
    setIsLoading(false);
    
    return { user: mockUser, tokens: mockTokens };
  };

  // Función de login
  const login = (userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('dental_erp_user', JSON.stringify(userData));
    localStorage.setItem('dental_erp_tokens', JSON.stringify(tokenData));
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('dental_erp_user');
    localStorage.removeItem('dental_erp_tokens');
  };

  // Verificar autenticación
  const isAuthenticated = () => {
    return user && tokens && !isTokenExpired(tokens.access);
  };

  const value = {
    user,
    tokens,
    isLoading,
    login,
    logout,
    isAuthenticated,
    getValidToken,
    refreshToken,
    loginDev,
    loginWithGoogleDev,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
