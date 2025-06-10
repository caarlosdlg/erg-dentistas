import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página principal del ERP Dental
 * Muestra todas las funcionalidades después del login
 */
const MainApp = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('pacientes');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL + '/api';

  // Cargar pacientes al inicializar
  useEffect(() => {
    const initializeApp = async () => {
      // Verificar si ya estamos autenticados
      const tokens = localStorage.getItem('dental_erp_tokens');
      
      if (!tokens) {
        // Hacer login automático en desarrollo
        try {
          const response = await fetch(`${API_BASE}/auth/google/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: 'dev_test_token' })
          });

          if (response.ok) {
            const authData = await response.json();
            localStorage.setItem('dental_erp_user', JSON.stringify(authData.user));
            localStorage.setItem('dental_erp_tokens', JSON.stringify(authData.tokens));
          }
        } catch (error) {
          console.error('Error en login automático:', error);
        }
      }

      // Cargar pacientes
      if (currentPage === 'pacientes') {
        loadPacientes();
      }
    };

    initializeApp();
  }, [currentPage]);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/pacientes/`);
      
      if (response.ok) {
        const data = await response.json();
        // La API devuelve un objeto con results
        setPacientes(data.results || data);
      } else {
        throw new Error('Error al cargar pacientes');
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Componente de navegación
  const Navigation = () => (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">🦷 DentalERP</h1>
            </div>
            <div className="ml-10 flex space-x-8">
              <button
                onClick={() => setCurrentPage('pacientes')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'pacientes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pacientes
              </button>
              <button
                onClick={() => setCurrentPage('citas')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'citas'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Citas
              </button>
              <button
                onClick={() => setCurrentPage('tratamientos')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'tratamientos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tratamientos
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Bienvenido, {user?.first_name || user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Componente de Pacientes
  const PacientesPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gestión de pacientes del consultorio</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          ➕ Nuevo Paciente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Pacientes</h3>
          <div className="text-3xl font-bold text-blue-600">{pacientes.length}</div>
          <p className="text-sm text-gray-500">En la base de datos</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Activos</h3>
          <div className="text-3xl font-bold text-green-600">
            {pacientes.filter(p => p.activo).length}
          </div>
          <p className="text-sm text-gray-500">Con estado activo</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Con Alertas</h3>
          <div className="text-3xl font-bold text-red-600">
            {pacientes.filter(p => p.alergias || p.enfermedades_cronicas).length}
          </div>
          <p className="text-sm text-gray-500">Alertas médicas</p>
        </div>
      </div>

      {/* Lista de Pacientes */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando pacientes...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button 
            onClick={loadPacientes}
            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Pacientes ({pacientes.length})
            </h3>
          </div>
          
          {pacientes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pacientes registrados
              </h3>
              <p className="text-gray-500">Comienza agregando tu primer paciente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información Médica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {paciente.nombre_completo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {paciente.numero_expediente}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{paciente.telefono}</div>
                        <div className="text-sm text-gray-500">{paciente.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {paciente.edad} años • {paciente.tipo_sangre || 'N/A'}
                        </div>
                        {(paciente.alergias || paciente.enfermedades_cronicas) && (
                          <div className="text-sm text-red-600">⚠️ Alerta médica</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          paciente.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paciente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Ver
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Páginas placeholder
  const CitasPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
      <p className="text-gray-600 mt-1">Gestión de citas médicas</p>
      <div className="mt-6 bg-white p-8 rounded-lg shadow">
        <p className="text-gray-500">Esta página está en desarrollo.</p>
      </div>
    </div>
  );

  const TratamientosPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Tratamientos</h1>
      <p className="text-gray-600 mt-1">Catálogo de tratamientos dentales</p>
      <div className="mt-6 bg-white p-8 rounded-lg shadow">
        <p className="text-gray-500">Esta página está en desarrollo.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {currentPage === 'pacientes' && <PacientesPage />}
        {currentPage === 'citas' && <CitasPage />}
        {currentPage === 'tratamientos' && <TratamientosPage />}
      </main>
    </div>
  );
};

export default MainApp;
