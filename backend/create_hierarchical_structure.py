#!/usr/bin/env python
"""
Script para crear estructura jerárquica profunda de categorías de tratamientos
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.db import transaction
from tratamientos.models import CategoriaTratamiento, Tratamiento
from django.utils import timezone
import decimal

def create_hierarchical_structure():
    """Crear estructura jerárquica completa de tratamientos dentales"""
    
    print("🚀 Creando estructura jerárquica de tratamientos...")
    
    with transaction.atomic():
        # Limpiar categorías existentes si es necesario
        # CategoriaTratamiento.objects.all().delete()
        
        # 1. SERVICIOS PREVENTIVOS (Nivel 1)
        preventivos = create_or_get_category(
            nombre="Servicios Preventivos",
            descripcion="Tratamientos para prevenir problemas dentales",
            color="#10B981",
            icono="🦷",
            orden=1
        )
        
        # 1.1 Limpiezas Dentales (Nivel 2)
        limpiezas = create_or_get_category(
            nombre="Limpiezas Dentales",
            descripcion="Servicios de limpieza e higiene dental",
            color="#059669",
            icono="🪥",
            parent=preventivos,
            orden=1
        )
        
        # 1.1.1 Limpieza Básica (Nivel 3)
        limpieza_basica = create_or_get_category(
            nombre="Limpieza Básica",
            descripcion="Limpieza dental de rutina",
            color="#047857",
            icono="🧽",
            parent=limpiezas,
            orden=1
        )
        
        # 1.1.1.1 Limpieza Adultos (Nivel 4)
        create_or_get_category(
            nombre="Limpieza para Adultos",
            descripcion="Limpieza dental estándar para adultos",
            color="#065f46",
            icono="👨‍⚕️",
            parent=limpieza_basica,
            orden=1
        )
        
        # 1.1.1.2 Limpieza Niños (Nivel 4)
        limpieza_ninos = create_or_get_category(
            nombre="Limpieza para Niños",
            descripcion="Limpieza dental especializada para niños",
            color="#065f46",
            icono="👶",
            parent=limpieza_basica,
            orden=2
        )
        
        # 1.1.2 Limpieza Profunda (Nivel 3)
        limpieza_profunda = create_or_get_category(
            nombre="Limpieza Profunda",
            descripcion="Limpieza dental intensiva",
            color="#047857",
            icono="🧹",
            parent=limpiezas,
            orden=2
        )
        
        # 1.2 Fluorización (Nivel 2)
        fluorizacion = create_or_get_category(
            nombre="Fluorización",
            descripcion="Aplicación de flúor para fortalecer dientes",
            color="#059669",
            icono="💧",
            parent=preventivos,
            orden=2
        )
        
        # 2. SERVICIOS RESTAURATIVOS (Nivel 1)
        restaurativos = create_or_get_category(
            nombre="Servicios Restaurativos",
            descripcion="Tratamientos para restaurar dientes dañados",
            color="#3B82F6",
            icono="🔧",
            orden=2
        )
        
        # 2.1 Obturaciones (Nivel 2)
        obturaciones = create_or_get_category(
            nombre="Obturaciones",
            descripcion="Empastes y rellenos dentales",
            color="#2563EB",
            icono="🔩",
            parent=restaurativos,
            orden=1
        )
        
        # 2.1.1 Resinas (Nivel 3)
        resinas = create_or_get_category(
            nombre="Resinas Dentales",
            descripcion="Empastes estéticos del color del diente",
            color="#1D4ED8",
            icono="🎨",
            parent=obturaciones,
            orden=1
        )
        
        # 2.1.1.1 Resinas Anteriores (Nivel 4)
        create_or_get_category(
            nombre="Resinas en Dientes Anteriores",
            descripcion="Resinas para dientes frontales",
            color="#1E3A8A",
            icono="😁",
            parent=resinas,
            orden=1
        )
        
        # 2.1.1.2 Resinas Posteriores (Nivel 4)
        create_or_get_category(
            nombre="Resinas en Dientes Posteriores",
            descripcion="Resinas para molares y premolares",
            color="#1E3A8A",
            icono="🦷",
            parent=resinas,
            orden=2
        )
        
        # 2.1.2 Amalgamas (Nivel 3)
        amalgamas = create_or_get_category(
            nombre="Amalgamas",
            descripcion="Empastes de amalgama de plata",
            color="#1D4ED8",
            icono="⚪",
            parent=obturaciones,
            orden=2
        )
        
        # 2.2 Coronas y Puentes (Nivel 2)
        coronas = create_or_get_category(
            nombre="Coronas y Puentes",
            descripcion="Prótesis fijas dentales",
            color="#2563EB",
            icono="👑",
            parent=restaurativos,
            orden=2
        )
        
        # 2.2.1 Coronas (Nivel 3)
        create_or_get_category(
            nombre="Coronas Individuales",
            descripcion="Coronas para dientes individuales",
            color="#1D4ED8",
            icono="👑",
            parent=coronas,
            orden=1
        )
        
        # 2.2.2 Puentes (Nivel 3)
        create_or_get_category(
            nombre="Puentes Dentales",
            descripcion="Puentes para reemplazar dientes faltantes",
            color="#1D4ED8",
            icono="🌉",
            parent=coronas,
            orden=2
        )
        
        # 3. SERVICIOS QUIRÚRGICOS (Nivel 1)
        quirurgicos = create_or_get_category(
            nombre="Servicios Quirúrgicos",
            descripcion="Procedimientos quirúrgicos dentales",
            color="#EF4444",
            icono="⚕️",
            orden=3
        )
        
        # 3.1 Extracciones (Nivel 2)
        extracciones = create_or_get_category(
            nombre="Extracciones Dentales",
            descripcion="Procedimientos de extracción dental",
            color="#DC2626",
            icono="🦷",
            parent=quirurgicos,
            orden=1
        )
        
        # 3.1.1 Extracciones Simples (Nivel 3)
        create_or_get_category(
            nombre="Extracciones Simples",
            descripcion="Extracciones dentales básicas",
            color="#B91C1C",
            icono="🪚",
            parent=extracciones,
            orden=1
        )
        
        # 3.1.2 Extracciones Quirúrgicas (Nivel 3)
        create_or_get_category(
            nombre="Extracciones Quirúrgicas",
            descripcion="Extracciones complejas que requieren cirugía",
            color="#B91C1C",
            icono="🔬",
            parent=extracciones,
            orden=2
        )
        
        # 3.2 Implantes (Nivel 2)
        implantes = create_or_get_category(
            nombre="Implantes Dentales",
            descripcion="Colocación de implantes dentales",
            color="#DC2626",
            icono="🔩",
            parent=quirurgicos,
            orden=2
        )
        
        # 4. SERVICIOS ESTÉTICOS (Nivel 1)
        esteticos = create_or_get_category(
            nombre="Servicios Estéticos",
            descripcion="Tratamientos para mejorar la apariencia dental",
            color="#8B5CF6",
            icono="✨",
            orden=4
        )
        
        # 4.1 Blanqueamiento (Nivel 2)
        blanqueamiento = create_or_get_category(
            nombre="Blanqueamiento Dental",
            descripcion="Procedimientos de blanqueamiento dental",
            color="#7C3AED",
            icono="⚡",
            parent=esteticos,
            orden=1
        )
        
        # 4.1.1 Blanqueamiento en Consultorio (Nivel 3)
        create_or_get_category(
            nombre="Blanqueamiento en Consultorio",
            descripcion="Blanqueamiento profesional en clínica",
            color="#6D28D9",
            icono="🏥",
            parent=blanqueamiento,
            orden=1
        )
        
        # 4.1.2 Blanqueamiento en Casa (Nivel 3)
        create_or_get_category(
            nombre="Blanqueamiento Domiciliario",
            descripcion="Blanqueamiento para realizar en casa",
            color="#6D28D9",
            icono="🏠",
            parent=blanqueamiento,
            orden=2
        )
        
        # Crear algunos tratamientos de ejemplo
        create_sample_treatments()
        
        print("✅ Estructura jerárquica creada exitosamente")
        print_tree_structure()

def create_or_get_category(nombre, descripcion="", color="#6B7280", icono="🦷", parent=None, orden=0):
    """Crear o obtener una categoría"""
    categoria, created = CategoriaTratamiento.objects.get_or_create(
        nombre=nombre,
        defaults={
            'descripcion': descripcion,
            'color': color,
            'icono': icono,
            'parent': parent,
            'orden': orden,
            'activo': True
        }
    )
    
    if created:
        print(f"✅ Creada categoría: {'  ' * (categoria.level if hasattr(categoria, 'level') else 0)}{nombre}")
    else:
        print(f"ℹ️  Categoría existente: {nombre}")
    
    return categoria

def create_sample_treatments():
    """Crear algunos tratamientos de ejemplo"""
    
    print("\n🔧 Creando tratamientos de ejemplo...")
    
    # Obtener algunas categorías para asignar tratamientos
    limpieza_adultos = CategoriaTratamiento.objects.filter(nombre="Limpieza para Adultos").first()
    limpieza_ninos = CategoriaTratamiento.objects.filter(nombre="Limpieza para Niños").first()
    resinas_anteriores = CategoriaTratamiento.objects.filter(nombre="Resinas en Dientes Anteriores").first()
    resinas_posteriores = CategoriaTratamiento.objects.filter(nombre="Resinas en Dientes Posteriores").first()
    
    tratamientos = [
        {
            'nombre': 'Limpieza Dental Completa para Adultos',
            'categoria': limpieza_adultos,
            'precio_base': decimal.Decimal('800.00'),
            'duracion_estimada': 60,
            'descripcion': 'Limpieza dental completa con detartraje y pulido',
            'popular': True
        },
        {
            'nombre': 'Limpieza Dental Pediátrica',
            'categoria': limpieza_ninos,
            'precio_base': decimal.Decimal('600.00'),
            'duracion_estimada': 45,
            'descripcion': 'Limpieza dental especializada para niños',
            'popular': True
        },
        {
            'nombre': 'Resina Estética Anterior',
            'categoria': resinas_anteriores,
            'precio_base': decimal.Decimal('1200.00'),
            'duracion_estimada': 90,
            'descripcion': 'Empaste estético en dientes frontales',
            'popular': False
        },
        {
            'nombre': 'Resina en Molar',
            'categoria': resinas_posteriores,
            'precio_base': decimal.Decimal('1000.00'),
            'duracion_estimada': 75,
            'descripcion': 'Empaste de resina en dientes posteriores',
            'popular': False
        }
    ]
    
    for tratamiento_data in tratamientos:
        if tratamiento_data['categoria']:
            tratamiento, created = Tratamiento.objects.get_or_create(
                nombre=tratamiento_data['nombre'],
                defaults=tratamiento_data
            )
            
            if created:
                print(f"✅ Creado tratamiento: {tratamiento.nombre}")
            else:
                print(f"ℹ️  Tratamiento existente: {tratamiento.nombre}")

def print_tree_structure():
    """Mostrar la estructura del árbol"""
    print("\n🌳 Estructura del árbol de categorías:")
    print("=" * 50)
    
    for categoria in CategoriaTratamiento.objects.all():
        indent = "  " * categoria.level
        print(f"{indent}{categoria.icono} {categoria.nombre} (Nivel {categoria.level})")
        
        # Mostrar tratamientos en esta categoría
        tratamientos = categoria.tratamientos.all()
        if tratamientos:
            for tratamiento in tratamientos:
                print(f"{indent}  ├─ {tratamiento.nombre} (${tratamiento.precio_base})")
    
    print("=" * 50)
    print(f"📊 Total de categorías: {CategoriaTratamiento.objects.count()}")
    print(f"📊 Total de tratamientos: {Tratamiento.objects.count()}")

if __name__ == "__main__":
    create_hierarchical_structure()
