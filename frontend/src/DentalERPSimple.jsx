import React, { useState } from 'react';

// Componente simplificado de DentalERP para diagnóstico
const DentalERPSimple = () => {
  console.log('🔍 DentalERPSimple: Componente iniciando...');
  
  const [currentModule, setCurrentModule] = useState('dashboard');

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pacientes', label: 'Pacientes', icon: '👥' },
    { id: 'citas', label: 'Citas', icon: '📅' },
  ];

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-2xl font-bold text-blue-700">0</p>
                <p className="text-gray-700">Pacientes</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <p className="text-2xl font-bold text-green-700">0</p>
                <p className="text-gray-700">Citas Hoy</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <p className="text-2xl font-bold text-yellow-700">0</p>
                <p className="text-gray-700">Tratamientos</p>
              </div>
            </div>
          </div>
        );
      case 'pacientes':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">👥 Pacientes</h2>
            <p>Vista de pacientes (simplificada)</p>
          </div>
        );
      case 'citas':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">📅 Citas</h2>
            <p>Vista de citas (simplificada)</p>
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p><strong>Estado:</strong> Sistema funcionando en modo de prueba</p>
            </div>
          </div>
        );
      default:
        return <div className="p-6">Módulo no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🦷</span>
              </div>
              <span className="text-xl font-bold text-gray-800">DentalERP</span>
            </div>
          </div>
          
          <nav className="mt-4">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => {
                  console.log(`🔍 Cambiando a módulo: ${module.id}`);
                  setCurrentModule(module.id);
                }}
                className={`w-full text-left px-4 py-3 flex items-center space-x-2 hover:bg-gray-50 transition-colors ${
                  currentModule === module.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <span className="text-lg">{module.icon}</span>
                <span className="font-medium">{module.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <header className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                DentalERP - Modo Prueba
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sistema Funcionando</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </header>

          <main>
            {renderCurrentModule()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DentalERPSimple;
