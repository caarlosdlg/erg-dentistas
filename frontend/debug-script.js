// Script de debug para inyectar en la consola del navegador
// Para usar: copiar y pegar en la consola cuando estés en la página de citas

console.log('🔍 Iniciando debug del sistema de citas...');

// Función para debuggear el estado de React
function debugReactState() {
    // Buscar el root de React
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error('❌ No se encontró el elemento root');
        return;
    }
    
    // Intentar acceder al estado de React (esto puede variar según la versión)
    const reactInstance = rootElement._reactInternalInstance || 
                         rootElement._reactInternalFiber || 
                         rootElement.__reactInternalInstance;
    
    console.log('🔍 React instance:', reactInstance);
}

// Verificar APIs directamente
async function testAPIs() {
    console.log('🔄 Testing APIs...');
    
    try {
        // Test auth
        const authResponse = await fetch('http://localhost:8000/api/auth/google/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: 'dev_test_token' })
        });
        
        if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('✅ Auth OK:', authData.user.email);
            
            // Test patients with auth
            const token = authData.tokens.access;
            const patientsResponse = await fetch('http://localhost:8000/api/pacientes/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (patientsResponse.ok) {
                const patientsData = await patientsResponse.json();
                const patients = patientsData.results || patientsData;
                console.log(`✅ Patients API OK: ${patients.length} pacientes`);
                
                // Mostrar primeros 3 pacientes
                patients.slice(0, 3).forEach((p, i) => {
                    console.log(`${i+1}. ${p.nombre_completo || p.nombre + ' ' + p.apellido_paterno} - ${p.email}`);
                });
                
                return patients;
            } else {
                console.error('❌ Patients API failed:', patientsResponse.status);
            }
        } else {
            console.error('❌ Auth failed:', authResponse.status);
        }
    } catch (error) {
        console.error('❌ API test error:', error);
    }
}

// Verificar dropdowns en la página
function debugDropdowns() {
    console.log('🔍 Verificando dropdowns...');
    
    const selects = document.querySelectorAll('select');
    console.log(`📋 Encontrados ${selects.length} dropdowns`);
    
    selects.forEach((select, index) => {
        const options = select.querySelectorAll('option');
        console.log(`Dropdown ${index + 1}:`);
        console.log(`  - Total opciones: ${options.length}`);
        console.log(`  - Valor actual: "${select.value}"`);
        
        if (options.length > 1) {
            console.log(`  - Opciones:`);
            Array.from(options).forEach((option, i) => {
                if (i === 0) return; // Skip first option (placeholder)
                console.log(`    ${i}. Value: "${option.value}", Text: "${option.textContent}"`);
            });
        }
    });
}

// Verificar localStorage
function debugLocalStorage() {
    console.log('🔍 Verificando localStorage...');
    
    const tokens = localStorage.getItem('dental_erp_tokens');
    const user = localStorage.getItem('dental_erp_user');
    
    console.log('🔑 Tokens:', tokens ? 'Presentes' : 'No encontrados');
    console.log('👤 User:', user ? JSON.parse(user) : 'No encontrado');
}

// Ejecutar todas las verificaciones
async function runFullDebug() {
    console.log('🚀 Ejecutando debug completo...');
    console.log('='.repeat(50));
    
    debugLocalStorage();
    console.log('');
    
    const patients = await testAPIs();
    console.log('');
    
    debugDropdowns();
    console.log('');
    
    debugReactState();
    console.log('');
    
    console.log('✅ Debug completo terminado');
    return patients;
}

// Auto-ejecutar
runFullDebug();

// Funciones disponibles para llamar manualmente:
console.log('📋 Funciones disponibles:');
console.log('- runFullDebug() - Ejecuta todas las verificaciones');
console.log('- testAPIs() - Prueba las APIs');
console.log('- debugDropdowns() - Verifica los dropdowns');
console.log('- debugLocalStorage() - Verifica localStorage');
