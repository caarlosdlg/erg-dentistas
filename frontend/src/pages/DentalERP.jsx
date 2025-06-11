import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import PacientesReal from './PacientesReal';
import Citas from './Citas';
import CitasConSeleccionPacientes from './CitasConSeleccionPacientes';
import CitasConEmailsCompleto from './CitasConEmailsCompleto';
import CitasElegante from './CitasElegante';
import Tratamientos from './Tratamientos';
import Inventario from './Inventario';

/**
 * DentalERP Main Application - Simplified Version
 * Basic dental clinic management system with Tailwind CSS
 */
const DentalERP = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  
  // Simple user data simulation
  useEffect(() => {
    setUser({
      first_name: 'Dr. Juan',
      last_name: 'Pérez',
      role: 'admin'
    });
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      description: 'Resumen general del sistema'
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: '👥',
      description: 'Gestión de pacientes'
    },
    {
      id: 'citas',
      label: 'Citas',
      icon: '📅',
      description: 'Gestión de citas'
    },
    {
      id: 'citas-rapidas',
      label: 'Asignación Rápida',
      icon: '⚡',
      description: 'Asignación rápida de citas'
    },
    {
      id: 'citas-emails',
      label: 'Citas con Emails',
      icon: '📧',
      description: 'Citas con envío automático de emails'
    },
    {
      id: 'citas-elegante',
      label: '💎 Citas Elegante',
      icon: '💎',
      description: 'Interfaz elegante para gestión de citas'
    },
    {
      id: 'tratamientos',
      label: 'Tratamientos',
      icon: '🦷',
      description: 'Catálogo de tratamientos'
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: '📦',
      description: 'Gestión de suministros'
    }
  ];

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'pacientes':
        return <PacientesReal />;
      case 'citas':
        return <Citas />;
      case 'citas-rapidas':
        return <CitasConSeleccionPacientes />;
      case 'citas-emails':
        return <CitasConEmailsCompleto />;
      case 'citas-elegante':
        return <CitasElegante />;
      case 'tratamientos':
        return <Tratamientos />;
      case 'inventario':
        return <Inventario />;
      default:
        return <Dashboard />;
    }
  };

  const getCurrentModuleInfo = () => {
    return navigationItems.find(item => item.id === currentModule) || navigationItems[0];
  };

  const moduleInfo = getCurrentModuleInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦷</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">DentalERP</h1>
                <p className="text-sm text-gray-500">Sistema Integral</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-500">
                {sidebarCollapsed ? '▶️' : '◀️'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  currentModule === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.first_name?.charAt(0) || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'dentist' ? 'Odontólogo' : 
                   user?.role === 'receptionist' ? 'Recepcionista' : 
                   'Usuario'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{moduleInfo.label}</h2>
              <p className="text-gray-600">{moduleInfo.description}</p>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Notificaciones (3)
              </button>
              
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Configuración
              </button>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentModule()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              © 2024 DentalERP - Sistema de Gestión Dental
            </div>
            <div>
              Versión 1.0.0 | Soporte: soporte@dentalerp.com
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DentalERP;
