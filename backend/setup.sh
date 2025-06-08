#!/bin/bash

# Script de inicialización para el ERP Dental
echo "🦷 Iniciando configuración del ERP Dental..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_message "Docker detectado correctamente ✅"

# Crear directorios necesarios
print_message "Creando directorios necesarios..."
mkdir -p media/pacientes/fotos
mkdir -p media/dentistas/fotos
mkdir -p media/usuarios/fotos
mkdir -p media/pagos/comprobantes

# Construir y levantar servicios
print_message "Construyendo contenedores Docker..."
docker-compose build

print_message "Levantando servicios..."
docker-compose up -d db

# Esperar a que PostgreSQL esté listo
print_message "Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar si la base de datos está lista
until docker-compose exec db pg_isready -U dental_erp_user -d dental_erp_db; do
    print_warning "Esperando a PostgreSQL..."
    sleep 2
done

print_message "PostgreSQL está listo ✅"

# Ejecutar migraciones
print_message "Ejecutando migraciones..."
docker-compose run --rm web python manage.py makemigrations
docker-compose run --rm web python manage.py migrate

# Crear superusuario (opcional)
print_message "¿Deseas crear un superusuario? (y/n)"
read -r create_superuser

if [[ $create_superuser =~ ^[Yy]$ ]]; then
    print_message "Creando superusuario..."
    docker-compose run --rm web python manage.py createsuperuser
fi

# Cargar datos iniciales (opcional)
print_message "Cargando datos iniciales..."
docker-compose run --rm web python manage.py shell << EOF
from usuarios.models import Rol
from dentistas.models import Especialidad
from facturacion.models import FormaPago
from tratamientos.models import CategoriaTratamiento

# Crear roles iniciales
roles = [
    {'nombre': 'Administrador', 'descripcion': 'Acceso completo al sistema', 'permisos': 'all'},
    {'nombre': 'Dentista', 'descripcion': 'Gestión de pacientes y tratamientos', 'permisos': 'pacientes,citas,tratamientos'},
    {'nombre': 'Recepcionista', 'descripcion': 'Gestión de citas y pacientes', 'permisos': 'pacientes,citas'},
    {'nombre': 'Contador', 'descripcion': 'Gestión de facturación', 'permisos': 'facturacion,reportes'},
]

for rol_data in roles:
    rol, created = Rol.objects.get_or_create(nombre=rol_data['nombre'], defaults=rol_data)
    if created:
        print(f"Rol creado: {rol.nombre}")

# Crear especialidades iniciales
especialidades = [
    'Odontología General',
    'Endodoncia',
    'Periodoncia',
    'Ortodoncia',
    'Cirugía Oral',
    'Odontopediatría',
    'Prostodoncia',
    'Estética Dental',
]

for esp_nombre in especialidades:
    esp, created = Especialidad.objects.get_or_create(nombre=esp_nombre)
    if created:
        print(f"Especialidad creada: {esp.nombre}")

# Crear formas de pago iniciales
formas_pago = [
    {'nombre': 'Efectivo', 'descripcion': 'Pago en efectivo'},
    {'nombre': 'Tarjeta de Débito', 'descripcion': 'Pago con tarjeta de débito', 'requiere_referencia': True},
    {'nombre': 'Tarjeta de Crédito', 'descripcion': 'Pago con tarjeta de crédito', 'requiere_referencia': True},
    {'nombre': 'Transferencia Bancaria', 'descripcion': 'Transferencia bancaria', 'requiere_referencia': True},
    {'nombre': 'Cheque', 'descripcion': 'Pago con cheque', 'requiere_referencia': True},
]

for forma_data in formas_pago:
    forma, created = FormaPago.objects.get_or_create(nombre=forma_data['nombre'], defaults=forma_data)
    if created:
        print(f"Forma de pago creada: {forma.nombre}")

# Crear categorías de tratamiento iniciales
categorias = [
    {'nombre': 'Preventiva', 'descripcion': 'Tratamientos preventivos', 'color': '#28a745'},
    {'nombre': 'Restaurativa', 'descripcion': 'Tratamientos restaurativos', 'color': '#007bff'},
    {'nombre': 'Endodoncia', 'descripcion': 'Tratamientos de conducto', 'color': '#dc3545'},
    {'nombre': 'Periodoncia', 'descripcion': 'Tratamientos periodontales', 'color': '#ffc107'},
    {'nombre': 'Cirugía', 'descripcion': 'Procedimientos quirúrgicos', 'color': '#6f42c1'},
    {'nombre': 'Ortodoncia', 'descripcion': 'Tratamientos ortodóncicos', 'color': '#20c997'},
    {'nombre': 'Estética', 'descripcion': 'Tratamientos estéticos', 'color': '#fd7e14'},
]

for cat_data in categorias:
    cat, created = CategoriaTratamiento.objects.get_or_create(nombre=cat_data['nombre'], defaults=cat_data)
    if created:
        print(f"Categoría creada: {cat.nombre}")

print("Datos iniciales cargados correctamente ✅")
EOF

# Levantar todos los servicios
print_message "Levantando todos los servicios..."
docker-compose up -d

print_message "🎉 ¡Configuración completada!"
echo ""
print_message "El ERP Dental está ejecutándose en:"
print_message "📱 Aplicación: http://localhost:8000"
print_message "🔧 Admin: http://localhost:8000/admin"
print_message "🗄️  PostgreSQL: localhost:5432"
echo ""
print_message "Para detener los servicios: docker-compose down"
print_message "Para ver logs: docker-compose logs -f"
print_message "Para acceder al shell de Django: docker-compose exec web python manage.py shell"
