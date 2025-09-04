#!/bin/bash

# Script para reiniciar el backend en AWS
echo "🔄 Reiniciando backend en AWS..."

# Subir archivos actualizados
echo "📤 Subiendo archivos actualizados..."
scp -i "LightsailDefaultKey-us-east-2.pem" backend/mysql-config.js ubuntu@18.116.12.40:~/backend/
scp -i "LightsailDefaultKey-us-east-2.pem" backend/server.js ubuntu@18.116.12.40:~/backend/

# Conectar y reiniciar el backend
echo "🔄 Reiniciando servidor..."
ssh -i "LightsailDefaultKey-us-east-2.pem" ubuntu@18.116.12.40 << 'EOF'
cd ~/backend

# Matar procesos existentes
pkill -f "node server.js" || echo "No hay procesos anteriores"

# Instalar dependencias si es necesario
npm install --production

# Iniciar el backend en segundo plano
nohup npm start > server.log 2>&1 &

# Esperar un momento y verificar
sleep 3
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Backend iniciado correctamente"
    echo "📋 Logs del servidor:"
    tail -10 server.log
else
    echo "❌ Error iniciando el backend"
    echo "📋 Logs de error:"
    cat server.log
fi
EOF

echo "🏁 Proceso completado"

