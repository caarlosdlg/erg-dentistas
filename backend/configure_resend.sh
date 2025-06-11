#!/bin/bash

# Script para configurar Resend en DentalERP
# Uso: ./configure_resend.sh

echo "🚀 CONFIGURANDO RESEND PARA DENTALERP"
echo "======================================="
echo ""
echo "📋 Resend es una excelente opción porque:"
echo "   • 3,000 emails/mes gratis"
echo "   • Mejor deliverability que Gmail"
echo "   • Configuración muy simple"
echo "   • API moderna"
echo ""

# Verificar si ya tiene cuenta
echo "❓ ¿Ya tienes una cuenta en Resend? (y/n)"
read -r HAS_ACCOUNT

if [ "$HAS_ACCOUNT" != "y" ]; then
    echo ""
    echo "📝 CREAR CUENTA EN RESEND:"
    echo "1. Ve a https://resend.com/"
    echo "2. Crea una cuenta gratuita"
    echo "3. Verifica tu email"
    echo "4. Ve a 'API Keys' y crea una nueva key"
    echo ""
    echo "⏳ Presiona ENTER cuando tengas tu API key..."
    read -r
fi

echo ""
echo "🔑 Ingresa tu Resend API Key (empieza con 're_'):"
read -r RESEND_API_KEY

if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
    echo "❌ Error: La API key de Resend debe empezar con 're_'"
    echo "💡 Verifica que copiaste la key correctamente"
    exit 1
fi

echo ""
echo "📧 Ingresa el email remitente:"
echo "   Ejemplos: noreply@tu-clinica.com, contacto@dental-erp.com"
echo "   (Puede ser cualquier email, mejor si es de tu dominio)"
read -r FROM_EMAIL

if [[ ! "$FROM_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "❌ Error: Email inválido"
    exit 1
fi

ENV_FILE="/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend/.env"

# Verificar que existe el archivo .env
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo .env en $ENV_FILE"
    exit 1
fi

echo ""
echo "💾 Creando backup de .env..."
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Configurando Resend SMTP..."

# Actualizar configuración EMAIL
sed -i '' 's/EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend/EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend/' "$ENV_FILE"
sed -i '' 's/EMAIL_HOST=smtp.gmail.com/EMAIL_HOST=smtp.resend.com/' "$ENV_FILE"
sed -i '' 's/EMAIL_HOST_USER=.*/EMAIL_HOST_USER=resend/' "$ENV_FILE"
sed -i '' "s/EMAIL_HOST_PASSWORD=.*/EMAIL_HOST_PASSWORD=$RESEND_API_KEY/" "$ENV_FILE"
sed -i '' "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=$FROM_EMAIL/" "$ENV_FILE"
sed -i '' "s/SERVER_EMAIL=.*/SERVER_EMAIL=$FROM_EMAIL/" "$ENV_FILE"
sed -i '' "s/NOTIFICATION_EMAIL_FROM=.*/NOTIFICATION_EMAIL_FROM=$FROM_EMAIL/" "$ENV_FILE"

# Agregar configuración específica de Resend si no existe
if ! grep -q "RESEND_API_KEY" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# Resend Configuration" >> "$ENV_FILE"
    echo "RESEND_API_KEY=$RESEND_API_KEY" >> "$ENV_FILE"
fi

echo "✅ Configuración actualizada!"
echo ""
echo "📋 Cambios realizados:"
echo "   • EMAIL_BACKEND → smtp.EmailBackend"
echo "   • EMAIL_HOST → smtp.resend.com"
echo "   • EMAIL_HOST_USER → resend"
echo "   • EMAIL_HOST_PASSWORD → [tu-resend-api-key]"
echo "   • DEFAULT_FROM_EMAIL → $FROM_EMAIL"
echo ""

echo "🧪 Probando configuración..."
cd "/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend"

python3 -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print('📤 Enviando email de prueba...')
try:
    result = send_mail(
        '🧪 Prueba Resend - DentalERP',
        'Si recibes este email, Resend está configurado correctamente en tu aplicación DentalERP. ¡Los emails de confirmación de citas ya funcionarán!',
        settings.DEFAULT_FROM_EMAIL,
        ['$FROM_EMAIL'],
        fail_silently=False,
    )
    if result == 1:
        print('✅ ¡Email enviado exitosamente con Resend!')
        print('📬 Revisa tu bandeja de entrada en: $FROM_EMAIL')
    else:
        print('❌ Fallo en el envío')
except Exception as e:
    print(f'❌ Error: {e}')
    print('')
    print('🔍 Posibles soluciones:')
    print('• Verifica que la API key sea correcta')
    print('• Asegúrate que empiece con \"re_\"')
    print('• Verifica tu cuenta en https://resend.com')
"

echo ""
echo "🎉 CONFIGURACIÓN DE RESEND COMPLETADA!"
echo "========================================"
echo ""
echo "✅ Tu aplicación DentalERP ahora enviará emails reales usando Resend"
echo ""
echo "📋 Próximos pasos:"
echo "1. 🔄 Reinicia el servidor Django si está ejecutándose"
echo "2. 🧪 Prueba confirmar una cita desde el frontend"
echo "3. 📧 Los pacientes recibirán emails automáticamente"
echo ""
echo "📊 Límites de Resend:"
echo "   • Plan gratuito: 3,000 emails/mes"
echo "   • Plan pagado: desde $20/mes para 50,000 emails"
echo ""
echo "🔗 Dashboard de Resend: https://resend.com/overview"
echo ""
echo "🔄 Para volver a modo consola:"
echo "   sed -i '' 's/smtp.EmailBackend/console.EmailBackend/' $ENV_FILE"
echo ""
echo "========================================"
