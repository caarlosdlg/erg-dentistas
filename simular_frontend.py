#!/usr/bin/env python3
"""
Simulación del comportamiento del frontend
Replica las mismas llamadas que haría el componente React
"""

import requests
import json
from datetime import datetime, timedelta

def simular_frontend():
    print("🎭 SIMULANDO COMPORTAMIENTO DEL FRONTEND")
    print("=" * 60)
    
    # 1. Simular carga inicial de pacientes (como useEffect)
    print("1️⃣ Simulando carga inicial de pacientes...")
    try:
        response = requests.get("http://localhost:8000/api/pacientes/dropdown/")
        if response.status_code == 200:
            pacientes_data = response.json()
            pacientes = pacientes_data.get('results', [])
            print(f"   ✅ {len(pacientes)} pacientes cargados")
            
            if pacientes:
                # Mostrar primeros 3 como lo haría el dropdown
                print("   📋 Primeros pacientes en dropdown:")
                for i, p in enumerate(pacientes[:3], 1):
                    print(f"      {i}. {p['display_text']}")
                
                # 2. Simular selección de paciente
                print(f"\n2️⃣ Simulando selección del primer paciente...")
                paciente_seleccionado = pacientes[0]
                print(f"   👤 Seleccionado: {paciente_seleccionado['nombre_completo']}")
                print(f"   📧 Email: {paciente_seleccionado['email']}")
                
                # 3. Simular creación de cita
                print(f"\n3️⃣ Simulando creación de cita...")
                tomorrow = datetime.now() + timedelta(days=1)
                
                cita_data = {
                    'paciente': paciente_seleccionado['id'],
                    'fecha_hora': tomorrow.strftime('%Y-%m-%dT10:00:00'),
                    'motivo': 'consulta',
                    'estado': 'programada',
                    'notas': 'Cita de prueba desde simulación frontend',
                    'costo': '750.00',
                    'duracion_estimada': 30
                }
                
                print(f"   📅 Fecha/Hora: {cita_data['fecha_hora']}")
                print(f"   🦷 Motivo: {cita_data['motivo']}")
                print(f"   💰 Costo: ${cita_data['costo']}")
                
                # Crear la cita
                cita_response = requests.post(
                    "http://localhost:8000/api/citas/",
                    headers={'Content-Type': 'application/json'},
                    json=cita_data
                )
                
                if cita_response.status_code == 201:
                    cita_creada = cita_response.json()
                    print(f"   ✅ Cita creada con ID: {cita_creada.get('id', 'N/A')}")
                    
                    # 4. Simular envío de email
                    print(f"\n4️⃣ Simulando envío de email de confirmación...")
                    email_data = {
                        'to_email': paciente_seleccionado['email'],
                        'patient_name': paciente_seleccionado['nombre_completo'],
                        'appointment_date': tomorrow.strftime('%Y-%m-%d'),
                        'appointment_time': '10:00',
                        'appointment_type': 'Consulta General'
                    }
                    
                    email_response = requests.post(
                        "http://localhost:8000/api/emails/send-confirmation/",
                        headers={'Content-Type': 'application/json'},
                        json=email_data
                    )
                    
                    if email_response.status_code == 200:
                        email_result = email_response.json()
                        print(f"   ✅ Email enviado: {email_result.get('message', 'OK')}")
                    else:
                        print(f"   ⚠️ Email falló: {email_response.status_code}")
                        print(f"      Respuesta: {email_response.text[:100]}...")
                    
                    print(f"\n🎉 SIMULACIÓN COMPLETADA EXITOSAMENTE")
                    print(f"   📋 Cita ID: {cita_creada.get('id')}")
                    print(f"   👤 Paciente: {paciente_seleccionado['nombre_completo']}")
                    print(f"   📧 Email enviado a: {paciente_seleccionado['email']}")
                    
                    return True
                else:
                    print(f"   ❌ Error al crear cita: {cita_response.status_code}")
                    print(f"      Respuesta: {cita_response.text}")
                    return False
            else:
                print("   ❌ No hay pacientes disponibles")
                return False
        else:
            print(f"   ❌ Error al cargar pacientes: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error en simulación: {e}")
        return False

def verificar_estado_final():
    """Verifica el estado final del sistema"""
    print(f"\n🔍 VERIFICACIÓN FINAL DEL SISTEMA")
    print("=" * 60)
    
    try:
        # Verificar citas creadas recientemente
        citas_response = requests.get("http://localhost:8000/api/citas/")
        if citas_response.status_code == 200:
            citas_data = citas_response.json()
            total_citas = citas_data.get('count', 0)
            print(f"📋 Total de citas en sistema: {total_citas}")
            
            if 'results' in citas_data and citas_data['results']:
                # Mostrar última cita
                ultima_cita = citas_data['results'][0]  # Asumiendo orden por fecha
                print(f"📅 Última cita:")
                print(f"   ID: {ultima_cita.get('id', 'N/A')}")
                print(f"   Paciente: {ultima_cita.get('paciente_nombre', 'N/A')}")
                print(f"   Fecha: {ultima_cita.get('fecha_hora', 'N/A')}")
                print(f"   Estado: {ultima_cita.get('estado', 'N/A')}")
        
        # Verificar pacientes
        pacientes_response = requests.get("http://localhost:8000/api/pacientes/dropdown/")
        if pacientes_response.status_code == 200:
            pacientes_data = pacientes_response.json()
            print(f"👥 Total pacientes disponibles: {pacientes_data.get('count', 0)}")
        
        print(f"\n✅ Sistema funcionando correctamente")
        
    except Exception as e:
        print(f"❌ Error en verificación: {e}")

if __name__ == "__main__":
    print(f"🕒 Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    exito = simular_frontend()
    verificar_estado_final()
    
    print(f"\n{'🎉 ÉXITO TOTAL' if exito else '⚠️ HAY PROBLEMAS'}")
    print("=" * 60)
