#!/usr/bin/env python
"""
Comprehensive API testing script for DentalERP
Tests all the main endpoints we've implemented
"""
import requests
import json
from datetime import date, datetime, timedelta
import sys

# Base URL for our API
BASE_URL = "http://127.0.0.1:8000/api"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_endpoint(method, url, data=None, description=""):
    """Test a single endpoint and print results"""
    try:
        print(f"\n🧪 Testing: {description}")
        print(f"   {method} {url}")
        
        if method.upper() == 'GET':
            response = requests.get(url)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers={'Content-Type': 'application/json'})
        elif method.upper() == 'DELETE':
            response = requests.delete(url)
        
        print(f"   ✅ Status: {response.status_code}")
        
        if response.status_code < 400:
            try:
                result = response.json()
                if isinstance(result, list):
                    print(f"   📊 Response: List with {len(result)} items")
                    if result:
                        print(f"   📄 First item keys: {list(result[0].keys())}")
                elif isinstance(result, dict):
                    print(f"   📊 Response: Dict with keys: {list(result.keys())}")
                else:
                    print(f"   📊 Response: {type(result)}")
            except:
                print(f"   📊 Response: {response.text[:100]}...")
        else:
            print(f"   ❌ Error: {response.text}")
        
        return response
    except Exception as e:
        print(f"   💥 Exception: {str(e)}")
        return None

