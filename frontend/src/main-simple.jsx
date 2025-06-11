import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

console.log('🔍 main.jsx: Iniciando aplicación simple...');

const SimpleApp = () => {
  console.log('🔍 SimpleApp: Componente renderizando...');
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>✅ React está funcionando</h1>
      <p>Si ves esto, React se está cargando correctamente.</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>,
)
