#!/usr/bin/env python3
"""
Script de Prueba Completa - Sistema de Citas con Emails
Prueba todos los endpoints y funcionalidades implementadas
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuración
BASE_URL = "http://localhost:8000"
HEADERS = {
    'Content-Type': 'application/json',
}

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

def test_backend_connection():
    """Prueba conexión básica al backend"""
    print_header("PRUEBA 1: Conexión Backend")
    
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=5)
        if response.status_code == 200:
            print_success("Backend conectado correctamente")
            return True
        else:
            print_error(f"Backend respondió con código: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"No se pudo conectar al backend: {e}")
        return False

def test_pacientes_dropdown():
    """Prueba el endpoint dropdown de pacientes"""
    print_header("PRUEBA 2: Endpoint Dropdown Pacientes")
    
    try:
        response = requests.get(f"{BASE_URL}/api/pacientes/dropdown/", headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Endpoint dropdown funcionando")
            print_info(f"Pacientes encontrados: {data.get('count', 0)}")
            
            if 'results' in data and len(data['results']) > 0:
                sample_patient = data['results'][0]
                print_info(f"Ejemplo: {sample_patient.get('display_text', 'N/A')}")
                
                # Verificar estructura esperada
                required_fields = ['id', 'nombre_completo', 'email', 'display_text']
                missing_fields = [field for field in required_fields if field not in sample_patient]
                
                if not missing_fields:
                    print_success("Estructura de datos correcta")
                    return data
                else:
                    print_error(f"Campos faltantes: {missing_fields}")
                    return None
            else:
                print_error("No se encontraron pacientes")
                return None
        else:
            print_error(f"Error en endpoint: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Error de conexión: {e}")
        return None

def test_create_cita():
    """Prueba la creación de una cita"""
    print_header("PRUEBA 3: Creación de Cita")
    
    # Primero obtenemos un paciente
    pacientes_data = test_pacientes_dropdown()
    if not pacientes_data or not pacientes_data.get('results'):
        print_error("No se pueden crear citas sin pacientes")
        return False
    
    # Seleccionamos el primer paciente
    paciente = pacientes_data['results'][0]
    print_info(f"Usando paciente: {paciente['nombre_completo']}")
    
    # Datos de la cita
    tomorrow = datetime.now() + timedelta(days=1)
    cita_data = {
        'paciente': paciente['id'],
        'fecha_hora': tomorrow.strftime('%Y-%m-%dT10:00:00'),
        'motivo': 'consulta',
        'estado': 'programada',
        'notas': 'Cita de prueba automática',
        'costo': '500.00',
        'duracion_estimada': 30
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/citas/",
            headers=HEADERS,
            json=cita_data
        )
        
        if response.status_code == 201:
            created_cita = response.json()
            print_success("Cita creada exitosamente")
            print_info(f"ID de cita: {created_cita.get('id', 'N/A')}")
            return created_cita
        else:
            print_error(f"Error al crear cita: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Error de conexión: {e}")
        return None

def test_email_endpoint():
    """Prueba el endpoint de envío de emails"""
    print_header("PRUEBA 4: Endpoint de Emails")
    
    # Datos de prueba para email
    email_data = {
        'to_email': 'test@example.com',
        'patient_name': 'Paciente de Prueba',
        'appointment_date': '2025-06-11',
        'appointment_time': '10:00',
        'appointment_type': 'Consulta General'
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/emails/send-confirmation/",
            headers=HEADERS,
            json=email_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success("Endpoint de email funcional")
            print_info(f"Respuesta: {result.get('message', 'N/A')}")
            return True
        else:
            print_error(f"Error en endpoint de email: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Error de conexión: {e}")
        return False

def test_citas_list():
    """Prueba el listado de citas"""
    print_header("PRUEBA 5: Listado de Citas")
    
    try:
        response = requests.get(f"{BASE_URL}/api/citas/", headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Endpoint de citas funcionando")
            print_info(f"Citas encontradas: {data.get('count', 0)}")
            
            if 'results' in data and len(data['results']) > 0:
                sample_cita = data['results'][0]
                print_info(f"Ejemplo: Cita ID {sample_cita.get('id', 'N/A')}")
                
                # Verificar si incluye email del paciente
                if 'paciente_email' in sample_cita:
                    print_success("Campo paciente_email incluido correctamente")
                else:
                    print_error("Campo paciente_email no encontrado")
                
                return data
            else:
                print_info("No hay citas registradas")
                return data
        else:
            print_error(f"Error en endpoint: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Error de conexión: {e}")
        return None

def run_all_tests():
    """Ejecuta todas las pruebas"""
    print_header("INICIANDO PRUEBAS DEL SISTEMA COMPLETO")
    print_info(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"Backend URL: {BASE_URL}")
    
    results = {
        'backend_connection': False,
        'pacientes_dropdown': False,
        'create_cita': False,
        'email_endpoint': False,
        'citas_list': False
    }
    
    # Ejecutar pruebas
    results['backend_connection'] = test_backend_connection()
    
    if results['backend_connection']:
        results['pacientes_dropdown'] = test_pacientes_dropdown() is not None
        results['create_cita'] = test_create_cita() is not None
        results['email_endpoint'] = test_email_endpoint()
        results['citas_list'] = test_citas_list() is not None
    
    # Resumen final
    print_header("RESUMEN DE PRUEBAS")
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nResultado General: {passed_tests}/{total_tests} pruebas exitosas")
    
    if passed_tests == total_tests:
        print_success("🎉 TODAS LAS PRUEBAS PASARON - SISTEMA FUNCIONANDO CORRECTAMENTE")
        return True
    else:
        print_error("⚠️  ALGUNAS PRUEBAS FALLARON - REVISAR CONFIGURACIÓN")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
