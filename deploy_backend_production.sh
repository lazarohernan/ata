#!/bin/bash

# Script de despliegue completo del backend a Lightsail
echo "🚀 Desplegando Backend VueBi a Lightsail..."

# Variables de configuración
LIGHTSAIL_IP="3.141.99.154"
KEY_PATH="$(pwd)/LightsailDefaultKey-us-east-2.pem"
PROJECT_NAME="vuebi-backend"

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar conexión SSH
log "🔍 Verificando conexión SSH..."
if ! ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$LIGHTSAIL_IP "echo 'SSH OK'" > /dev/null 2>&1; then
    log "❌ Error: No se puede conectar por SSH a $LIGHTSAIL_IP"
    exit 1
fi
log "✅ Conexión SSH verificada"

# Subir archivos del backend
log "📤 Subiendo archivos del backend..."
ssh -i "$KEY_PATH" ubuntu@$LIGHTSAIL_IP "mkdir -p ~/$PROJECT_NAME"
scp -i "$KEY_PATH" -r backend/* ubuntu@$LIGHTSAIL_IP:~/$PROJECT_NAME/

# Ejecutar configuración en el servidor
ssh -i "$KEY_PATH" ubuntu@$LIGHTSAIL_IP << 'REMOTE_SETUP'
cd ~/'$PROJECT_NAME'

echo "�� Iniciando configuración del servidor..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# Instalar Node.js LTS si no está instalado
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Instalar PM2 si no está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# Instalar dependencias del proyecto
echo "📦 Instalando dependencias del proyecto..."
npm install --production

# Matar procesos anteriores
echo "🛑 Deteniendo procesos anteriores..."
pm2 delete '$PROJECT_NAME' 2>/dev/null || true
pkill -f "node server.js" || true
sleep 2

# Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación con PM2..."
pm2 start server.js --name '$PROJECT_NAME'
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configurar firewall
echo "🔥 Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Verificar estado
echo "📊 Verificando estado de la aplicación..."
sleep 3
pm2 status
pm2 logs '$PROJECT_NAME' --lines 5 --nostream

echo "✅ Configuración completada!"
echo ""
echo "🌐 El backend estará disponible en:"
echo "   http://'$LIGHTSAIL_IP':3000"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: pm2 logs '$PROJECT_NAME'"
echo "   Reiniciar: pm2 restart '$PROJECT_NAME'"
echo "   Estado: pm2 status"
REMOTE_SETUP

log "✅ Despliegue completado exitosamente!"
log "🌐 Backend disponible en: http://$LIGHTSAIL_IP:3000"

echo ""
echo "📋 Próximos pasos:"
echo "1. Probar: curl http://$LIGHTSAIL_IP:3000/api/health"
echo "2. Verificar logs: ssh -i $KEY_PATH ubuntu@$LIGHTSAIL_IP 'pm2 logs'"
echo "3. Si hay problemas, reiniciar: ssh -i $KEY_PATH ubuntu@$LIGHTSAIL_IP 'pm2 restart $PROJECT_NAME'"
