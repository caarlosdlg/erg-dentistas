import React, { useState, useEffect } from 'react';

/**
 * Dashboard Component - Simple overview with backend connection
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    citasHoy: 0,
    tratamientos: 0,
    inventario: 0
  });
  const [error, setError] = useState(null);

  // Backend API base URL
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from different endpoints
      const responses = await Promise.allSettled([
        fetch(`${API_BASE}/pacientes/`),
        fetch(`${API_BASE}/citas/`),
        fetch(`${API_BASE}/tratamientos/`),
        fetch(`${API_BASE}/inventario/`)
      ]);

      const [pacientesRes, citasRes, tratamientosRes, inventarioRes] = responses;

      let newStats = { ...stats };

      // Process patients data
      if (pacientesRes.status === 'fulfilled' && pacientesRes.value.ok) {
        const pacientes = await pacientesRes.value.json();
        newStats.totalPacientes = Array.isArray(pacientes) ? pacientes.length : 0;
      }

      // Process appointments data  
      if (citasRes.status === 'fulfilled' && citasRes.value.ok) {
        const citas = await citasRes.value.json();
        const today = new Date().toISOString().split('T')[0];
        newStats.citasHoy = Array.isArray(citas) ? 
          citas.filter(cita => cita.fecha?.startsWith(today)).length : 0;
      }

      // Process treatments data
      if (tratamientosRes.status === 'fulfilled' && tratamientosRes.value.ok) {
        const tratamientos = await tratamientosRes.value.json();
        newStats.tratamientos = Array.isArray(tratamientos) ? tratamientos.length : 0;
      }

      // Process inventory data
      if (inventarioRes.status === 'fulfilled' && inventarioRes.value.ok) {
        const inventario = await inventarioRes.value.json();
        newStats.inventario = Array.isArray(inventario) ? inventario.length : 0;
      }

      setStats(newStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-500">⚠️</div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido al Panel de Control!
        </h1>
        <p className="text-gray-600">
          Aquí tienes un resumen de tu clínica dental para hoy {new Date().toLocaleDateString('es-ES')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPacientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.citasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-purple-600 text-xl">🦷</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tratamientos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.tratamientos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-orange-600 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Inventario</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inventario}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 text-xl mr-3">➕</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nuevo Paciente</p>
              <p className="text-sm text-gray-500">Registrar paciente</p>
            </div>
          </button>

          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <span className="text-green-600 text-xl mr-3">📅</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nueva Cita</p>
              <p className="text-sm text-gray-500">Agendar cita</p>
            </div>
          </button>

          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <span className="text-purple-600 text-xl mr-3">🦷</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nuevo Tratamiento</p>
              <p className="text-sm text-gray-500">Crear tratamiento</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-blue-600 mr-3">👤</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Sistema iniciado</p>
              <p className="text-xs text-gray-500">Dashboard cargado correctamente</p>
            </div>
          </div>
          
          {stats.totalPacientes > 0 && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600 mr-3">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Datos sincronizados</p>
                <p className="text-xs text-gray-500">Información actualizada desde el servidor</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
