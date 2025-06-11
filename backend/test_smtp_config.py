#!/usr/bin/env python3
"""
Script para probar la configuración SMTP de Django
Uso: python test_smtp_config.py [email-destino]
"""

import os
import sys
import django

# Setup Django
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings


def test_smtp_configuration(recipient_email=None):
    """Prueba la configuración SMTP actual"""
    
    print("🔧 CONFIGURACIÓN SMTP ACTUAL")
    print("=" * 50)
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"Use SSL: {settings.EMAIL_USE_SSL}")
    print(f"User: {settings.EMAIL_HOST_USER}")
    print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
    print()
    
    # Verificar si es configuración de consola o SMTP
    if 'console' in settings.EMAIL_BACKEND.lower():
        print("⚠️  MODO DESARROLLO (Console Backend)")
        print("Los emails se mostrarán en la consola, no se enviarán realmente.")
    else:
        print("📧 MODO PRODUCCIÓN (SMTP Backend)")
        print("Los emails se enviarán a través de SMTP.")
    
    print("-" * 50)
    
    # Email de prueba
    if not recipient_email:
        recipient_email = input("📬 Ingresa el email de destino para la prueba: ").strip()
    
    if not recipient_email:
        print("❌ Email de destino requerido")
        return False
    
    print(f"\n📤 Enviando email de prueba a: {recipient_email}")
    
    subject = "🧪 Prueba de Configuración SMTP - DentalERP"
    message = """
¡Hola!

Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.

Si recibes este mensaje, significa que:
✅ La configuración SMTP está correcta
✅ Los emails se pueden enviar desde la aplicación
✅ El sistema está listo para enviar emails de confirmación de citas

Detalles técnicos:
- Servidor SMTP: {}
- Puerto: {}
- Encryption: {}

¡Tu sistema DentalERP está listo para enviar emails!

---
Sistema DentalERP
Email enviado automáticamente - No responder
    """.format(
        settings.EMAIL_HOST,
        settings.EMAIL_PORT,
        "TLS" if settings.EMAIL_USE_TLS else "SSL" if settings.EMAIL_USE_SSL else "None"
    )
    
    try:
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        
        if result == 1:
            print("✅ Email enviado exitosamente!")
            if 'console' in settings.EMAIL_BACKEND.lower():
                print("📺 Revisa la consola del servidor Django para ver el contenido del email")
            else:
                print(f"📬 Revisa la bandeja de entrada de {recipient_email}")
            return True
        else:
            print("❌ Fallo en el envío (sin excepción)")
            return False
            
    except Exception as e:
        print(f"❌ Error enviando email: {e}")
        print(f"\n🔍 Posibles soluciones:")
        
        if "Username and Password not accepted" in str(e):
            print("- Verifica que uses una App Password, no tu contraseña regular")
            print("- Asegúrate que el 2FA esté habilitado en tu cuenta")
        elif "Connection refused" in str(e):
            print("- Verifica el EMAIL_HOST y EMAIL_PORT")
            print("- Revisa la configuración de firewall")
        elif "SSL" in str(e) or "TLS" in str(e):
            print("- Revisa la configuración de EMAIL_USE_TLS y EMAIL_USE_SSL")
            print("- Para Gmail: EMAIL_USE_TLS=True, EMAIL_USE_SSL=False")
        else:
            print("- Revisa todas las credenciales en el archivo .env")
            print("- Verifica que el proveedor SMTP permita el acceso")
        
        return False


def main():
    """Función principal"""
    print("🧪 PRUEBA DE CONFIGURACIÓN SMTP")
    print("=" * 50)
    
    # Obtener email de destino desde argumentos o input
    recipient = sys.argv[1] if len(sys.argv) > 1 else None
    
    success = test_smtp_configuration(recipient)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 CONFIGURACIÓN SMTP FUNCIONANDO CORRECTAMENTE!")
        print("\n📋 Próximos pasos:")
        print("- Los emails de confirmación de citas ya funcionarán")
        print("- Puedes confirmar citas desde el frontend")
        print("- Los pacientes recibirán emails automáticamente")
    else:
        print("❌ CONFIGURACIÓN SMTP NECESITA AJUSTES")
        print("\n📋 Para solucionar:")
        print("1. Revisa el archivo .env en backend/")
        print("2. Consulta CONFIGURACION_SMTP.md para ejemplos")
        print("3. Prueba de nuevo con: python test_smtp_config.py")
    print("=" * 50)


if __name__ == '__main__':
    main()
