#!/bin/bash

# Script SIMPLE - Solo 3 contenedores: DB, Backend, Frontend

# Configuración
SERVER_IP="150.136.29.8"
SERVER_USER="rocky"
SSH_KEY="/Users/carlosdelgado/Tec/proyecto final /ssh-key-2025-03-06.key"

echo "🚀 Subiendo 3 contenedores: DB + Backend + Frontend"

# 1. Crear directorio
echo "📁 Creando directorio..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "sudo rm -rf /opt/dental_erp && sudo mkdir -p /opt/dental_erp && sudo chown $SERVER_USER:$SERVER_USER /opt/dental_erp"

# 2. Subir archivos (solo lo esencial)
echo "📤 Subiendo backend..."
scp -i "$SSH_KEY" -r ./backend "$SERVER_USER@$SERVER_IP:/opt/dental_erp/"

echo "📤 Subiendo frontend..."
scp -i "$SSH_KEY" -r ./frontend/dist "$SERVER_USER@$SERVER_IP:/opt/dental_erp/frontend/"

echo "📤 Subiendo nginx config..."
scp -i "$SSH_KEY" -r ./nginx "$SERVER_USER@$SERVER_IP:/opt/dental_erp/"

echo "📤 Subiendo docker-compose..."
scp -i "$SSH_KEY" ./docker-compose.production.yml "$SERVER_USER@$SERVER_IP:/opt/dental_erp/docker-compose.yml"

# 3. Copiar .env
echo "⚙️ Configurando .env..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd /opt/dental_erp/backend && cp .env.production .env"

# 4. Levantar contenedores
echo "🐳 Levantando los 3 contenedores..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd /opt/dental_erp && docker-compose up -d --build"

echo "✅ ¡Listo! 3 contenedores levantados"
echo "🌐 Frontend: http://$SERVER_IP"
echo "🔧 Backend: http://$SERVER_IP:8000"
