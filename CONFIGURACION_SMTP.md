# Configuración SMTP para Emails en Producción

## ¿Qué es SMTP?

SMTP (Simple Mail Transfer Protocol) es el protocolo estándar para enviar emails. Para que tu aplicación Django envíe emails reales (no solo mostrarlos en consola), necesitas configurar un servidor SMTP.

## Opciones de Proveedores SMTP

### 1. 📧 Gmail (Google Workspace)
**Mejor para:** Desarrollo, pequeñas empresas
**Límites:** 500 emails/día (Gmail personal), 2000/día (Google Workspace)

### 2. 📨 SendGrid
**Mejor para:** Aplicaciones en producción
**Límites:** 100 emails/día gratis, planes desde $15/mes

### 3. 📮 Mailgun
**Mejor para:** Aplicaciones web
**Límites:** 5,000 emails/mes gratis

### 4. 📬 Amazon SES
**Mejor para:** Aplicaciones en AWS
**Límites:** 200 emails/día gratis en sandbox

### 5. 📭 Outlook/Hotmail
**Mejor para:** Usuarios de Microsoft
**Límites:** 300 emails/día

---

## Configuración por Proveedor

### 🔧 1. Gmail / Google Workspace

#### Paso 1: Habilitar App Passwords
1. Ve a tu cuenta de Google → Seguridad
2. Habilita verificación en 2 pasos
3. Genera una "Contraseña de aplicación"

#### Paso 2: Configurar .env
```bash
# Gmail Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password-de-16-caracteres
DEFAULT_FROM_EMAIL=tu-email@gmail.com
```

---

### 🔧 2. SendGrid (Recomendado para Producción)

#### Paso 1: Crear cuenta en SendGrid
1. Ve a https://sendgrid.com/
2. Crea una cuenta gratuita
3. Verifica tu email y dominio
4. Genera una API Key

#### Paso 2: Configurar .env
```bash
# SendGrid Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=tu-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

---

### 🔧 3. Mailgun

#### Paso 1: Crear cuenta en Mailgun
1. Ve a https://www.mailgun.com/
2. Crea cuenta y verifica dominio
3. Obtén credenciales SMTP

#### Paso 2: Configurar .env
```bash
# Mailgun Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=postmaster@tu-dominio.mailgun.org
EMAIL_HOST_PASSWORD=tu-mailgun-password
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

---

### 🔧 4. Amazon SES

#### Paso 1: Configurar en AWS Console
1. Ve a Amazon SES en AWS Console
2. Verifica tu dominio o email
3. Crea credenciales SMTP

#### Paso 2: Configurar .env
```bash
# Amazon SES Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=tu-aws-access-key-id
EMAIL_HOST_PASSWORD=tu-aws-secret-access-key
DEFAULT_FROM_EMAIL=noreply@tu-dominio.com
```

---

### 🔧 5. Outlook/Hotmail

#### Paso 1: Habilitar App Passwords
1. Ve a tu cuenta Microsoft → Seguridad
2. Habilita verificación en 2 pasos
3. Genera contraseña de aplicación

#### Paso 2: Configurar .env
```bash
# Outlook Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=tu-email@outlook.com
EMAIL_HOST_PASSWORD=tu-app-password
DEFAULT_FROM_EMAIL=tu-email@outlook.com
```

---

## 🚀 Configuración Rápida para Desarrollo (Gmail)

Si quieres probar rápido con Gmail:

1. **Habilita App Passwords en Gmail:**
   - Ve a https://myaccount.google.com/security
   - Habilita verificación en 2 pasos
   - Busca "Contraseñas de aplicación"
   - Genera una para "Otra aplicación"

2. **Actualiza tu .env:**
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=tu-gmail@gmail.com
EMAIL_HOST_PASSWORD=abcd-efgh-ijkl-mnop
```

3. **Reinicia el servidor Django**

---

## 🧪 Probar la Configuración

### Script de Prueba
```python
# test_smtp.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f"Configuración actual:")
print(f"Backend: {settings.EMAIL_BACKEND}")
print(f"Host: {settings.EMAIL_HOST}")
print(f"Port: {settings.EMAIL_PORT}")
print(f"User: {settings.EMAIL_HOST_USER}")

try:
    send_mail(
        'Test Email from DentalERP',
        'Si recibes este email, la configuración SMTP está funcionando correctamente.',
        settings.DEFAULT_FROM_EMAIL,
        ['tu-email-de-prueba@gmail.com'],
        fail_silently=False,
    )
    print("✅ Email enviado exitosamente!")
except Exception as e:
    print(f"❌ Error enviando email: {e}")
```

### Usar desde Django Shell
```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail
send_mail(
    'Prueba SMTP',
    'Email de prueba desde Django',
    'noreply@dentalerp.com',
    ['tu-email@gmail.com']
)
```

---

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca hardcodees credenciales:**
   - Usa variables de entorno (.env)
   - No subas .env al repositorio

2. **Usa App Passwords:**
   - No uses tu contraseña principal
   - Genera contraseñas específicas para aplicaciones

3. **Limita permisos:**
   - Usa cuentas dedicadas para envío de emails
   - Configura SPF, DKIM y DMARC en tu dominio

4. **Monitorea el uso:**
   - Revisa logs de envío
   - Configura alertas para fallos

---

## 🐛 Solución de Problemas Comunes

### Error: "Username and Password not accepted"
- Verifica que uses App Password, no tu contraseña regular
- Asegúrate que el 2FA esté habilitado

### Error: "Connection refused"
- Verifica el HOST y PORT
- Revisa configuración de firewall

### Error: "SSL/TLS issues"
- Para Gmail usa EMAIL_USE_TLS=True y EMAIL_USE_SSL=False
- Para otros proveedores revisa su documentación

### Emails van a spam
- Configura SPF, DKIM, DMARC en tu dominio
- Usa un dominio verificado
- Evita palabras spam en subject/content

---

## 📊 Recomendaciones por Caso de Uso

- **🧪 Desarrollo:** Gmail (fácil setup)
- **🚀 Producción pequeña:** SendGrid (confiable, buen free tier)
- **🏢 Empresa:** Google Workspace + Gmail API
- **☁️ AWS hosting:** Amazon SES (integración nativa)
- **💰 Presupuesto limitado:** Mailgun (5k emails/mes gratis)

---

## 🔄 Migrar de Consola a SMTP

Para cambiar de modo desarrollo (consola) a producción (SMTP):

1. Actualiza EMAIL_BACKEND en .env
2. Configura credenciales SMTP
3. Reinicia servidor Django
4. Prueba con script de test

¡Y listo! Tus emails de confirmación de citas se enviarán por email real.
