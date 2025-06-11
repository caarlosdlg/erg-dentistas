"""
Script para preparar la migración de categorías jerárquicas
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.utils import timezone
from tratamientos.models import CategoriaTratamiento

def backup_and_prepare_categories():
    """Preparar categorías existentes para la migración MPTT"""
    
    # Obtener todas las categorías existentes
    categorias = CategoriaTratamiento.objects.all()
    
    print(f"Encontradas {categorias.count()} categorías existentes")
    
    # Si no hay categorías, crear algunas de ejemplo
    if categorias.count() == 0:
        print("Creando categorías de ejemplo...")
        
        # Categorías principales
        preventivos = CategoriaTratamiento.objects.create(
            nombre="Servicios Preventivos",
            descripcion="Tratamientos para prevenir problemas dentales",
            color="#10B981",
            activo=True
        )
        
        restaurativos = CategoriaTratamiento.objects.create(
            nombre="Servicios Restaurativos", 
            descripcion="Tratamientos para restaurar dientes dañados",
            color="#3B82F6",
            activo=True
        )
        
        quirurgicos = CategoriaTratamiento.objects.create(
            nombre="Servicios Quirúrgicos",
            descripcion="Procedimientos quirúrgicos dentales",
            color="#EF4444",
            activo=True
        )
        
        esteticos = CategoriaTratamiento.objects.create(
            nombre="Servicios Estéticos",
            descripcion="Tratamientos para mejorar la apariencia dental",
            color="#8B5CF6",
            activo=True
        )
        
        print("Categorías de ejemplo creadas exitosamente")
    
    else:
        # Asegurar que todas las categorías tengan los campos requeridos
        for categoria in categorias:
            if not categoria.color:
                categoria.color = "#6B7280"  # Color gris por defecto
            if not categoria.descripcion:
                categoria.descripcion = f"Descripción para {categoria.nombre}"
            categoria.save()
        
        print("Categorías existentes actualizadas")

if __name__ == "__main__":
    backup_and_prepare_categories()
    print("Preparación completada. Ahora puedes ejecutar las migraciones.")
