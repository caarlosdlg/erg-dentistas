#!/bin/bash

# Script de configuración local para PostgreSQL (sin Docker)
echo "🦷 Configuración local del ERP Dental con PostgreSQL..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado."
    print_message "Para instalar PostgreSQL en macOS:"
    print_message "brew install postgresql"
    print_message "brew services start postgresql"
    exit 1
fi

print_message "PostgreSQL detectado ✅"

# Verificar si el servicio está ejecutándose
if ! brew services list | grep postgresql | grep started > /dev/null 2>&1; then
    print_warning "PostgreSQL no está ejecutándose. Intentando iniciar..."
    brew services start postgresql
    sleep 3
fi

# Crear base de datos y usuario
print_message "Configurando base de datos..."

# Crear usuario
psql -d postgres -c "CREATE USER dental_erp_user WITH PASSWORD 'dental_erp_password123';" 2>/dev/null || print_warning "El usuario ya existe"

# Crear base de datos
psql -d postgres -c "CREATE DATABASE dental_erp_db OWNER dental_erp_user;" 2>/dev/null || print_warning "La base de datos ya existe"

# Otorgar privilegios
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE dental_erp_db TO dental_erp_user;"
psql -d postgres -c "ALTER USER dental_erp_user CREATEDB;"

print_message "Base de datos configurada ✅"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_message "Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual e instalar dependencias
print_message "Instalando dependencias..."
source venv/bin/activate
pip install -r requirements.txt

# Crear directorios necesarios
print_message "Creando directorios necesarios..."
mkdir -p media/pacientes/fotos
mkdir -p media/dentistas/fotos
mkdir -p media/usuarios/fotos
mkdir -p media/pagos/comprobantes

# Ejecutar migraciones
print_message "Ejecutando migraciones..."
python manage.py makemigrations usuarios
python manage.py makemigrations dentistas
python manage.py makemigrations pacientes
python manage.py makemigrations tratamientos
python manage.py makemigrations citas
python manage.py makemigrations facturacion
python manage.py migrate

# Crear superusuario (opcional)
print_message "¿Deseas crear un superusuario? (y/n)"
read -r create_superuser

if [[ $create_superuser =~ ^[Yy]$ ]]; then
    print_message "Creando superusuario..."
    python manage.py createsuperuser
fi

# Cargar datos iniciales
print_message "Cargando datos iniciales..."
python manage.py shell << 'EOF'
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

print_message "🎉 ¡Configuración completada!"
echo ""
print_message "Para ejecutar el servidor de desarrollo:"
print_message "source venv/bin/activate"
print_message "python manage.py runserver"
echo ""
print_message "La aplicación estará disponible en: http://localhost:8000"
print_message "El admin estará disponible en: http://localhost:8000/admin"