def main():
    print("🏥 DentalERP API Comprehensive Testing")
    print(f"🌐 Testing against: {BASE_URL}")
    
    # Test 1: Pacientes API
    print_section("PACIENTES API")
    
    # List pacientes
    test_endpoint('GET', f'{BASE_URL}/pacientes/', description="Get all patients")
    
    # Create a test patient
    paciente_data = {
        "nombre": "Juan Carlos",
        "apellido_paterno": "Pérez", 
        "apellido_materno": "García",
        "fecha_nacimiento": "1990-05-15",
        "sexo": "M",
        "telefono": "555-0123",
        "email": f"juan.perez.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@email.com",
        "direccion": "Calle Principal 123",
        "tipo_sangre": "O+",
        "contacto_emergencia_nombre": "María Pérez",
        "contacto_emergencia_telefono": "555-0124",
        "contacto_emergencia_relacion": "Hermana"
    }
    
    create_response = test_endpoint('POST', f'{BASE_URL}/pacientes/', 
                                  data=paciente_data, 
                                  description="Create new patient")
    
    paciente_id = None
    if create_response and create_response.status_code == 201:
        paciente_id = create_response.json().get('id')
        print(f"   🆔 Created patient ID: {paciente_id}")
        
        # Test patient detail
        test_endpoint('GET', f'{BASE_URL}/pacientes/{paciente_id}/', 
                     description=f"Get patient {paciente_id} details")
        
        # Test patient statistics
        test_endpoint('GET', f'{BASE_URL}/pacientes/estadisticas/', 
                     description="Get patient statistics")
    
    # Test 2: Especialidades API
    print_section("ESPECIALIDADES API")
    
    test_endpoint('GET', f'{BASE_URL}/especialidades/', description="Get all specialties")
    
    # Create a test specialty
    especialidad_data = {
        "nombre": "Endodoncia",
        "descripcion": "Tratamiento de conductos radiculares"
    }
    
    esp_response = test_endpoint('POST', f'{BASE_URL}/especialidades/', 
                                data=especialidad_data, 
                                description="Create new specialty")
    
    especialidad_id = None
    if esp_response and esp_response.status_code == 201:
        especialidad_id = esp_response.json().get('id')
        print(f"   🆔 Created specialty ID: {especialidad_id}")
    
    # Test 3: Dentistas API
    print_section("DENTISTAS API")
    
    test_endpoint('GET', f'{BASE_URL}/dentistas/', description="Get all dentists")
    
    # Create a test dentist (only if we have a specialty)
    if especialidad_id:
        dentista_data = {
            "nombre": "Dr. Carlos",
            "apellido_paterno": "Rodríguez",
            "apellido_materno": "López",
            "cedula_profesional": f"TEST{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "email": f"dr.rodriguez.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@dental.com",
            "telefono": "555-0200",
            "especialidades": [especialidad_id],
            "horario_inicio": "08:00:00",
            "horario_fin": "18:00:00"
        }
        
        dentista_response = test_endpoint('POST', f'{BASE_URL}/dentistas/', 
                                        data=dentista_data, 
                                        description="Create new dentist")
        
        dentista_id = None
        if dentista_response and dentista_response.status_code == 201:
            dentista_id = dentista_response.json().get('id')
            print(f"   🆔 Created dentist ID: {dentista_id}")
            
            # Test dentist availability
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            test_endpoint('GET', f'{BASE_URL}/dentistas/{dentista_id}/disponibles/?fecha={tomorrow}', 
                         description=f"Check dentist availability for {tomorrow}")
    
    # Test 4: Categorías de Tratamiento API
    print_section("CATEGORÍAS DE TRATAMIENTO API")
    
    test_endpoint('GET', f'{BASE_URL}/categorias-tratamiento/', description="Get all treatment categories")
    
    # Create a test category
    categoria_data = {
        "nombre": "Preventiva",
        "descripcion": "Tratamientos preventivos y de mantenimiento"
    }
    
    cat_response = test_endpoint('POST', f'{BASE_URL}/categorias-tratamiento/', 
                                data=categoria_data, 
                                description="Create new treatment category")
    
    categoria_id = None
    if cat_response and cat_response.status_code == 201:
        categoria_id = cat_response.json().get('id')
        print(f"   🆔 Created category ID: {categoria_id}")
    
    # Test 5: Tratamientos API
    print_section("TRATAMIENTOS API")
    
    test_endpoint('GET', f'{BASE_URL}/tratamientos/', description="Get all treatments")
    
    # Create a test treatment (only if we have a category)
    if categoria_id:
        tratamiento_data = {
            "nombre": "Limpieza Dental",
            "descripcion": "Limpieza profesional de dientes",
            "precio": "500.00",
            "duracion_minutos": 60,
            "categoria": categoria_id,
            "activo": True
        }
        
        trat_response = test_endpoint('POST', f'{BASE_URL}/tratamientos/', 
                                    data=tratamiento_data, 
                                    description="Create new treatment")
        
        tratamiento_id = None
        if trat_response and trat_response.status_code == 201:
            tratamiento_id = trat_response.json().get('id')
            print(f"   🆔 Created treatment ID: {tratamiento_id}")
            
            # Test treatment statistics
            test_endpoint('GET', f'{BASE_URL}/tratamientos/estadisticas/', 
                         description="Get treatment statistics")
    
    # Test 6: Citas API
    print_section("CITAS API")
    
    test_endpoint('GET', f'{BASE_URL}/citas/', description="Get all appointments")
    
    # Create a test appointment (only if we have patient, dentist, and treatment)
    if paciente_id and dentista_id and tratamiento_id:
        tomorrow = datetime.now() + timedelta(days=1)
        cita_data = {
            "paciente": paciente_id,
            "dentista": dentista_id,
            "tratamiento": tratamiento_id,
            "fecha": tomorrow.strftime('%Y-%m-%d'),
            "hora": "10:00:00",
            "motivo": "Limpieza de rutina",
            "estado": "programada"
        }
        
        cita_response = test_endpoint('POST', f'{BASE_URL}/citas/', 
                                    data=cita_data, 
                                    description="Create new appointment")
        
        cita_id = None
        if cita_response and cita_response.status_code == 201:
            cita_id = cita_response.json().get('id')
            print(f"   🆔 Created appointment ID: {cita_id}")
            
            # Test appointment confirmation
            test_endpoint('POST', f'{BASE_URL}/citas/{cita_id}/confirmar/', 
                         description=f"Confirm appointment {cita_id}")
            
            # Test available time slots
            test_endpoint('GET', f'{BASE_URL}/citas/horarios_disponibles/?dentista={dentista_id}&fecha={tomorrow.strftime("%Y-%m-%d")}', 
                         description=f"Get available time slots for dentist {dentista_id}")
    
    # Test 7: Search and Filter Functionality
    print_section("SEARCH & FILTER FUNCTIONALITY")
    
    # Search patients
    test_endpoint('GET', f'{BASE_URL}/pacientes/?search=Juan', 
                 description="Search patients by name")
    
    # Filter dentists by specialty
    if especialidad_id:
        test_endpoint('GET', f'{BASE_URL}/dentistas/?especialidades={especialidad_id}', 
                     description=f"Filter dentists by specialty {especialidad_id}")
    
    # Filter treatments by category
    if categoria_id:
        test_endpoint('GET', f'{BASE_URL}/tratamientos/?categoria={categoria_id}', 
                     description=f"Filter treatments by category {categoria_id}")
    
    # Test 8: Statistics Endpoints
    print_section("STATISTICS ENDPOINTS")
    
    test_endpoint('GET', f'{BASE_URL}/pacientes/estadisticas/', 
                 description="Patient statistics")
    
    test_endpoint('GET', f'{BASE_URL}/citas/estadisticas/', 
                 description="Appointment statistics")
    
    test_endpoint('GET', f'{BASE_URL}/tratamientos/estadisticas/', 
                 description="Treatment statistics")
    
    print_section("TESTING COMPLETED")
    print("🎉 All API tests completed!")
    print("✅ If you see mostly 200/201 status codes, your APIs are working correctly!")
    print("⚠️  If you see 401 errors, you might need to implement authentication first")
    print("❌ If you see 500 errors, check your Django server logs for details")

if __name__ == "__main__":
    main()
