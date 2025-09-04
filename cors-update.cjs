// Script para actualizar la configuración CORS en el backend
const fs = require('fs');
const path = require('path');

// Ruta al archivo del servidor backend
const serverFilePath = path.join(__dirname, 'backend', 'server.js');

// Verificar si el archivo existe
if (!fs.existsSync(serverFilePath)) {
  console.error('❌ Error: No se encontró el archivo del servidor en:', serverFilePath);
  process.exit(1);
}

// Leer el contenido del archivo
let serverContent = fs.readFileSync(serverFilePath, 'utf8');

// Buscar la configuración de CORS
const corsRegex = /const\s+corsOptions\s*=\s*{[\s\S]*?}/;
const corsMatch = serverContent.match(corsRegex);

if (!corsMatch) {
  console.error('❌ No se encontró la configuración de CORS en el archivo del servidor.');
  console.log('Por favor, agrega manualmente la siguiente configuración de CORS:');
  console.log(`
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://rainbow-kringle-91ddfd.netlify.app',
    /\\.netlify\\.app$/
  ],
  credentials: true
};
  `);
  process.exit(1);
}

// Crear la nueva configuración de CORS
const newCorsConfig = `const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://rainbow-kringle-91ddfd.netlify.app',
    /\\.netlify\\.app$/
  ],
  credentials: true
}`;

// Reemplazar la configuración existente
const updatedContent = serverContent.replace(corsRegex, newCorsConfig);

// Guardar el archivo actualizado
fs.writeFileSync(serverFilePath, updatedContent, 'utf8');

console.log('✅ Configuración de CORS actualizada exitosamente.');
console.log('Dominios permitidos:');
console.log('- http://localhost:5173');
console.log('- http://localhost:5174');
console.log('- https://rainbow-kringle-91ddfd.netlify.app');
console.log('- Todos los subdominios de netlify.app');
console.log('\n⚠️ Importante: Debes reiniciar el servidor backend para que los cambios surtan efecto.');
console.log('Ejecuta: node backend/server.js');
