// Test script para verificar el estado de autenticación
// Ejecutar en la consola del navegador

console.log('🔍 Estado actual de autenticación:');
console.log('localStorage tokens:', localStorage.getItem('dental_erp_tokens'));
console.log('localStorage user:', localStorage.getItem('dental_erp_user'));

// Parse datos si existen
try {
  const tokens = JSON.parse(localStorage.getItem('dental_erp_tokens') || 'null');
  const user = JSON.parse(localStorage.getItem('dental_erp_user') || 'null');
  
  console.log('📊 Datos parseados:');
  console.log('User:', user);
  console.log('Tokens:', tokens);
  
  if (tokens?.access) {
    // Verificar si el token ha expirado
    const payload = JSON.parse(atob(tokens.access.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp < currentTime;
    
    console.log('🕐 Token info:');
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Is expired:', isExpired);
  }
} catch (error) {
  console.error('Error parsing auth data:', error);
}

// Función para limpiar auth data
window.clearAuth = () => {
  localStorage.removeItem('dental_erp_tokens');
  localStorage.removeItem('dental_erp_user');
  console.log('✅ Auth data cleared');
  window.location.reload();
};

console.log('💡 Tip: Ejecuta clearAuth() para limpiar datos de autenticación');
