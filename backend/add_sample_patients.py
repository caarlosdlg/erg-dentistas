#!/usr/bin/env python3
"""
Script para agregar pacientes de prueba con emails para testing
"""
import os
import sys
import django

# Setup Django
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from pacientes.models import Paciente
from datetime import date

def create_sample_patients():
    """Crear pacientes de prueba con emails"""
    
    patients_data = [
        {
            'nombre': 'María',
            'apellido_paterno': 'González',
            'apellido_materno': 'López',
            'fecha_nacimiento': date(1985, 3, 15),
            'sexo': 'F',
            'telefono': '+52-555-0123',
            'email': 'maria.gonzalez@gmail.com',
            'direccion': 'Av. Reforma 123, Ciudad de México',
            'tipo_sangre': 'O+',
            'contacto_emergencia_nombre': 'Juan González',
            'contacto_emergencia_telefono': '+52-555-0124',
            'contacto_emergencia_relacion': 'Esposo'
        },
        {
            'nombre': 'Carlos',
            'apellido_paterno': 'Martínez',
            'apellido_materno': 'Ruiz',
            'fecha_nacimiento': date(1978, 7, 22),
            'sexo': 'M',
            'telefono': '+52-555-0125',
            'email': 'carlos.martinez@gmail.com',
            'direccion': 'Calle Juárez 456, Guadalajara',
            'tipo_sangre': 'A+',
            'contacto_emergencia_nombre': 'Ana Martínez',
            'contacto_emergencia_telefono': '+52-555-0126',
            'contacto_emergencia_relacion': 'Esposa'
        },
        {
            'nombre': 'Ana',
            'apellido_paterno': 'Rodríguez',
            'apellido_materno': 'Hernández',
            'fecha_nacimiento': date(1992, 11, 8),
            'sexo': 'F',
            'telefono': '+52-555-0127',
            'email': 'ana.rodriguez@gmail.com',
            'direccion': 'Boulevard Zapata 789, Monterrey',
            'tipo_sangre': 'B+',
            'contacto_emergencia_nombre': 'Luis Rodríguez',
            'contacto_emergencia_telefono': '+52-555-0128',
            'contacto_emergencia_relacion': 'Padre'
        },
        {
            'nombre': 'Juan Carlos',
            'apellido_paterno': 'Pérez',
            'apellido_materno': 'Morales',
            'fecha_nacimiento': date(1980, 5, 12),
            'sexo': 'M',
            'telefono': '+52-555-0129',
            'email': 'juan.perez@outlook.com',
            'direccion': 'Calle Principal 321, Puebla',
            'tipo_sangre': 'AB+',
            'contacto_emergencia_nombre': 'Carmen Pérez',
            'contacto_emergencia_telefono': '+52-555-0130',
            'contacto_emergencia_relacion': 'Madre'
        },
        {
            'nombre': 'Sofia Elena',
            'apellido_paterno': 'Ruiz',
            'apellido_materno': 'Vázquez',
            'fecha_nacimiento': date(1995, 9, 25),
            'sexo': 'F',
            'telefono': '+52-555-0131',
            'email': 'sofia.ruiz@hotmail.com',
            'direccion': 'Av. Universidad 654, Toluca',
            'tipo_sangre': 'O-',
            'contacto_emergencia_nombre': 'Miguel Ruiz',
            'contacto_emergencia_telefono': '+52-555-0132',
            'contacto_emergencia_relacion': 'Hermano'
        }
    ]
    
    created_count = 0
    
    for patient_data in patients_data:
        # Verificar si ya existe un paciente con este email
        if not Paciente.objects.filter(email=patient_data['email']).exists():
            patient = Paciente.objects.create(**patient_data)
            print(f"✅ Paciente creado: {patient.nombre_completo} - {patient.email}")
            created_count += 1
        else:
            print(f"⚠️  Paciente ya existe: {patient_data['email']}")
    
    print(f"\n🎉 Proceso completado. {created_count} pacientes nuevos creados.")
    print(f"📊 Total de pacientes en la BD: {Paciente.objects.count()}")
    
    # Mostrar todos los pacientes con emails
    print("\n📋 Lista de pacientes disponibles:")
    for patient in Paciente.objects.all():
        print(f"   • {patient.nombre_completo} - {patient.email} - {patient.telefono}")

if __name__ == "__main__":
    print("🏥 Creando pacientes de prueba para el sistema de emails...")
    create_sample_patients()
