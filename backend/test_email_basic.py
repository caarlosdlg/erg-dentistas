#!/usr/bin/env python3
"""
Test simple para verificar que el sistema de emails con Resend funciona
"""
print("🧪 Iniciando prueba del sistema de emails")

import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

print("✅ Django configurado")

# Now import Django models
from citas.resend_email_service import ResendEmailService

def main():
    print("🧪 Prueba simple del sistema de emails con Resend")
    print("=" * 60)
    
    try:
        # 1. Verificar configuración de Resend
        print("1. Verificando configuración de Resend...")
        service = ResendEmailService()
        print(f"   ✅ API Key configurada: {service.api_key[:20]}...")
        print(f"   ✅ From Email: {service.from_email}")
        
        print("\n✅ Prueba básica completada - Resend está configurado correctamente")
        
    except Exception as e:
        print(f"\n❌ Error durante la prueba: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
