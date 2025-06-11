import React from 'react';

const CitasSimple = () => {
  console.log('🔍 CitasSimple: Componente cargado correctamente');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">📅 Gestión de Citas - Versión Simple</h1>
      <div className="bg-green-100 p-4 rounded">
        <p className="text-green-800">✅ El componente de Citas se está cargando correctamente.</p>
        <p className="text-gray-600 mt-2">Esta es una versión simplificada para debuggear el problema.</p>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold text-blue-800">🔧 Debugging Info:</h2>
          <ul className="mt-2 text-sm text-blue-700">
            <li>• React está funcionando correctamente</li>
            <li>• Tailwind CSS está aplicándose</li>
            <li>• El enrutamiento funciona</li>
            <li>• El componente se monta sin errores</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold text-yellow-800">⚠️ Próximos pasos:</h2>
          <p className="text-yellow-700 text-sm mt-1">
            Si ves este mensaje, el problema está en el componente Citas original.
            Podemos proceder a activar gradualmente las funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitasSimple;
