#!/bin/bash

# Script para configurar SMTP con Gmail rápidamente
# Uso: ./configure_gmail_smtp.sh tu-email@gmail.com "abcd efgh ijkl mnop"

echo "🔧 CONFIGURANDO SMTP CON GMAIL"
echo "=========================================="

if [ $# -ne 2 ]; then
    echo "❌ Uso: $0 <email@gmail.com> <app-password>"
    echo ""
    echo "📋 Pasos previos:"
    echo "1. Habilita verificación en 2 pasos en tu cuenta Gmail"
    echo "2. Genera una contraseña de aplicación en Google"
    echo "3. Ejecuta: $0 tu-email@gmail.com \"tu-app-password\""
    echo ""
    echo "📖 Guía completa en: GMAIL_SETUP_RAPIDO.md"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
ENV_FILE="/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend/.env"

echo "📧 Email: $EMAIL"
echo "🔑 Password: ${PASSWORD:0:4}****"
echo ""

# Backup del .env original
echo "💾 Creando backup de .env..."
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Actualizar configuración
echo "🔄 Actualizando configuración SMTP..."

# Cambiar EMAIL_BACKEND
sed -i '' 's/EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend/EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend/' "$ENV_FILE"

# Actualizar EMAIL_HOST_USER
sed -i '' "s/EMAIL_HOST_USER=/EMAIL_HOST_USER=$EMAIL/" "$ENV_FILE"

# Actualizar EMAIL_HOST_PASSWORD
sed -i '' "s/EMAIL_HOST_PASSWORD=/EMAIL_HOST_PASSWORD=$PASSWORD/" "$ENV_FILE"

# Actualizar DEFAULT_FROM_EMAIL
sed -i '' "s/DEFAULT_FROM_EMAIL=noreply@dentalerp.com/DEFAULT_FROM_EMAIL=$EMAIL/" "$ENV_FILE"

# Actualizar NOTIFICATION_EMAIL_FROM
sed -i '' "s/NOTIFICATION_EMAIL_FROM=notifications@dentalerp.com/NOTIFICATION_EMAIL_FROM=$EMAIL/" "$ENV_FILE"

echo "✅ Configuración actualizada!"
echo ""
echo "📋 Cambios realizados:"
echo "- EMAIL_BACKEND → smtp.EmailBackend"
echo "- EMAIL_HOST_USER → $EMAIL"
echo "- EMAIL_HOST_PASSWORD → [configurado]"
echo "- DEFAULT_FROM_EMAIL → $EMAIL"
echo ""

echo "🧪 Probando configuración..."
cd "/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend"

python3 -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print('Enviando email de prueba...')
try:
    result = send_mail(
        'Prueba SMTP DentalERP',
        'Si recibes este email, la configuración SMTP está funcionando correctamente.',
        settings.DEFAULT_FROM_EMAIL,
        ['$EMAIL'],
        fail_silently=False,
    )
    if result == 1:
        print('✅ Email enviado exitosamente!')
        print('📬 Revisa tu bandeja de entrada')
    else:
        print('❌ Fallo en el envío')
except Exception as e:
    print(f'❌ Error: {e}')
    print('💡 Revisa que la contraseña de aplicación sea correcta')
"

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Reinicia el servidor Django si está ejecutándose"
echo "2. Prueba confirmar una cita desde el frontend"
echo "3. Los emails se enviarán a los pacientes automáticamente"
echo ""
echo "🔄 Para volver a modo consola:"
echo "sed -i '' 's/smtp.EmailBackend/console.EmailBackend/' $ENV_FILE"
