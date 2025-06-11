#!/usr/bin/env python3
"""
Test simple para verificar que el sistema de emails con Resend funciona
"""
import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

# Now import Django models
from citas.resend_email_service import ResendEmailService, send_appointment_confirmation_email_resend
from pacientes.models import Paciente
from citas.models import Cita
from dentistas.models import Dentista

def main():
    print("🧪 Prueba simple del sistema de emails con Resend")
    print("=" * 60)
    
    try:
        # 1. Verificar configuración de Resend
        print("1. Verificando configuración de Resend...")
        service = ResendEmailService()
        print(f"   ✅ API Key configurada: {service.api_key[:20]}...")
        print(f"   ✅ From Email: {service.from_email}")
        
        # 2. Verificar que existen pacientes con email
        print("\n2. Verificando pacientes con email...")
        pacientes_con_email = Paciente.objects.filter(email__isnull=False).exclude(email='')
        print(f"   📊 Pacientes con email: {pacientes_con_email.count()}")
        
        if pacientes_con_email.count() == 0:
            print("   ⚠️  No hay pacientes con email. Creando un paciente de prueba...")
            # Crear un paciente de prueba
            paciente_prueba = Paciente.objects.create(
                nombre="Juan",
                apellido_paterno="Pérez",
                apellido_materno="García",
                email="juan.perez@test.com",
                telefono="+52-555-1234",
                fecha_nacimiento="1990-01-01",
                sexo="M"
            )
            print(f"   ✅ Paciente creado: {paciente_prueba.nombre} - {paciente_prueba.email}")
        else:
            paciente_prueba = pacientes_con_email.first()
            print(f"   ✅ Usando paciente existente: {paciente_prueba.nombre} - {paciente_prueba.email}")
        
        # 3. Verificar que existe al menos un dentista
        print("\n3. Verificando dentistas...")
        dentistas = Dentista.objects.all()
        print(f"   📊 Dentistas disponibles: {dentistas.count()}")
        
        if dentistas.count() == 0:
            print("   ⚠️  No hay dentistas. Necesitas crear al menos un dentista en el admin.")
            return
        
        dentista = dentistas.first()
        print(f"   ✅ Usando dentista: {dentista}")
        
        # 4. Verificar que existen citas
        print("\n4. Verificando citas...")
        citas = Cita.objects.all()
        print(f"   📊 Citas disponibles: {citas.count()}")
        
        # Buscar una cita programada con paciente que tenga email
        cita_programada = Cita.objects.filter(
            estado='programada',
            paciente__email__isnull=False
        ).exclude(paciente__email='').first()
        
        if cita_programada:
            print(f"   ✅ Cita de prueba encontrada: {cita_programada.numero_cita}")
            print(f"       Paciente: {cita_programada.paciente.nombre} - {cita_programada.paciente.email}")
            print(f"       Estado: {cita_programada.estado}")
            
            # 5. Probar envío de email
            print("\n5. Probando envío de email...")
            print(f"   📧 Enviando email de confirmación a: {cita_programada.paciente.email}")
            
            resultado = send_appointment_confirmation_email_resend(cita_programada)
            
            if resultado:
                print("   ✅ ¡Email enviado exitosamente!")
                print(f"   📋 Cita confirmada: {cita_programada.numero_cita}")
                print(f"   👤 Paciente: {cita_programada.paciente.nombre}")
                print(f"   📧 Email: {cita_programada.paciente.email}")
            else:
                print("   ❌ Error al enviar email")
        else:
            print("   ⚠️  No se encontró una cita programada con paciente con email")
            print("   💡 Sugerencia: Crea una cita con un paciente que tenga email")
        
        print("\n" + "=" * 60)
        print("✅ Prueba completada")
        
    except Exception as e:
        print(f"\n❌ Error durante la prueba: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
