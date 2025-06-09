import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ERP Dental</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>

          {/* Botón de Google */}
          <div className="space-y-6">
            <GoogleLoginButton />
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Al iniciar sesión, aceptas nuestros{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  términos de servicio
                </a>{' '}
                y{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  política de privacidad
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">¿Nuevo en ERP Dental?</h3>
            <p className="text-sm text-gray-600">
              Sistema integral de gestión para clínicas dentales. 
              Gestiona pacientes, citas, tratamientos y facturación de forma eficiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
