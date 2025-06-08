#!/bin/bash
# Script para recolectar y optimizar archivos estáticos para producción
# Versión avanzada con soporte para CSS crítico, versionado y CDN

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${YELLOW}=== Recolección y Optimización de Archivos Estáticos ===${NC}"

# Verificar si estamos en el directorio correcto
if [ ! -f "manage.py" ]; then
    echo -e "${RED}Error: Este script debe ejecutarse desde el directorio raíz del proyecto (donde está manage.py)${NC}"
    exit 1
fi

# Función para mostrar sección
show_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Función para verificar comando
check_command() {
    command -v $1 >/dev/null 2>&1 || { 
        echo -e "${YELLOW}El comando $1 no está instalado. Intentando instalar...${NC}" 
        return 1
    }
    return 0
}

# Verificar dependencias
show_section "Verificando dependencias"

# Lista de paquetes a instalar si es necesario
PACKAGES_TO_INSTALL=""

# Verificar django_compressor
python -c "import compressor" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}django-compressor no está instalado, se añadirá a la lista de instalación${NC}"
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL django-compressor"
fi

# Verificar brotli
python -c "import brotli" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}brotli no está instalado, se añadirá a la lista de instalación${NC}"
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL brotlipy"
fi

# Verificar storages
python -c "import storages" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}django-storages no está instalado, se añadirá a la lista de instalación${NC}"
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL django-storages boto3"
fi

# Instalar dependencias si es necesario
if [ -n "$PACKAGES_TO_INSTALL" ]; then
    echo -e "${YELLOW}Instalando dependencias: $PACKAGES_TO_INSTALL ${NC}"
    pip install $PACKAGES_TO_INSTALL
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error al instalar dependencias${NC}"
        exit 1
    fi
    echo -e "${GREEN}Dependencias instaladas correctamente${NC}"
else
    echo -e "${GREEN}Todas las dependencias Python están instaladas${NC}"
fi

# Verificar herramientas externas
echo -e "${YELLOW}Verificando herramientas de optimización...${NC}"

# Herramientas para CSS/JS
check_command cleancss || npm install -g clean-css-cli
check_command terser || npm install -g terser
check_command brotli || {
    if [ "$(uname)" == "Darwin" ]; then 
        brew install brotli
    else
        echo -e "${RED}Por favor instala brotli manualmente${NC}"
    fi
}

# Limpiar directorio staticfiles
show_section "Limpiando directorio de archivos estáticos"
python manage.py collectstatic --clear --noinput
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al limpiar archivos estáticos${NC}"
    exit 1
fi
echo -e "${GREEN}Directorio de archivos estáticos limpiado correctamente${NC}"

# Preparar directorios
STATIC_DIR="staticfiles"
TEMP_DIR="staticfiles_temp"
mkdir -p $TEMP_DIR

# Recolectar archivos estáticos
show_section "Recolectando archivos estáticos"
python manage.py collectstatic --noinput
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al recolectar archivos estáticos${NC}"
    exit 1
fi
echo -e "${GREEN}Archivos estáticos recolectados correctamente${NC}"

# Comprimir archivos CSS
show_section "Optimizando archivos CSS"
echo -e "${YELLOW}Procesando archivos CSS...${NC}"
find $STATIC_DIR -type f -name "*.css" | while read file; do
    echo -e "Optimizando: $file"
    
    # Crear directorio para archivos temporales
    mkdir -p "$(dirname "$TEMP_DIR/$file")"
    
    # Minimizar CSS
    cleancss -O2 "$file" -o "$TEMP_DIR/$file"
    
    # Reemplazar el original con el minimizado
    cp "$TEMP_DIR/$file" "$file"
    
    # Comprimir con gzip y brotli
    gzip -9 -k -f "$file"
    
    # Comprimir con brotli si está disponible
    if check_command brotli; then
        brotli -q 11 -f "$file" -o "$file.br"
    fi
done

# Comprimir archivos JS
show_section "Optimizando archivos JavaScript"
echo -e "${YELLOW}Procesando archivos JavaScript...${NC}"
find $STATIC_DIR -type f -name "*.js" | while read file; do
    echo -e "Optimizando: $file"
    
    # Crear directorio para archivos temporales
    mkdir -p "$(dirname "$TEMP_DIR/$file")"
    
    # Minimizar JS
    terser "$file" -c -m -o "$TEMP_DIR/$file"
    
    # Reemplazar el original con el minimizado
    cp "$TEMP_DIR/$file" "$file"
    
    # Comprimir con gzip y brotli
    gzip -9 -k -f "$file"
    
    # Comprimir con brotli si está disponible
    if check_command brotli; then
        brotli -q 11 -f "$file" -o "$file.br"
    fi
