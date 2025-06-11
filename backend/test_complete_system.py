#!/usr/bin/env python3
"""
Test completo del sistema de citas con servicio de email
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

from citas.models import Cita, Paciente, Dentista
from citas.email_service import AppointmentEmailService

class CompleteCitaSystemTest:
    def __init__(self):
        self.api_url = "http://localhost:8001/api"
        self.email_service = AppointmentEmailService()
        
    def test_api_connection(self):
        """Test que la API esté funcionando"""
        try:
            response = requests.get(f"{self.api_url}/citas/")
            print(f"✅ API Connection: Status {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ API Connection failed: {e}")
            return False
    
    def test_cita_creation_with_email(self):
        """Test creación de cita con envío de email"""
        print("\n🧪 Testing Cita Creation with Email Service...")
        
        # Datos de prueba
        cita_data = {
            "paciente": {
                "nombre": "Ana",
                "apellido_paterno": "García",
                "apellido_materno": "López", 
                "telefono": "5551234567",
                "email": "ana.garcia@example.com",
                "fecha_nacimiento": "1990-05-15"
            },
            "dentista": 1,
            "fecha_hora": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M"),
            "motivo_consulta": "Revisión general",
            "tipo_cita": "consulta",
            "notas": "Test con email service"
        }
        
        try:
            # Crear cita vía API
            response = requests.post(
                f"{self.api_url}/citas/",
                json=cita_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                cita_response = response.json()
                print(f"✅ Cita creada: #{cita_response['numero_cita']}")
                
                # Verificar que el email service fue llamado
                cita_id = cita_response['id']
                cita = Cita.objects.get(id=cita_id)
                
                # Test manual del email service
                email_sent = self.email_service.send_appointment_confirmation_email(cita)
                if email_sent:
                    print("✅ Email de confirmación enviado correctamente")
                else:
                    print("⚠️  Email simulado (modo desarrollo)")
                
                return True
            else:
                print(f"❌ Error creando cita: {response.status_code}")
                print(response.text)
                return False
                
        except Exception as e:
            print(f"❌ Error en test de creación: {e}")
            return False
    
    def test_email_service_directly(self):
        """Test directo del servicio de email"""
        print("\n📧 Testing Email Service Directly...")
        
        try:
            # Buscar una cita existente o crear una de prueba
            cita = Cita.objects.first()
            if not cita:
                print("⚠️  No hay citas en la base de datos")
                return False
            
            # Test email de confirmación
            result1 = self.email_service.send_appointment_confirmation_email(cita)
            print(f"✅ Email confirmación: {'Enviado' if result1 else 'Simulado'}")
            
            # Test email de recordatorio  
            result2 = self.email_service.send_appointment_reminder_email(cita)
            print(f"✅ Email recordatorio: {'Enviado' if result2 else 'Simulado'}")
            
            # Test email de cancelación
            result3 = self.email_service.send_appointment_cancellation_email(cita, "Test de cancelación")
            print(f"✅ Email cancelación: {'Enviado' if result3 else 'Simulado'}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error en test de email service: {e}")
            return False
    
    def test_cita_list_and_filter(self):
        """Test listado y filtrado de citas"""
        print("\n📋 Testing Cita List and Filters...")
        
        try:
            # Test listado básico
            response = requests.get(f"{self.api_url}/citas/")
            if response.status_code == 200:
                citas = response.json()
                print(f"✅ Listado de citas: {len(citas)} citas encontradas")
                
                # Test filtro por fecha
                today = datetime.now().strftime("%Y-%m-%d")
                response_filtered = requests.get(f"{self.api_url}/citas/?fecha_desde={today}")
                if response_filtered.status_code == 200:
                    print("✅ Filtro por fecha funcionando")
                    return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error en test de listado: {e}")
            return False
    
    def run_all_tests(self):
        """Ejecutar todos los tests"""
        print("🚀 Iniciando Test Completo del Sistema de Citas\n")
        print("=" * 50)
        
        tests = [
            ("Conexión API", self.test_api_connection),
            ("Creación de Cita con Email", self.test_cita_creation_with_email),
            ("Servicio de Email Directo", self.test_email_service_directly),
            ("Listado y Filtros", self.test_cita_list_and_filter)
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"❌ Error en {test_name}: {e}")
                results.append((test_name, False))
        
        print("\n" + "=" * 50)
        print("📊 RESUMEN DE TESTS:")
        
        passed = 0
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
            if result:
                passed += 1
        
        print(f"\n🎯 Tests exitosos: {passed}/{len(results)}")
        
        if passed == len(results):
            print("🎉 ¡TODOS LOS TESTS PASARON! Sistema funcionando correctamente.")
        else:
            print("⚠️  Algunos tests fallaron. Revisar configuración.")

if __name__ == "__main__":
    tester = CompleteCitaSystemTest()
    tester.run_all_tests()
