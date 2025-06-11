import React from 'react';

const Test = () => {
  console.log('🔍 Test: Componente cargado correctamente');
  
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      ✅ REACT ESTÁ FUNCIONANDO CORRECTAMENTE
      <br />
      Si ves este mensaje, React y el servidor están bien.
    </div>
  );
};

export default Test;
