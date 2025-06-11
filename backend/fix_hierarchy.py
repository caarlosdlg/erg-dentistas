#!/usr/bin/env python3
"""
Script to fix the hierarchical structure of categories and treatments
"""

import os
import sys
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tratamientos.models import CategoriaTratamiento, Tratamiento
from django.db import transaction

def fix_hierarchy():
    """
    Fix and create proper hierarchical structure
    """
    print("🔧 Fixing hierarchical structure...")
    
    with transaction.atomic():
        # First, let's create a clear hierarchy with some existing categories
        
        # 1. Find or create main categories
        preventivos, _ = CategoriaTratamiento.objects.get_or_create(
            nombre="Servicios Preventivos",
            defaults={
                'slug': 'servicios-preventivos',
                'descripcion': 'Servicios de prevención dental',
                'color': '#28a745',
                'icono': '🛡️',
                'activo': True
            }
        )
        
        restaurativos, _ = CategoriaTratamiento.objects.get_or_create(
            nombre="Servicios Restaurativos", 
            defaults={
                'slug': 'servicios-restaurativos',
                'descripcion': 'Servicios de restauración dental',
                'color': '#17a2b8',
                'icono': '🦷',
                'activo': True
            }
        )
        
        quirurgicos, _ = CategoriaTratamiento.objects.get_or_create(
            nombre="Servicios Quirúrgicos",
            defaults={
                'slug': 'servicios-quirurgicos', 
                'descripcion': 'Procedimientos quirúrgicos dentales',
                'color': '#dc3545',
                'icono': '⚕️',
                'activo': True
            }
        )
        
        esteticos, _ = CategoriaTratamiento.objects.get_or_create(
            nombre="Servicios Estéticos",
            defaults={
                'slug': 'servicios-esteticos',
                'descripcion': 'Tratamientos estéticos dentales', 
                'color': '#ffc107',
                'icono': '✨',
                'activo': True
            }
        )
        
        # 2. Set up subcategories under Preventivos
        limpiezas = CategoriaTratamiento.objects.filter(nombre__icontains="Limpieza").first()
        if limpiezas:
            limpiezas.parent = preventivos
            limpiezas.save()
            print(f"✅ {limpiezas.nombre} ahora es hijo de {preventivos.nombre}")
        
        # Find fluorización and education categories
        fluor_cats = CategoriaTratamiento.objects.filter(nombre__icontains="Fluor")
        for cat in fluor_cats:
            cat.parent = preventivos
            cat.save()
            print(f"✅ {cat.nombre} ahora es hijo de {preventivos.nombre}")
            
        educacion_cats = CategoriaTratamiento.objects.filter(nombre__icontains="Educación")
        for cat in educacion_cats:
            cat.parent = preventivos
            cat.save()
            print(f"✅ {cat.nombre} ahora es hijo de {preventivos.nombre}")
        
        # 3. Set up subcategories under Restaurativos
        obturaciones = CategoriaTratamiento.objects.filter(nombre__icontains="Obturación").first()
        if obturaciones:
            obturaciones.parent = restaurativos
            obturaciones.save()
            print(f"✅ {obturaciones.nombre} ahora es hijo de {restaurativos.nombre}")
            
        coronas = CategoriaTratamiento.objects.filter(nombre__icontains="Corona").first()
        if coronas:
            coronas.parent = restaurativos
            coronas.save()
            print(f"✅ {coronas.nombre} ahora es hijo de {restaurativos.nombre}")
            
        endodoncia = CategoriaTratamiento.objects.filter(nombre__icontains="Endodoncia").first()
        if endodoncia:
            endodoncia.parent = restaurativos
            endodoncia.save()
            print(f"✅ {endodoncia.nombre} ahora es hijo de {restaurativos.nombre}")
        
        # 4. Set up subcategories under Quirúrgicos
        cirugia_cats = CategoriaTratamiento.objects.filter(nombre__icontains="Cirugía")
        for cat in cirugia_cats:
            if cat != quirurgicos:  # Don't make it parent of itself
                cat.parent = quirurgicos
                cat.save()
                print(f"✅ {cat.nombre} ahora es hijo de {quirurgicos.nombre}")
                
        implantes = CategoriaTratamiento.objects.filter(nombre__icontains="Implante").first()
        if implantes:
            implantes.parent = quirurgicos
            implantes.save()
            print(f"✅ {implantes.nombre} ahora es hijo de {quirurgicos.nombre}")
        
        # 5. Set up subcategories under Estéticos
        blanqueamiento_cats = CategoriaTratamiento.objects.filter(nombre__icontains="Blanqueamiento")
        for cat in blanqueamiento_cats:
            if cat != esteticos:  # Don't make it parent of itself
                cat.parent = esteticos
                cat.save()
                print(f"✅ {cat.nombre} ahora es hijo de {esteticos.nombre}")
        
        # 6. Create some third-level categories
        if limpiezas:
            # Create subcategories for limpiezas
            limpieza_basica, _ = CategoriaTratamiento.objects.get_or_create(
                nombre="Limpieza Básica",
                defaults={
                    'slug': 'limpieza-basica',
                    'parent': limpiezas,
                    'descripcion': 'Limpieza dental básica',
                    'color': '#28a745',
                    'icono': '🪥',
                    'activo': True
                }
            )
            
            limpieza_profunda, _ = CategoriaTratamiento.objects.get_or_create(
                nombre="Limpieza Profunda",
                defaults={
                    'slug': 'limpieza-profunda',
                    'parent': limpiezas,
                    'descripcion': 'Limpieza dental profunda',
                    'color': '#28a745',
                    'icono': '🧽',
                    'activo': True
                }
            )
            
            # Fourth level categories
            limpieza_adultos, _ = CategoriaTratamiento.objects.get_or_create(
                nombre="Limpieza para Adultos",
                defaults={
                    'slug': 'limpieza-adultos',
                    'parent': limpieza_basica,
                    'descripcion': 'Limpieza especializada para adultos',
                    'color': '#28a745',
                    'icono': '👨‍⚕️',
                    'activo': True
                }
            )
            
            limpieza_ninos, _ = CategoriaTratamiento.objects.get_or_create(
                nombre="Limpieza para Niños",
                defaults={
                    'slug': 'limpieza-ninos',
                    'parent': limpieza_basica,
                    'descripcion': 'Limpieza especializada para niños',
                    'color': '#28a745',
                    'icono': '👶',
                    'activo': True
                }
            )
        
        # 7. Rebuild the MPTT tree
        CategoriaTratamiento.objects.rebuild()
        print("🔧 MPTT tree rebuilt")
        
        # 8. Show the final structure
        print("\n📊 Final hierarchy structure:")
        root_categories = CategoriaTratamiento.objects.filter(parent=None)
        
        for root in root_categories:
            print(f"📁 {root.nombre} (Level {root.level})")
            for child in root.get_children():
                print(f"  📂 {child.nombre} (Level {child.level})")
                for grandchild in child.get_children():
                    print(f"    📄 {grandchild.nombre} (Level {grandchild.level})")
                    for great_grandchild in grandchild.get_children():
                        print(f"      📝 {great_grandchild.nombre} (Level {great_grandchild.level})")
        
        print(f"\n✅ Hierarchy fixed! Total categories: {CategoriaTratamiento.objects.count()}")
        print(f"Root categories: {CategoriaTratamiento.objects.filter(parent=None).count()}")
        print(f"Categories with children: {CategoriaTratamiento.objects.filter(children__isnull=False).distinct().count()}")

if __name__ == "__main__":
    fix_hierarchy()
