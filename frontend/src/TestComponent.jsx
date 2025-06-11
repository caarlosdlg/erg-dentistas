import React from 'react';

const TestComponent = () => {
  console.log('🔍 TestComponent: Componente de prueba cargando...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '2rem', marginBottom: '20px' }}>
        🧪 Componente de Prueba
      </h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize: '1.2rem' }}>
          ✅ React está funcionando correctamente
        </p>
        <p>
          📅 Fecha: {new Date().toLocaleString()}
        </p>
        <p>
          🌐 URL actual: {window.location.href}
        </p>
        <button 
          onClick={() => alert('¡Botón funcionando!')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔄 Probar Interactividad
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
