#!/bin/bash

# Script de despliegue para Netlify
echo "🚀 Iniciando despliegue a Netlify..."

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Limpiar caché de Vite
echo "🧹 Limpiando caché de Vite..."
rm -rf node_modules/.vite

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar linter
echo "🔍 Ejecutando linter..."
npm run lint

# Build de producción
echo "🔨 Construyendo para producción..."
npm run build

# Verificar que el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente!"
    echo ""
    echo "📁 Archivos generados en dist/:"
    ls -la dist/
    echo ""
    echo "🌐 Tu sitio está listo para desplegarse en Netlify"
    echo "📋 Para desplegar:"
    echo "   1. Sube los archivos de la carpeta 'dist/' a Netlify"
    echo "   2. O conecta tu repositorio de Git a Netlify para despliegue automático"
    echo ""
    echo "🔗 URL actual: https://rainbow-kringle-91ddfd.netlify.app"
else
    echo "❌ Error durante el build"
    exit 1
fi
