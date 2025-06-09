#!/bin/bash

# Script simple para desplegar DentalERP rápidamente

set -e

# Configuración
SERVER_IP="150.136.29.8"
SERVER_USER="rocky"
SSH_KEY="/Users/carlosdelgado/Tec/proyecto final /ssh-key-2025-03-06.key"
PROJECT_DIR="/opt/dental_erp"

echo "🚀 Desplegando DentalERP..."

# 1. Crear directorio y transferir archivos
echo "📁 Transfiriendo archivos..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "sudo mkdir -p $PROJECT_DIR && sudo chown -R $SERVER_USER:$SERVER_USER $PROJECT_DIR"

# 2. Transferir solo lo esencial
scp -i "$SSH_KEY" -r ./backend "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/"
scp -i "$SSH_KEY" -r ./frontend/dist "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/frontend/"
scp -i "$SSH_KEY" -r ./nginx "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/"
scp -i "$SSH_KEY" ./docker-compose.production.yml "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/docker-compose.yml"

# 3. Configurar .env
echo "⚙️ Configurando entorno..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $PROJECT_DIR/backend && cp .env.production .env"

# 4. Levantar contenedores
echo "🐳 Levantando contenedores..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $PROJECT_DIR && docker-compose down --remove-orphans || true && docker-compose up -d --build"

# 5. Esperar y verificar
echo "⏳ Esperando servicios..."
sleep 45

echo "✅ Despliegue completado!"
echo "🌐 Aplicación disponible en: http://$SERVER_IP:8000"
