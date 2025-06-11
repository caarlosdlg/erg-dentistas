#!/usr/bin/env python3
"""
Script para crear tratamientos de ejemplo con las categorías jerárquicas
"""

import os
import sys
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from tratamientos.models import CategoriaTratamiento, Tratamiento
from django.db import transaction
import random

def create_sample_treatments():
    """
    Create sample treatments for testing the hierarchical system
    """
    print("🚀 Creando tratamientos de ejemplo...")
    
    with transaction.atomic():
        # Get categories to assign treatments to
        categories = CategoriaTratamiento.objects.all()
        
        sample_treatments = [
            # Preventive treatments
            {
                'nombre': 'Limpieza Dental Básica',
                'codigo': 'PREV-001',
                'descripcion': 'Limpieza dental preventiva con ultrasonido y pulido',
                'precio_base': 1200.00,
                'duracion_estimada': 45,
                'popular': True,
                'categoria_nombre': 'Limpieza Básica'
            },
            {
                'nombre': 'Limpieza Dental Profunda',
                'codigo': 'PREV-002', 
                'descripcion': 'Limpieza profunda con curetaje y alisado radicular',
                'precio_base': 2500.00,
                'duracion_estimada': 90,
                'popular': False,
                'categoria_nombre': 'Limpieza Profunda'
            },
            {
                'nombre': 'Aplicación de Fluoruro',
                'codigo': 'PREV-003',
                'descripcion': 'Aplicación tópica de fluoruro para prevención de caries',
                'precio_base': 500.00,
                'duracion_estimada': 15,
                'popular': True,
                'categoria_nombre': 'Fluorización'
            },
            {
                'nombre': 'Limpieza Pediatrica',
                'codigo': 'PREV-004',
                'descripcion': 'Limpieza dental especializada para niños de 3-12 años',
                'precio_base': 800.00,
                'duracion_estimada': 30,
                'popular': True,
                'categoria_nombre': 'Limpieza para Niños'
            },
            
            # Restorative treatments
            {
                'nombre': 'Resina Dental Anterior',
                'codigo': 'REST-001',
                'descripcion': 'Obturación con resina compuesta en dientes anteriores',
                'precio_base': 1800.00,
                'duracion_estimada': 60,
                'popular': True,
                'categoria_nombre': 'Resinas en Dientes Anteriores'
            },
            {
                'nombre': 'Resina Dental Posterior',
                'codigo': 'REST-002',
                'descripcion': 'Obturación con resina compuesta en dientes posteriores',
                'precio_base': 1500.00,
                'duracion_estimada': 45,
                'popular': True,
                'categoria_nombre': 'Resinas en Dientes Posteriores'
            },
            {
                'nombre': 'Corona de Porcelana',
                'codigo': 'REST-003',
                'descripcion': 'Corona individual de porcelana sobre metal',
                'precio_base': 8500.00,
                'duracion_estimada': 120,
                'popular': False,
                'categoria_nombre': 'Coronas Individuales'
            },
            {
                'nombre': 'Puente Dental de 3 Piezas',
                'codigo': 'REST-004',
                'descripcion': 'Puente fijo de 3 piezas en porcelana',
                'precio_base': 15000.00,
                'duracion_estimada': 180,
                'popular': False,
                'categoria_nombre': 'Puentes Dentales'
            },
            {
                'nombre': 'Endodoncia Unirradicular',
                'codigo': 'REST-005',
                'descripcion': 'Tratamiento de conducto en diente unirradicular',
                'precio_base': 3500.00,
                'duracion_estimada': 90,
                'popular': False,
                'categoria_nombre': 'Endodoncia'
            },
            
            # Surgical treatments
            {
                'nombre': 'Extracción Simple',
                'codigo': 'CIR-001',
                'descripcion': 'Extracción dental simple sin complicaciones',
                'precio_base': 1500.00,
                'duracion_estimada': 30,
                'popular': True,
                'categoria_nombre': 'Extracciones Simples'
            },
            {
                'nombre': 'Extracción Quirúrgica',
                'codigo': 'CIR-002',
                'descripcion': 'Extracción quirúrgica de diente impactado',
                'precio_base': 4500.00,
                'duracion_estimada': 90,
                'popular': False,
                'categoria_nombre': 'Extracciones Quirúrgicas'
            },
            {
                'nombre': 'Implante Dental Titanio',
                'codigo': 'CIR-003',
                'descripcion': 'Colocación de implante dental de titanio',
                'precio_base': 25000.00,
                'duracion_estimada': 120,
                'popular': True,
                'categoria_nombre': 'Implantes Dentales'
            },
            
            # Aesthetic treatments
            {
                'nombre': 'Blanqueamiento en Consultorio',
                'codigo': 'EST-001',
                'descripcion': 'Blanqueamiento dental profesional con láser',
                'precio_base': 4500.00,
                'duracion_estimada': 90,
                'popular': True,
                'categoria_nombre': 'Blanqueamiento en Consultorio'
            },
            {
                'nombre': 'Kit Blanqueamiento Domiciliario',
                'codigo': 'EST-002',
                'descripcion': 'Kit de blanqueamiento para uso en casa',
                'precio_base': 2500.00,
                'duracion_estimada': 30,
                'popular': True,
                'categoria_nombre': 'Blanqueamiento Domiciliario'
            }
        ]
        
        created_count = 0
        
        for treatment_data in sample_treatments:
            # Find the category by name
            categoria = None
            try:
                categoria = CategoriaTratamiento.objects.get(
                    nombre__icontains=treatment_data['categoria_nombre']
                )
            except CategoriaTratamiento.DoesNotExist:
                # Try to find by partial match
                for cat in categories:
                    if treatment_data['categoria_nombre'].lower() in cat.nombre.lower():
                        categoria = cat
                        break
                
                if not categoria:
                    # Use a random category as fallback
                    categoria = random.choice(list(categories))
                    print(f"⚠️  No se encontró categoría '{treatment_data['categoria_nombre']}', usando '{categoria.nombre}'")
            
            # Remove categoria_nombre from data
            del treatment_data['categoria_nombre']
            
            # Create or update treatment
            tratamiento, created = Tratamiento.objects.get_or_create(
                codigo=treatment_data['codigo'],
                defaults={
                    **treatment_data,
                    'categoria': categoria,
                    'activo': True
                }
            )
            
            if created:
                print(f"✅ Creado tratamiento: {tratamiento.nombre} - {tratamiento.codigo}")
                created_count += 1
            else:
                print(f"ℹ️  Tratamiento existente: {tratamiento.nombre} - {tratamiento.codigo}")
        
        print(f"\n🎉 Proceso completado!")
        print(f"✅ Tratamientos creados: {created_count}")
        print(f"📊 Total de tratamientos: {Tratamiento.objects.count()}")
        print(f"📂 Total de categorías: {CategoriaTratamiento.objects.count()}")
        
        # Show distribution by categories
        print(f"\n📈 Distribución por categorías:")
        for categoria in CategoriaTratamiento.objects.all():
            count = Tratamiento.objects.filter(categoria=categoria).count()
            if count > 0:
                print(f"  {categoria.nombre}: {count} tratamientos")

if __name__ == "__main__":
    create_sample_treatments()
