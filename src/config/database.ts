// Configuración de base de datos para la aplicación DataViz
export const databaseConfig = {
  host: 'localhost',
  port: 3306,
  user: 'dataviz_user',
  password: 'dataviz_password123',
  database: 'sesal_historico',
  charset: 'utf8mb4'
};

// Configuración para la aplicación Vue (usando axios para las peticiones HTTP)
export const apiConfig = {
  baseURL: 'http://localhost:3000/api', // Puerto donde corre el backend
  timeout: 30000
};

// ⚠️ IMPORTANTE: El backend ES NECESARIO porque:
// 1. El navegador NO puede conectarse directamente a MySQL
// 2. El backend actúa como proxy seguro entre frontend y base de datos
// 3. Maneja la autenticación, validación y seguridad de las consultas

// Información sobre las tablas disponibles
export const tableInfo = {
  monthlyData: {
    prefix: 'AT2_BDT_MENSUAL_',
    years: Array.from({length: 18}, (_, i) => 2008 + i), // 2008-2025
    description: 'Datos mensuales históricos'
  },
  monthlyDetail: {
    prefix: 'AT2_BDT_MENSUAL_DETALLE_',
    years: Array.from({length: 18}, (_, i) => 2008 + i), // 2008-2025
    description: 'Datos mensuales detallados'
  },
  catalogs: {
    groups: 'CAT_GRUPOS_EDAD',
    operationalLevel: 'CAT_NIVEL_OPERATIVO',
    sex: 'CAT_SEXO',
    concepts: 'AT2_BDR_CONCEPTOS_GE'
  }
};

export default databaseConfig;
