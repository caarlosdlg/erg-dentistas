#!/bin/bash

# Script para construir el frontend de DentalERP para producción

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

print_message "🏗️ Construyendo frontend para producción..."

# Cambiar al directorio del frontend
cd "/Users/carlosdelgado/Tec/proyecto final /frontend"

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ No se encontró package.json en el directorio frontend"
    exit 1
fi

# Instalar dependencias
print_message "📦 Instalando dependencias..."
npm install

# Configurar variables de entorno para producción
print_message "⚙️ Configurando variables de entorno..."
cat > .env.production << EOF
# DentalERP Production Frontend Environment
VITE_API_URL=https://cxrlos.fun
VITE_GOOGLE_CLIENT_ID=702715005077-llvs9p0mt3j9mhnmda2loteapg27uqf1.apps.googleusercontent.com
EOF

# Construir la aplicación para producción
print_message "🔨 Construyendo aplicación para producción..."
npm run build

# Verificar que se generó el directorio dist
if [ ! -d "dist" ]; then
    echo "❌ No se generó el directorio dist"
    exit 1
fi

print_message "✅ Frontend construido exitosamente"
print_info "📁 Archivos de producción generados en: ./dist/"
print_info "🚀 Listos para desplegar en el servidor"