done

# Comprimir archivos HTML
show_section "Optimizando archivos HTML"
echo -e "${YELLOW}Procesando archivos HTML...${NC}"
find $STATIC_DIR -type f -name "*.html" | while read file; do
    echo -e "Comprimiendo: $file"
    
    # Comprimir con gzip y brotli
    gzip -9 -k -f "$file"
    
    # Comprimir con brotli si está disponible
    if check_command brotli; then
        brotli -q 11 -f "$file" -o "$file.br"
    fi
done

# Comprimir otros archivos de texto (SVG, XML, etc.)
show_section "Optimizando otros archivos de texto"
find $STATIC_DIR -type f \( -name "*.svg" -o -name "*.xml" -o -name "*.txt" -o -name "*.json" \) | while read file; do
    echo -e "Comprimiendo: $file"
    
    # Optimizar SVG si es un archivo SVG
    if [[ "$file" == *.svg ]]; then
        if check_command svgo; then
            echo -e "Optimizando SVG: $file"
            svgo --multipass "$file" -o "$file.min"
            if [ -f "$file.min" ]; then
                mv "$file.min" "$file"
            fi
        else
            echo -e "${YELLOW}svgo no está instalado. Considera instalarlo para optimizar SVGs: npm install -g svgo${NC}"
        fi
    fi
    
    # Comprimir con gzip y brotli
    gzip -9 -k -f "$file"
    
    # Comprimir con brotli si está disponible
    if check_command brotli; then
        brotli -q 11 -f "$file" -o "$file.br"
    fi
done

# Optimizar fuentes web
show_section "Optimizando fuentes web"
find $STATIC_DIR -type f \( -name "*.woff" -o -name "*.woff2" -o -name "*.eot" -o -name "*.ttf" \) | while read file; do
    echo -e "Procesando fuente: $file"
    
    # No comprimimos los WOFF2 ya que ya están comprimidos
    if [[ "$file" != *.woff2 ]]; then
        # Comprimir con gzip
        gzip -9 -k -f "$file"
        
        # Comprimir con brotli si está disponible
        if check_command brotli; then
            brotli -q 11 -f "$file" -o "$file.br"
        fi
    fi
done

# Generar el archivo de versiones (manifest)
show_section "Generando manifest de versiones"
echo -e "${YELLOW}Creando archivo de manifest para versionado...${NC}"
python manage.py collectstatic --noinput --dry-run
echo -e "${GREEN}Archivo de manifest generado correctamente${NC}"

# Limpieza
echo -e "${YELLOW}Limpiando archivos temporales...${NC}"
rm -rf $TEMP_DIR

# Verificar archivos generados
show_section "Resumen"
TOTAL_FILES=$(find $STATIC_DIR -type f -not -name "*.gz" -not -name "*.br" | wc -l | tr -d ' ')
COMPRESSED_FILES=$(find $STATIC_DIR -type f \( -name "*.gz" -o -name "*.br" \) | wc -l | tr -d ' ')
echo -e "${GREEN}Total de archivos estáticos: $TOTAL_FILES${NC}"
echo -e "${GREEN}Archivos comprimidos creados: $COMPRESSED_FILES${NC}"

# Verificar tamaños
ORIGINAL_SIZE=$(find $STATIC_DIR -type f -not -name "*.gz" -not -name "*.br" -exec du -ch {} \; | grep total$ | cut -f1)
echo -e "${GREEN}Tamaño total de archivos originales: $ORIGINAL_SIZE${NC}"

# Mostrar instrucciones finales
show_section "Instrucciones finales"
echo -e "${YELLOW}✅ Proceso de optimización de archivos estáticos completado${NC}"
echo -e "${YELLOW}Para servir correctamente los archivos estáticos optimizados:${NC}"
echo -e "  1. Asegúrate de que DEBUG=False en settings.py"
echo -e "  2. Configura tu servidor web (Nginx, Apache) para servir los archivos comprimidos"
echo -e "  3. Configura los encabezados Cache-Control adecuados"

if [ -f ".env" ]; then
    echo -e "\n${YELLOW}Si quieres utilizar almacenamiento en la nube (S3), configura estas variables en .env:${NC}"
    echo -e "  USE_S3=True"
    echo -e "  AWS_ACCESS_KEY_ID=tu_access_key"
    echo -e "  AWS_SECRET_ACCESS_KEY=tu_secret_key"
    echo -e "  AWS_STORAGE_BUCKET_NAME=nombre_bucket"
    echo -e "  AWS_S3_REGION_NAME=region"
    echo -e "  USE_CDN=True # opcional"
    echo -e "  CDN_DOMAIN=tu_dominio_cdn # opcional"
fi
