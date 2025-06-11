import React from 'react';

const TestApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#3B82F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          🎉 React + Vite FUNCIONA!
        </h1>
        <p style={{
          color: '#6B7280',
          marginBottom: '1rem'
        }}>
          Frontend corriendo en puerto 5173
        </p>
        <div style={{
          fontSize: '0.875rem',
          color: '#9CA3AF'
        }}>
          <div>Backend: http://localhost:8001</div>
          <div>Fecha: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default TestApp;
