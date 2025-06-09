#!/bin/bash

# Script de despliegue completo para DentalERP en OCI
# Automatiza todo el proceso de despliegue en producción

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="150.136.29.8"
SERVER_USER="rocky"
SSH_KEY="/Users/carlosdelgado/Tec/proyecto final /ssh-key-2025-03-06.key"
DOMAIN="cxrlos.fun"
PROJECT_DIR="/opt/dental_erp"

print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Función para ejecutar comandos en el servidor
ssh_exec() {
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "$1"
}

# Función para transferir archivos
scp_file() {
    scp -i "$SSH_KEY" "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# Función para transferir directorios
scp_dir() {
    scp -r -i "$SSH_KEY" "$1" "$SERVER_USER@$SERVER_IP:$2"
}

print_message "🚀 Iniciando despliegue de DentalERP en producción"
print_info "Servidor: $SERVER_IP"
print_info "Usuario: $SERVER_USER"
print_info "Dominio: $DOMAIN"

# 1. Verificar conexión SSH
print_message "1️⃣ Verificando conexión SSH..."
if ! ssh_exec "echo 'Conexión exitosa'"; then
    print_error "No se puede conectar al servidor"
    exit 1
fi
print_message "✅ Conexión SSH exitosa"

# 2. Crear estructura de directorios en el servidor
print_message "2️⃣ Creando estructura de directorios..."
ssh_exec "sudo mkdir -p $PROJECT_DIR/{backend,frontend,nginx,ssl,logs}"
ssh_exec "sudo chown -R $SERVER_USER:$SERVER_USER $PROJECT_DIR"

# 3. Transferir archivos del backend
print_message "3️⃣ Transfiriendo archivos del backend..."
scp_dir "./backend/" "$PROJECT_DIR/"

# 4. Transferir archivos de Nginx
print_message "4️⃣ Transfiriendo configuración de Nginx..."
scp_dir "./nginx/" "$PROJECT_DIR/"

# 5. Transferir docker-compose de producción
print_message "5️⃣ Transfiriendo configuración de Docker..."
scp_file "./docker-compose.production.yml" "$PROJECT_DIR/docker-compose.yml"

# 6. Instalar dependencias del sistema
print_message "6️⃣ Instalando dependencias del sistema..."
ssh_exec "sudo dnf update -y"
ssh_exec "sudo dnf install -y docker docker-compose-plugin openssl"
ssh_exec "sudo systemctl enable docker"
ssh_exec "sudo systemctl start docker"
ssh_exec "sudo usermod -aG docker $SERVER_USER"

# 7. Configurar variables de entorno
print_message "7️⃣ Configurando variables de entorno..."
ssh_exec "cd $PROJECT_DIR && cp backend/.env.production backend/.env"

# 8. Generar SECRET_KEY segura
print_message "8️⃣ Generando SECRET_KEY segura..."
SECRET_KEY=$(ssh_exec "openssl rand -hex 32")
ssh_exec "cd $PROJECT_DIR/backend && sed -i 's/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/' .env"

# 9. Construir y levantar contenedores
print_message "9️⃣ Construyendo y levantando contenedores..."
ssh_exec "cd $PROJECT_DIR && newgrp docker << EOF
docker-compose down --remove-orphans || true
docker-compose build --no-cache
docker-compose up -d
EOF"

# 10. Configurar SSL básico (self-signed temporalmente)
print_message "🔟 Configurando certificados SSL temporales..."
ssh_exec "cd $PROJECT_DIR/ssl && sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
    -keyout cxrlos.fun.key \\
    -out cxrlos.fun.crt \\
    -subj '/C=MX/ST=Mexico/L=Mexico/O=DentalERP/CN=cxrlos.fun'"

# 11. Esperar a que los servicios estén listos
print_message "1️⃣1️⃣ Esperando a que los servicios estén listos..."
sleep 30

# 12. Ejecutar migraciones y configuración inicial
print_message "1️⃣2️⃣ Ejecutando migraciones y configuración inicial..."
ssh_exec "cd $PROJECT_DIR && docker-compose exec -T web python manage.py makemigrations"
ssh_exec "cd $PROJECT_DIR && docker-compose exec -T web python manage.py migrate"
ssh_exec "cd $PROJECT_DIR && docker-compose exec -T web python manage.py collectstatic --noinput"

# 13. Crear superusuario inicial
print_message "1️⃣3️⃣ Configurando usuario administrador..."
ssh_exec "cd $PROJECT_DIR && docker-compose exec -T web python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from usuarios.models import Usuario

User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@cxrlos.fun',
        password='DentalERP2025!Admin',
        first_name='Admin',
        last_name='Sistema'
    )
    print('Superusuario creado exitosamente')
else:
    print('Superusuario ya existe')
EOF"

# 14. Verificar estado de los servicios
print_message "1️⃣4️⃣ Verificando estado de los servicios..."
ssh_exec "cd $PROJECT_DIR && docker-compose ps"

# 15. Probar conectividad
print_message "1️⃣5️⃣ Probando conectividad..."
sleep 5
if ssh_exec "curl -k -f https://localhost/health/ || curl -f http://localhost:8000/health/"; then
    print_message "✅ Aplicación respondiendo correctamente"
else
    print_warning "⚠️ La aplicación puede necesitar más tiempo para estar lista"
fi

# 16. Configurar firewall básico
print_message "1️⃣6️⃣ Configurando firewall..."
ssh_exec "sudo firewall-cmd --permanent --add-service=http"
ssh_exec "sudo firewall-cmd --permanent --add-service=https"
ssh_exec "sudo firewall-cmd --permanent --add-port=8000/tcp"
ssh_exec "sudo firewall-cmd --reload"

print_message "🎉 ¡Despliegue completado exitosamente!"
echo ""
print_info "🌐 La aplicación está disponible en:"
print_info "   • https://$DOMAIN (con certificado self-signed)"
print_info "   • http://$SERVER_IP:8000 (acceso directo al backend)"
echo ""
print_info "👤 Credenciales de administrador:"
print_info "   • Usuario: admin"
print_info "   • Contraseña: DentalERP2025!Admin"
print_info "   • URL Admin: https://$DOMAIN/admin/"
echo ""
print_warning "⚠️ Próximos pasos recomendados:"
print_warning "   1. Configurar certificados SSL reales con Let's Encrypt"
print_warning "   2. Configurar el servicio de email en producción"
print_warning "   3. Cambiar la contraseña del administrador"
print_warning "   4. Configurar backups automáticos"
echo ""
print_info "📊 Para monitorear los logs:"
print_info "   ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker-compose logs -f'"
