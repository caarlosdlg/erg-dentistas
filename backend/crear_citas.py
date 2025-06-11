#!/usr/bin/env python3
"""
Script para crear 4 citas de ejemplo en la base de datos
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
django.setup()

from citas.models import Cita
from pacientes.models import Paciente
from dentistas.models import Dentista
from tratamientos.models import Tratamiento

def crear_citas():
    print("=== Creando 4 citas de ejemplo ===")
    
    # Obtener algunos pacientes y dentistas existentes
    pacientes = list(Paciente.objects.all()[:4])
    dentistas = list(Dentista.objects.all())
    tratamientos = list(Tratamiento.objects.all()[:4])
    
    if len(pacientes) < 4:
        print("Error: No hay suficientes pacientes. Se necesitan al menos 4.")
        return
    
    if len(dentistas) < 1:
        print("Error: No hay dentistas disponibles.")
        return
    
    print(f"Pacientes disponibles: {len(pacientes)}")
    print(f"Dentistas disponibles: {len(dentistas)}")
    print(f"Tratamientos disponibles: {len(tratamientos)}")
    
    # Datos para las 4 citas
    citas_data = [
        {
            'paciente': pacientes[0],
            'dentista': dentistas[0],
            'fecha_hora': timezone.now() + timedelta(days=1, hours=9),
            'tipo_cita': 'consulta',
            'estado': 'programada',
            'motivo_consulta': 'Dolor en muela del juicio',
            'duracion_estimada': 60,
            'costo_estimado': 150.00,
            'tratamiento': tratamientos[0] if tratamientos else None
        },
        {
            'paciente': pacientes[1],
            'dentista': dentistas[0] if len(dentistas) == 1 else dentistas[1],
            'fecha_hora': timezone.now() + timedelta(days=2, hours=14),
            'tipo_cita': 'limpieza',
            'estado': 'confirmada',
            'motivo_consulta': 'Limpieza dental rutinaria',
            'duracion_estimada': 45,
            'costo_estimado': 80.00,
            'tratamiento': tratamientos[1] if len(tratamientos) > 1 else None
        },
        {
            'paciente': pacientes[2],
            'dentista': dentistas[0] if len(dentistas) == 1 else dentistas[-1],
            'fecha_hora': timezone.now() + timedelta(days=3, hours=10, minutes=30),
            'tipo_cita': 'tratamiento',
            'estado': 'programada',
            'motivo_consulta': 'Empaste en premolar',
            'duracion_estimada': 90,
            'costo_estimado': 250.00,
            'tratamiento': tratamientos[2] if len(tratamientos) > 2 else None
        },
        {
            'paciente': pacientes[3],
            'dentista': dentistas[0],
            'fecha_hora': timezone.now() + timedelta(days=5, hours=16),
            'tipo_cita': 'revision',
            'estado': 'programada',
            'motivo_consulta': 'Revisión post-tratamiento',
            'duracion_estimada': 30,
            'costo_estimado': 50.00,
            'tratamiento': tratamientos[3] if len(tratamientos) > 3 else None
        }
    ]
    
    citas_creadas = []
    
    for i, data in enumerate(citas_data, 1):
        try:
            # Generar número de cita único
            numero_cita = f"CITA-{timezone.now().strftime('%Y%m%d')}-{i:03d}"
            
            cita = Cita.objects.create(
                paciente=data['paciente'],
                dentista=data['dentista'],
                fecha_hora=data['fecha_hora'],
                tipo_cita=data['tipo_cita'],
                estado=data['estado'],
                motivo_consulta=data['motivo_consulta'],
                duracion_estimada=data['duracion_estimada'],
                costo_estimado=data['costo_estimado'],
                numero_cita=numero_cita,
                tratamiento=data['tratamiento'],
                notas_dentista=f"Cita {i} creada automáticamente",
                requiere_confirmacion=True
            )
            
            citas_creadas.append(cita)
            
            print(f"✅ Cita {i} creada:")
            print(f"   - ID: {cita.id}")
            print(f"   - Número: {cita.numero_cita}")
            print(f"   - Paciente: {cita.paciente.nombre} {cita.paciente.apellido_paterno}")
            print(f"   - Email Paciente: {cita.paciente.email}")
            print(f"   - Dentista: {cita.dentista.user.first_name} {cita.dentista.user.last_name}")
            print(f"   - Fecha: {cita.fecha_hora.strftime('%Y-%m-%d %H:%M')}")
            print(f"   - Tipo: {cita.get_tipo_cita_display()}")
            print(f"   - Estado: {cita.get_estado_display()}")
            print(f"   - Motivo: {cita.motivo_consulta}")
            print(f"   - Costo: ${cita.costo_estimado}")
            print()
            
        except Exception as e:
            print(f"❌ Error creando cita {i}: {str(e)}")
    
    print(f"=== Resumen: {len(citas_creadas)} citas creadas exitosamente ===")
    
    # Verificar que las citas se crearon
    total_citas = Cita.objects.count()
    print(f"Total de citas en la base de datos: {total_citas}")

if __name__ == "__main__":
    crear_citas()
