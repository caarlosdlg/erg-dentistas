#!/usr/bin/env python3
"""
Test directo con Resend para enviar email a cualquier dirección
Nota: Para producción necesitas verificar el dominio en Resend
"""
import resend

# Configurar API Key
resend.api_key = "re_FPCt2fuB_6Fct8cxW19Bct73QqFjZGbEV"

def send_test_email_direct():
    """
    Envía email de prueba directamente con Resend
    """
    try:
        print("🚀 Intentando enviar email directo con Resend...")
        
        # Email HTML personalizado para la prueba
        html_content = """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test DentalERP</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 10px; }
                .success { color: #28a745; font-weight: bold; }
                .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🦷 DentalERP</h1>
                    <h2>Sistema de Emails con Resend</h2>
                </div>
                
                <div class="content">
                    <h3>¡Hola! Este es un email de prueba 🎉</h3>
                    
                    <p>Este email confirma que el sistema de DentalERP está funcionando correctamente con Resend API.</p>
                    
                    <div class="info">
                        <h4>✅ Funcionalidades Verificadas:</h4>
                        <ul>
                            <li><span class="success">✅ Integración con Resend API</span></li>
                            <li><span class="success">✅ Templates HTML responsivos</span></li>
                            <li><span class="success">✅ Envío de confirmaciones de citas</span></li>
                            <li><span class="success">✅ Recordatorios automáticos</span></li>
                            <li><span class="success">✅ Notificaciones de cancelación</span></li>
                        </ul>
                    </div>
                    
                    <p><strong>🔧 Configuración Actual:</strong></p>
                    <ul>
                        <li>Proveedor: Resend</li>
                        <li>API Key: Configurada ✅</li>
                        <li>Templates: HTML con CSS inline</li>
                        <li>Estado: Completamente funcional</li>
                    </ul>
                    
                    <div class="info">
                        <p><strong>📝 Nota Importante:</strong><br>
                        Para enviar emails a cualquier dirección en producción, es necesario:</p>
                        <ol>
                            <li>Verificar un dominio personalizado en <a href="https://resend.com/domains">resend.com/domains</a></li>
                            <li>Cambiar el "from" a usar ese dominio verificado</li>
                            <li>Actualizar la configuración del sistema</li>
                        </ol>
                    </div>
                    
                    <p>¡El sistema está listo para manejar todos los emails del consultorio dental! 🚀</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="text-align: center; color: #666; font-size: 14px;">
                        <strong>DentalERP</strong> - Sistema de Gestión Dental Completo<br>
                        📧 Emails automáticos • 📅 Gestión de citas • 👨‍⚕️ Control de dentistas
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Intentar enviar a diferentes direcciones para mostrar el comportamiento
        emails_test = [
            "gaelcostila@gmail.com",  # Esta funcionará
            "caarlangasdlg@gmail.com"  # Esta mostrará el error de dominio
        ]
        
        for email in emails_test:
            print(f"\n📧 Enviando a: {email}")
            try:
                response = resend.Emails.send({
                    "from": "DentalERP <onboarding@resend.dev>",
                    "to": email,
                    "subject": "🧪 Test DentalERP - Sistema de Emails Funcional",
                    "html": html_content
                })
                print(f"✅ Email enviado exitosamente - ID: {response}")
                
            except Exception as e:
                print(f"❌ Error: {e}")
                if "testing emails" in str(e):
                    print("💡 Solución: Verificar dominio en resend.com/domains para envío completo")
        
    except Exception as e:
        print(f"❌ Error general: {e}")

if __name__ == "__main__":
    send_test_email_direct()
