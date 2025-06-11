# Configuración SMTP con Resend - Alternativa Moderna

## 🚀 ¿Qué es Resend?

Resend es un servicio moderno de email diseñado específicamente para desarrolladores. Es más simple que SendGrid y más confiable que Gmail para aplicaciones en producción.

### ✅ Ventajas de Resend:
- **Fácil de configurar:** Solo necesitas una API key
- **Generoso plan gratuito:** 3,000 emails/mes gratis
- **Excelente deliverability:** Llegan a bandeja de entrada
- **API moderna:** Muy fácil de usar
- **Dominios personalizados:** Fácil configuración de DNS

---

## 🔧 Configuración con Resend

### Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com/
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Generar API Key

1. En el dashboard de Resend
2. Ve a "API Keys"
3. Crea una nueva API key
4. Copia la key (empieza con `re_`)

### Paso 3: Configurar en Django

Tienes **2 opciones** para usar Resend:

#### Opción A: SMTP (Más Simple)
```bash
# En tu archivo .env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=tu-resend-api-key
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

#### Opción B: API de Resend (Más Avanzada)
```bash
# Instalar cliente de Resend
pip install resend

# En tu archivo .env
RESEND_API_KEY=tu-resend-api-key
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

---

## 📧 Implementación con API de Resend

### Actualizar el Servicio de Email

Voy a crear una versión mejorada del servicio de email que use Resend:

```python
# citas/email_service.py (versión con Resend)
import resend
from django.conf import settings
from django.template.loader import render_to_string

# Configurar Resend
resend.api_key = settings.RESEND_API_KEY

def send_appointment_confirmation_email_resend(cita):
    """Enviar email de confirmación usando Resend API"""
    
    # Preparar contexto
    context = {
        'cita': cita,
        'paciente': cita.paciente,
        'dentista': cita.dentista,
        # ... resto del contexto
    }
    
    # Renderizar templates
    html_content = render_to_string('citas/emails/appointment_confirmation.html', context)
    text_content = render_to_string('citas/emails/appointment_confirmation.txt', context)
    
    try:
        # Enviar con Resend API
        email = resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [cita.paciente.email],
            "subject": f"Confirmación de Cita - {cita.numero_cita}",
            "html": html_content,
            "text": text_content,
        })
        
        return True
        
    except Exception as e:
        logger.error(f"Error enviando email con Resend: {e}")
        return False
```

---

## 🛠️ Script de Configuración Automática

```bash
#!/bin/bash
# configure_resend.sh

echo "🚀 CONFIGURANDO RESEND PARA DENTALERP"
echo "======================================"

# Solicitar API key
echo "📝 Ingresa tu Resend API Key:"
read -s RESEND_API_KEY

# Solicitar email from
echo "📧 Ingresa el email remitente (ej: noreply@tu-dominio.com):"
read FROM_EMAIL

ENV_FILE="backend/.env"

# Backup
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Opción 1: Usar SMTP
echo "🔧 Configurando Resend SMTP..."
sed -i '' 's/EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend/EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend/' "$ENV_FILE"
sed -i '' "s/EMAIL_HOST=smtp.gmail.com/EMAIL_HOST=smtp.resend.com/" "$ENV_FILE"
sed -i '' "s/EMAIL_HOST_USER=.*/EMAIL_HOST_USER=resend/" "$ENV_FILE"
sed -i '' "s/EMAIL_HOST_PASSWORD=.*/EMAIL_HOST_PASSWORD=$RESEND_API_KEY/" "$ENV_FILE"
sed -i '' "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=$FROM_EMAIL/" "$ENV_FILE"

# Agregar configuración de Resend API (opcional)
echo "" >> "$ENV_FILE"
echo "# Resend API Configuration" >> "$ENV_FILE"
echo "RESEND_API_KEY=$RESEND_API_KEY" >> "$ENV_FILE"

echo "✅ Configuración completada!"
echo "🧪 Probando configuración..."

cd backend
python3 -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

try:
    result = send_mail(
        'Prueba Resend - DentalERP',
        'Si recibes este email, Resend está funcionando correctamente.',
        '$FROM_EMAIL',
        ['$FROM_EMAIL'],
        fail_silently=False,
    )
    print('✅ Email enviado con Resend!')
except Exception as e:
    print(f'❌ Error: {e}')
"

echo "🎉 ¡Resend configurado exitosamente!"
```

---

## 📊 Comparación: Resend vs Otras Opciones

| Servicio | Plan Gratuito | Facilidad | Deliverability | Precio |
|----------|---------------|-----------|----------------|---------|
| **Resend** | 3,000/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $20/mes |
| Gmail | 500/día | ⭐⭐⭐⭐ | ⭐⭐⭐ | Gratis |
| SendGrid | 100/día | ⭐⭐⭐ | ⭐⭐⭐⭐ | $15/mes |
| Mailgun | 5,000/mes | ⭐⭐⭐ | ⭐⭐⭐⭐ | $35/mes |

---

## 🎯 Configuración Rápida con Resend

### Método 1: Solo SMTP (5 minutos)
```bash
# En .env cambiar solo estas líneas:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=tu-resend-api-key
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

### Método 2: Con API de Resend (10 minutos)
```bash
# Instalar resend
pip install resend

# Agregar a requirements.txt
echo "resend" >> backend/requirements.txt

# Configurar .env
RESEND_API_KEY=tu-resend-api-key
```

---

## 🚨 Configuración de Dominio (Opcional pero Recomendado)

Para mejor deliverability, configura tu dominio en Resend:

1. **En Resend Dashboard:**
   - Ve a "Domains"
   - Agrega tu dominio (ej: tu-clinica.com)

2. **En tu DNS:**
   - Agrega los registros que te proporciona Resend
   - SPF, DKIM, DMARC

3. **Usa emails de tu dominio:**
   ```bash
   DEFAULT_FROM_EMAIL=noreply@tu-clinica.com
   ```

---

## 🧪 Script de Prueba Específico para Resend

```python
# test_resend.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

import resend
from django.conf import settings

# Configurar Resend
resend.api_key = getattr(settings, 'RESEND_API_KEY', None)

def test_resend_api():
    """Probar Resend API directamente"""
    if not resend.api_key:
        print("❌ RESEND_API_KEY no configurada")
        return
    
    try:
        email = resend.Emails.send({
            "from": "noreply@tu-dominio.com",
            "to": ["tu-email@test.com"],
            "subject": "Prueba Resend API - DentalERP",
            "html": "<h1>¡Resend funcionando!</h1><p>Email enviado desde DentalERP</p>",
            "text": "¡Resend funcionando! Email enviado desde DentalERP"
        })
        print(f"✅ Email enviado! ID: {email['id']}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_resend_api()
```

---

## 💡 ¿Por qué Resend es Buena Opción?

1. **Moderno:** Diseñado para desarrolladores actuales
2. **Simple:** Configuración en minutos
3. **Confiable:** Mejor deliverability que Gmail
4. **Escalable:** Fácil crecer de plan gratuito a pago
5. **Soporte:** Excelente documentación y soporte

---

## 🎉 Resumen

**Resend es una excelente opción** para tu aplicación DentalERP:

- ✅ **3,000 emails/mes gratis** (más que suficiente para empezar)
- ✅ **Configuración súper simple**
- ✅ **Mejor deliverability que Gmail**
- ✅ **API moderna y fácil de usar**

¿Quieres que configure Resend en tu proyecto?
