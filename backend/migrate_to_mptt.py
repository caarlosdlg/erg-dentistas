#!/usr/bin/env python
"""
Script para migrar las categorías existentes a estructura MPTT
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.db import transaction
from tratamientos.models import CategoriaTratamiento
from django.utils import timezone
import uuid

def migrate_to_mptt():
    """Migrar categorías existentes a estructura MPTT"""
    
    print("Iniciando migración a MPTT...")
    
    with transaction.atomic():
        # Obtener todas las categorías existentes
        categorias = CategoriaTratamiento.objects.all()
        
        print(f"Encontradas {categorias.count()} categorías")
        
        if categorias.count() == 0:
            print("No hay categorías existentes. Creando algunas de ejemplo...")
            create_sample_categories()
        else:
            print("Actualizando categorías existentes...")
            update_existing_categories()
        
        print("✅ Migración completada exitosamente")

def create_sample_categories():
    """Crear categorías de ejemplo"""
    
    # Categorías principales
    preventivos = CategoriaTratamiento.objects.create(
        nombre="Servicios Preventivos",
        descripcion="Tratamientos para prevenir problemas dentales",
        color="#10B981",
        icono="🦷",
        activo=True,
        orden=1
    )
    
    restaurativos = CategoriaTratamiento.objects.create(
        nombre="Servicios Restaurativos", 
        descripcion="Tratamientos para restaurar dientes dañados",
        color="#3B82F6",
        icono="🔧",
        activo=True,
        orden=2
    )
    
    quirurgicos = CategoriaTratamiento.objects.create(
        nombre="Servicios Quirúrgicos",
        descripcion="Procedimientos quirúrgicos dentales",
        color="#EF4444",
        icono="⚕️",
        activo=True,
        orden=3
    )
    
    esteticos = CategoriaTratamiento.objects.create(
        nombre="Servicios Estéticos",
        descripcion="Tratamientos para mejorar la apariencia dental",
        color="#8B5CF6",
        icono="✨",
        activo=True,
        orden=4
    )
    
    # Subcategorías para Preventivos
    CategoriaTratamiento.objects.create(
        nombre="Limpieza Dental",
        descripcion="Servicios de limpieza e higiene dental",
        color="#10B981",
        icono="🪥",
        parent=preventivos,
        activo=True,
        orden=1
    )
    
    CategoriaTratamiento.objects.create(
        nombre="Fluorización",
        descripcion="Aplicación de flúor para fortalecer dientes",
        color="#10B981",
        icono="💧",
        parent=preventivos,
        activo=True,
        orden=2
    )
    
    # Subcategorías para Restaurativos
    resinas = CategoriaTratamiento.objects.create(
        nombre="Resinas y Amalgamas",
        descripcion="Empastes y obturaciones dentales",
        color="#3B82F6",
        icono="🔩",
        parent=restaurativos,
        activo=True,
        orden=1
    )
    
    coronas = CategoriaTratamiento.objects.create(
        nombre="Coronas y Puentes",
        descripcion="Prótesis fijas dentales",
        color="#3B82F6",
        icono="👑",
        parent=restaurativos,
        activo=True,
        orden=2
    )
    
    # Sub-subcategorías para Resinas
    CategoriaTratamiento.objects.create(
        nombre="Resinas Estéticas",
        descripcion="Resinas del color del diente",
        color="#3B82F6",
        icono="🎨",
        parent=resinas,
        activo=True,
        orden=1
    )
    
    CategoriaTratamiento.objects.create(
        nombre="Amalgamas de Plata",
        descripcion="Empastes de amalgama tradicional",
        color="#3B82F6",
        icono="⚪",
        parent=resinas,
        activo=True,
        orden=2
    )
    
    print("Categorías de ejemplo creadas con estructura jerárquica")

def update_existing_categories():
    """Actualizar categorías existentes con campos faltantes"""
    
    for categoria in CategoriaTratamiento.objects.all():
        updated = False
        
        if not categoria.color:
            categoria.color = "#6B7280"  # Color gris por defecto
            updated = True
            
        if not categoria.descripcion:
            categoria.descripcion = f"Descripción para {categoria.nombre}"
            updated = True
            
        if not categoria.icono:
            categoria.icono = "🦷"
            updated = True
            
        if updated:
            categoria.save()
            print(f"Actualizada categoría: {categoria.nombre}")

if __name__ == "__main__":
    migrate_to_mptt()
