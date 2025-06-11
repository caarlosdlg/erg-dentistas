import React, { useState, useEffect } from 'react';

const CitasDebug = () => {
  console.log('🔍 CitasDebug: Iniciando componente de debug...');
  
  const [debugInfo, setDebugInfo] = useState('Componente cargado');
  
  useEffect(() => {
    console.log('🔍 CitasDebug: useEffect ejecutado');
    setDebugInfo('useEffect ejecutado correctamente');
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧪 Debug de Citas</h1>
      <div className="bg-green-100 p-4 rounded">
        <p>Estado: {debugInfo}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Testing básico:</h2>
        <button 
          onClick={() => setDebugInfo('Botón clickeado: ' + new Date().toLocaleTimeString())}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Click
        </button>
      </div>
    </div>
  );
};

export default CitasDebug;
