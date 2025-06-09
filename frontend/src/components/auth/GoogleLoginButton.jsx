import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: credentialResponse.credential,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          login(data.user, data.tokens);
        }
      } else {
        console.error('Error en autenticación con Google');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleError = () => {
    console.error('Error en el login con Google');
  };

  // Función para desarrollo - simula login con Google
  const handleDevelopmentLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: 'dev_test_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          login(data.user, data.tokens);
        }
      } else {
        console.error('Error en autenticación con Google');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isDevelopment = import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your-google-client-id.apps.googleusercontent.com';
  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com';

  return (
    <div className="flex flex-col items-center space-y-4">
      {isGoogleConfigured && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Autenticación con Google
          </p>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            text="signin_with"
            shape="pill"
            theme="outline"
            size="large"
          />
        </div>
      )}
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          {isGoogleConfigured ? 'O usa modo desarrollo:' : 'Modo desarrollo - Google OAuth no configurado'}
        </p>
        <button
          onClick={handleDevelopmentLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          🔒 Iniciar Sesión (Desarrollo)
        </button>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
