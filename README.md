# VueBi - Dashboard de Análisis de Datos AT2

Una aplicación web moderna construida con Vue.js 3 + TypeScript para el análisis y visualización de datos del Sistema AT2 (Atención Temprana).

## 🚀 Características Principales

- **Dashboard Interactivo**: Panel de control con métricas en tiempo real
- **Reportes AT2**: Análisis detallado de atenciones médicas por diferentes criterios
- **Visualización de Datos**: Gráficos y tablas interactivas con filtros avanzados
- **Explorador de Datos**: Interfaz para consultar y filtrar datos de MySQL
- **Sistema de Reportes**: Generación automática de reportes con múltiples vistas
- **Responsive Design**: Optimizado para desktop y dispositivos móviles
- **Arquitectura Modular**: Componentes reutilizables y escalables

## 📊 Funcionalidades del Sistema

### Dashboard
- Estadísticas rápidas del sistema
- Comparación anual de registros
- Datos mensuales por año
- Catálogos del sistema

### Reportes AT2
- **Resumen Maestro**: Todos los conceptos médicos con estadísticas
- **Por Recurso Médico**: Análisis de médicos generales, especialistas, enfermeras
- **Por Grupos de Edad**: Distribución etaria de atenciones
- **Tipos de Consulta**: Consultas espontáneas vs referidas
- **Distribución Geográfica**: Análisis por municipios y departamentos

### Explorador de Datos
- Consulta de tablas MySQL con filtros avanzados
- Paginación automática
- Búsqueda en tiempo real
- Estructura de tablas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework progresivo de JavaScript
- **TypeScript** - JavaScript con tipos estáticos
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utilitario
- **Chart.js** - Librería de gráficos
- **Pinia** - State management para Vue.js

### Backend (Separado)
- **Node.js + Express** - API REST
- **MySQL** - Base de datos
- **CORS** - Configuración de seguridad
- **Sistema de Cache** - Optimización de consultas

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Backend API corriendo en `http://3.141.99.154:3000`

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/lazarohernan/ata.git
cd ata
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://3.141.99.154:3000/api
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`

## 📁 Estructura del Proyecto

```
VueBi-main/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── at2-reports/    # Componentes específicos de reportes AT2
│   │   ├── ChartComponent.vue
│   │   └── ...
│   ├── composables/        # Composables de Vue 3
│   ├── config/            # Configuraciones
│   ├── router/            # Configuración de rutas
│   ├── services/          # Servicios API
│   ├── stores/            # Estado global (Pinia)
│   ├── views/             # Páginas/Vistas principales
│   ├── App.vue            # Componente raíz
│   └── main.tsx           # Punto de entrada
├── backend/               # Código del backend (referencia)
├── public/               # Archivos estáticos
├── dist/                 # Build de producción
└── package.json          # Dependencias y scripts
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecuta ESLint
```

## 🌐 Despliegue en Netlify

### ✅ Estado Actual
**🚀 DESPLEGADO**: https://rainbow-kringle-91ddfd.netlify.app

El proyecto está completamente configurado y desplegado en Netlify con optimizaciones específicas.

### ⚙️ Configuración Actual

#### Build Settings (Automático via netlify.toml):
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`
- **NPM version**: `9`

#### Variables de Entorno (Opcional):
En Netlify Dashboard > Site settings > Environment variables:

```bash
# API Base URL (tiene fallback automático)
VITE_API_BASE_URL=http://3.141.99.154:3000/api

# Analytics (opcional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Error tracking (opcional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Optimizaciones Implementadas:
- ✅ **SPA Routing** - Configurado para Vue Router
- ✅ **Security Headers** - Headers de seguridad incluidos
- ✅ **Asset Optimization** - Archivos estáticos optimizados
- ✅ **CDN Distribution** - Distribución global automática
- ✅ **PWA Ready** - Preparado para performance
- ✅ **Code Splitting** - Chunks optimizados por funcionalidad

### 🔧 Configuración CORS

Asegúrate de que tu backend permita el dominio de Netlify:

```javascript
// En tu backend, agrega a CORS:
const corsOptions = {
  origin: [
    'http://localhost:3001',           // Desarrollo
    'https://rainbow-kringle-91ddfd.netlify.app',  // Producción
    /\.netlify\.app$/                  // Todos los subdominios de Netlify
  ],
  credentials: true
};
```

### Otros Servicios de Despliegue

- **Vercel**: Similar a Netlify, soporta Vue.js nativamente
- **GitHub Pages**: Requiere configuración adicional
- **Firebase Hosting**: Buena opción con Firebase Functions

## 🔒 Seguridad

- **Archivos Sensibles**: Asegúrate de que `.gitignore` excluya:
  - `.env` (variables de entorno)
  - `*.pem`, `*.key` (claves privadas)
  - `backend/mysql-config.js` (configuración de BD)

## 📈 Optimizaciones Implementadas

- **Sistema de Cache**: Reduce tiempo de respuesta en consultas repetidas
- **Lazy Loading**: Componentes cargados bajo demanda
- **Virtual Scrolling**: Para tablas grandes
- **Compresión**: Archivos optimizados para web
- **PWA Ready**: Preparado para Progressive Web App

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

## 🔄 Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Exportación de reportes a PDF/Excel
- [ ] Dashboard personalizable
- [ ] API de tiempo real con WebSockets
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

---

**Desarrollado con ❤️ para el Sistema Nacional de Atención Temprana (AT2)**
