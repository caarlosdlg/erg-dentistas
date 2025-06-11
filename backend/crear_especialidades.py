#!/usr/bin/env python3
"""
Script para crear especialidades dentales por defecto
"""
import os
import sys
import django

# Configurar Django
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from dentistas.models import Especialidad

def crear_especialidades():
    """Crear especialidades dentales por defecto"""
    
    especialidades_defecto = [
        {
            'nombre': 'Odontología General',
            'descripcion': 'Atención dental integral, prevención, diagnóstico y tratamiento básico'
        },
        {
            'nombre': 'Ortodoncia',
            'descripcion': 'Corrección de la posición de los dientes y problemas de mordida'
        },
        {
            'nombre': 'Endodoncia',
            'descripcion': 'Tratamiento de conductos radiculares y pulpa dental'
        },
        {
            'nombre': 'Periodoncia',
            'descripcion': 'Tratamiento de enfermedades de las encías y tejidos de soporte'
        },
        {
            'nombre': 'Cirugía Oral',
            'descripcion': 'Cirugías dentales, extracciones e implantes'
        },
        {
            'nombre': 'Odontopediatría',
            'descripcion': 'Odontología especializada en niños y adolescentes'
        },
        {
            'nombre': 'Prostodoncia',
            'descripcion': 'Rehabilitación oral con prótesis dentales'
        },
        {
            'nombre': 'Estética Dental',
            'descripcion': 'Tratamientos para mejorar la apariencia de la sonrisa'
        },
        {
            'nombre': 'Implantología',
            'descripcion': 'Colocación y mantenimiento de implantes dentales'
        }
    ]
    
    creadas = 0
    for esp_data in especialidades_defecto:
        especialidad, created = Especialidad.objects.get_or_create(
            nombre=esp_data['nombre'],
            defaults={
                'descripcion': esp_data['descripcion'],
                'activo': True
            }
        )
        if created:
            print(f"✅ Creada especialidad: {especialidad.nombre}")
            creadas += 1
        else:
            print(f"ℹ️  Ya existe: {especialidad.nombre}")
    
    print(f"\n🎉 Proceso completado: {creadas} especialidades nuevas creadas")
    print(f"📊 Total de especialidades: {Especialidad.objects.count()}")

if __name__ == '__main__':
    crear_especialidades()
