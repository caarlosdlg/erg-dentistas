#!/usr/bin/env python3
"""
Test script para probar la creación de citas y ver el error específico
"""
import os
import sys
import django
import requests
import json
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from citas.models import Cita
from pacientes.models import Paciente
from dentistas.models import Dentista
from tratamientos.models import Tratamiento

def test_create_cita_via_django():
    """Probar creación directa usando Django ORM"""
    print("🧪 Test 1: Creación directa via Django ORM")
    
    try:
        # Obtener datos necesarios
        paciente = Paciente.objects.first()
        dentista = Dentista.objects.first()
        tratamiento = Tratamiento.objects.first()
        
        if not paciente:
            print("❌ No hay pacientes en la BD")
            return False
            
        if not dentista:
            print("❌ No hay dentistas en la BD")
            return False
            
        print(f"✅ Paciente: {paciente.nombre_completo}")
        print(f"✅ Dentista: {dentista.nombre_completo}")
        print(f"✅ Tratamiento: {tratamiento.nombre if tratamiento else 'Sin tratamiento'}")
        
        # Crear cita
        from django.utils import timezone as tz
        tomorrow = tz.now() + timedelta(days=1)
        cita_data = {
            'paciente': paciente,
            'dentista': dentista,
            'fecha_hora': tomorrow.replace(hour=10, minute=0, second=0, microsecond=0),
            'duracion_estimada': 30,
            'tipo_cita': 'consulta',
            'estado': 'programada',
            'motivo_consulta': 'Test de creación de cita',
            'notas_dentista': '',
            'observaciones_previas': '',
            'requiere_confirmacion': True
        }
        
        if tratamiento:
            cita_data['tratamiento'] = tratamiento
            
        cita = Cita.objects.create(**cita_data)
        print(f"✅ Cita creada exitosamente: {cita.numero_cita}")
        return True
        
    except Exception as e:
        print(f"❌ Error creando cita via Django: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_create_cita_via_api():
    """Probar creación via API REST"""
    print("\n🧪 Test 2: Creación via API REST")
    
    try:
        # Obtener paciente de la API
        response = requests.get('http://localhost:8000/api/pacientes/')
        if response.status_code != 200:
            print(f"❌ Error obteniendo pacientes: {response.status_code}")
            return False
            
        pacientes = response.json()
        pacientes_data = pacientes.get('results', pacientes) if isinstance(pacientes, dict) else pacientes
        
        if not pacientes_data or len(pacientes_data) == 0:
            print("❌ No hay pacientes disponibles")
            return False
            
        paciente = pacientes_data[0]
        print(f"✅ Paciente seleccionado: {paciente.get('nombre_completo', 'Sin nombre')}")
        
        # Obtener dentista
        response = requests.get('http://localhost:8000/api/dentistas/')
        if response.status_code != 200:
            print(f"❌ Error obteniendo dentistas: {response.status_code}")
            return False
            
        dentistas = response.json()
        dentistas_data = dentistas.get('results', dentistas) if isinstance(dentistas, dict) else dentistas
        
        if not dentistas_data or len(dentistas_data) == 0:
            print("❌ No hay dentistas disponibles")
            return False
            
        dentista = dentistas_data[0]
        print(f"✅ Dentista seleccionado: {dentista.get('nombre_completo', 'Sin nombre')}")
        
        # Datos para crear cita
        tomorrow = datetime.now() + timedelta(days=1)
        cita_data = {
            'paciente': paciente['id'],
            'dentista': dentista['id'],
            'fecha_hora': tomorrow.strftime('%Y-%m-%dT10:00:00'),
            'duracion_estimada': 30,
            'tipo_cita': 'consulta',
            'estado': 'programada',
            'motivo_consulta': 'Test de creación de cita via API',
            'notas_dentista': '',
            'observaciones_previas': '',
            'requiere_confirmacion': True
        }
        
        print(f"📋 Datos de la cita: {json.dumps(cita_data, indent=2)}")
        
        # Crear cita via API
        response = requests.post(
            'http://localhost:8000/api/citas/',
            headers={'Content-Type': 'application/json'},
            json=cita_data
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 201:
            cita_created = response.json()
            print(f"✅ Cita creada exitosamente via API: {cita_created.get('numero_cita', 'Sin número')}")
            return True
        else:
            print(f"❌ Error creando cita via API: {response.status_code}")
            print(f"❌ Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en test API: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🔍 Iniciando tests de creación de citas...")
    
    # Test 1: Django ORM directo
    test1_result = test_create_cita_via_django()
    
    # Test 2: API REST
    test2_result = test_create_cita_via_api()
    
    print(f"\n📊 Resultados:")
    print(f"✅ Django ORM: {'PASS' if test1_result else 'FAIL'}")
    print(f"✅ API REST: {'PASS' if test2_result else 'FAIL'}")
    
    if not test1_result and not test2_result:
        print("\n❌ Ambos tests fallaron. Hay un problema fundamental.")
    elif test1_result and not test2_result:
        print("\n⚠️ Django ORM funciona pero API REST falla. Problema en serializers/views.")
    elif not test1_result and test2_result:
        print("\n⚠️ API REST funciona pero Django ORM falla. Problema en modelo.")
    else:
        print("\n✅ Ambos tests pasaron. Sistema funcionando correctamente.")

if __name__ == '__main__':
    main()
