import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard Component - Complete overview with backend integration
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    citasHoy: 0,
    tratamientos: 0,
    inventario: 0,
    pacientesActivos: 0,
    citasPendientes: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  // Backend API base URL
  const API_BASE = '/api';

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
      let activity = [];

      // Process patients data
      if (pacientesRes.status === 'fulfilled' && pacientesRes.value.ok) {
        const pacientesData = await pacientesRes.value.json();
        const pacientes = Array.isArray(pacientesData) ? pacientesData : pacientesData.results || [];
        newStats.totalPacientes = pacientes.length;
        newStats.pacientesActivos = pacientes.filter(p => p.activo).length;
        
        // Add to activity
        if (pacientes.length > 0) {
          activity.push({
            id: 'pacientes-sync',
            icon: '👥',
            title: 'Pacientes sincronizados',
            description: `${pacientes.length} pacientes en el sistema`,
            time: 'Ahora',
            type: 'success'
          });
        }
      }

      // Process appointments data  
      if (citasRes.status === 'fulfilled' && citasRes.value.ok) {
        const citasData = await citasRes.value.json();
        const citas = Array.isArray(citasData) ? citasData : citasData.results || [];
        const today = new Date().toISOString().split('T')[0];
        
        newStats.citasHoy = citas.filter(cita => 
          cita.fecha_hora?.startsWith(today)
        ).length;
        
        newStats.citasPendientes = citas.filter(cita => 
          cita.estado === 'programada' || cita.estado === 'confirmada'
        ).length;

        // Add to activity
        if (newStats.citasHoy > 0) {
          activity.push({
            id: 'citas-today',
            icon: '📅',
            title: `${newStats.citasHoy} citas para hoy`,
            description: 'Revisa tu agenda del día',
            time: 'Hoy',
            type: 'info'
          });
        }
      }

      // Process treatments data
      if (tratamientosRes.status === 'fulfilled' && tratamientosRes.value.ok) {
        const tratamientosData = await tratamientosRes.value.json();
        const tratamientos = Array.isArray(tratamientosData) ? tratamientosData : tratamientosData.results || [];
        newStats.tratamientos = tratamientos.filter(t => t.activo).length;
      }

      // Process inventory data
      if (inventarioRes.status === 'fulfilled' && inventarioRes.value.ok) {
        const inventarioData = await inventarioRes.value.json();
        const inventario = Array.isArray(inventarioData) ? inventarioData : inventarioData.results || [];
        newStats.inventario = inventario.length;

        // Check for low stock items
        const lowStockItems = inventario.filter(item => 
          item.stock_actual <= item.stock_minimo
        );
        
        if (lowStockItems.length > 0) {
          activity.push({
            id: 'low-stock',
            icon: '⚠️',
            title: 'Stock bajo detectado',
            description: `${lowStockItems.length} productos necesitan reposición`,
            time: 'Ahora',
            type: 'warning'
          });
        }
      }

      // Add welcome message
      activity.unshift({
        id: 'welcome',
        icon: '🏠',
        title: 'Sistema iniciado',
        description: `Bienvenido/a ${user?.first_name || 'Usuario'}, dashboard cargado correctamente`,
        time: 'Ahora',
        type: 'success'
      });

      setStats(newStats);
      setRecentActivity(activity);
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

      {/* Stats Cards with enhanced data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/pacientes')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPacientes}</p>
              <p className="text-xs text-green-600">{stats.pacientesActivos} activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/citas')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.citasHoy}</p>
              <p className="text-xs text-blue-600">{stats.citasPendientes} pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/tratamientos')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-purple-600 text-xl">🦷</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tratamientos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.tratamientos}</p>
              <p className="text-xs text-gray-500">disponibles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/inventario')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-orange-600 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Inventario</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inventario}</p>
              <p className="text-xs text-gray-500">productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions with navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/pacientes/nuevo')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 text-xl mr-3">➕</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nuevo Paciente</p>
              <p className="text-sm text-gray-500">Registrar paciente</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/citas')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <span className="text-green-600 text-xl mr-3">📅</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nueva Cita</p>
              <p className="text-sm text-gray-500">Agendar cita</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/tratamientos')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <span className="text-purple-600 text-xl mr-3">🦷</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Tratamientos</p>
              <p className="text-sm text-gray-500">Explorar catálogo</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity with dynamic content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-center p-3 rounded-lg ${
                activity.type === 'success' ? 'bg-green-50' :
                activity.type === 'warning' ? 'bg-yellow-50' :
                activity.type === 'info' ? 'bg-blue-50' :
                'bg-gray-50'
              }`}>
                <span className={`mr-3 ${
                  activity.type === 'success' ? 'text-green-600' :
                  activity.type === 'warning' ? 'text-yellow-600' :
                  activity.type === 'info' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {activity.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <div className="text-xs text-gray-400">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400 mr-3">📋</span>
              <div>
                <p className="text-sm font-medium text-gray-900">No hay actividad reciente</p>
                <p className="text-xs text-gray-500">Las actividades aparecerán aquí</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Refresh button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : '🔄 Actualizar datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
