# Configuración SMTP con Gmail - Guía Paso a Paso

## 🚀 Configuración Rápida con Gmail

Esta es la forma más rápida de configurar emails reales para tu aplicación DentalERP.

### Paso 1: Preparar tu Cuenta Gmail

1. **Habilitar verificación en 2 pasos:**
   - Ve a https://myaccount.google.com/security
   - Busca "Verificación en 2 pasos"
   - Sigue las instrucciones para habilitarla

2. **Generar contraseña de aplicación:**
   - En la misma página de seguridad
   - Busca "Contraseñas de aplicación"
   - Selecciona "Otra (nombre personalizado)"
   - Escribe "DentalERP" o "Django App"
   - Copia la contraseña de 16 caracteres que aparece

### Paso 2: Actualizar el archivo .env

Abre el archivo `backend/.env` y actualiza estas líneas:

```bash
# Cambiar de console a smtp
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# Tu email de Gmail
EMAIL_HOST_USER=tu-email@gmail.com

# La contraseña de aplicación de 16 caracteres
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop

# Tu email como remitente
DEFAULT_FROM_EMAIL=tu-email@gmail.com
```

### Paso 3: Probar la Configuración

```bash
cd backend
python test_smtp_config.py tu-email-de-prueba@gmail.com
```

¡Y listo! Ahora tus emails de confirmación se enviarán por Gmail.

---

## 📧 Ejemplo Completo de .env para Gmail

```bash
# Configuración de Email con Gmail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=clinica.dental@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
DEFAULT_FROM_EMAIL=clinica.dental@gmail.com
SERVER_EMAIL=clinica.dental@gmail.com
NOTIFICATION_EMAIL_FROM=clinica.dental@gmail.com
```

---

## ⚠️ Problemas Comunes y Soluciones

### "Username and Password not accepted"
- ✅ Usa la contraseña de aplicación, NO tu contraseña normal
- ✅ Verifica que el 2FA esté habilitado
- ✅ Espera unos minutos después de generar la contraseña

### "Less secure app access"
- ✅ No uses "Permitir aplicaciones menos seguras"
- ✅ Usa contraseñas de aplicación en su lugar

### Emails van a spam
- ✅ Envía emails de prueba primero
- ✅ Evita palabras como "promoción", "oferta" en el asunto
- ✅ Considera usar un dominio propio más adelante

---

## 🔄 Volver a Modo Desarrollo

Si quieres volver a ver los emails en consola:

```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

---

## 📊 Límites de Gmail

- **Gmail Personal:** 500 emails por día
- **Google Workspace:** 2,000 emails por día
- **Para más volumen:** Considera SendGrid o Mailgun

---

## 🎯 Paso a Paso Visual

1. **Abrir Gmail** → Cuenta Google → Seguridad
2. **Habilitar 2FA** (si no está habilitado)
3. **Contraseñas de aplicación** → Otra → "DentalERP"
4. **Copiar contraseña** de 16 caracteres
5. **Pegar en .env** como EMAIL_HOST_PASSWORD
6. **Reiniciar servidor** Django
7. **Probar** con script de prueba

¡En 5 minutos tendrás emails funcionando!
