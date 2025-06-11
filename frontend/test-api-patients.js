// Test básico del servicio API
import APIService from '../src/services/api.js';

console.log('🚀 Iniciando test del servicio API...');

const apiService = new APIService();

async function testPatientsAPI() {
    try {
        console.log('🔄 Probando carga de pacientes...');
        
        // Primero autenticarse
        const authResponse = await fetch('http://localhost:8000/api/auth/google/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: 'dev_test_token' })
        });

        if (authResponse.ok) {
            const authData = await authResponse.json();
            localStorage.setItem('dental_erp_user', JSON.stringify(authData.user));
            localStorage.setItem('dental_erp_tokens', JSON.stringify(authData.tokens));
            console.log('✅ Autenticación exitosa');
        }
        
        // Ahora probar la API de pacientes
        const patientsData = await apiService.getPatients();
        const patients = patientsData.results || patientsData;
        
        console.log(`✅ Pacientes cargados: ${patients.length}`);
        console.log('📋 Lista de pacientes:');
        
        patients.forEach((patient, index) => {
            console.log(`${index + 1}. ID: ${patient.id}`);
            console.log(`   Nombre: ${patient.nombre_completo || patient.nombre + ' ' + patient.apellido_paterno}`);
            console.log(`   Email: ${patient.email}`);
            console.log(`   Teléfono: ${patient.telefono}`);
            console.log('   ---');
        });
        
        return patients;
    } catch (error) {
        console.error('❌ Error al cargar pacientes:', error);
        throw error;
    }
}

// Ejecutar la prueba
testPatientsAPI()
    .then(patients => {
        console.log(`🎉 Test completado! ${patients.length} pacientes encontrados.`);
    })
    .catch(error => {
        console.error('💥 Test falló:', error);
    });
