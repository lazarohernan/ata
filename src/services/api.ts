import axios from 'axios';

// Configuración de base URL basada en el entorno
const getBaseURL = () => {
  // En producción (Netlify)
  if (import.meta.env.PROD) {
    // Usar variable de entorno de Netlify o fallback a la instancia de AWS
    return import.meta.env.VITE_API_BASE_URL || 'http://3.141.99.154:3000/api';
  }
  // En desarrollo
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
};

// Crear instancia de axios con configuración base optimizada
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Aumentar timeout para consultas grandes
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración adicional para mejor manejo de errores
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceptar errores 4xx como respuestas válidas
  },
});

// Interceptor para manejar errores mejorado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Manejo específico de errores de red
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout: La consulta tardó demasiado tiempo');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Conexión rechazada: El servidor no está disponible');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ Host no encontrado: Verifica la URL del servidor');
    }
    
    return Promise.reject(error);
  }
);

// Tipos de datos
export interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    key: string;
    default: string | null;
    extra: string;
  }>;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Interfaces específicas para Dashboard
export interface DashboardQuickStats {
  success: boolean;
  data?: Array<{
    totalSystemRecords: number;
    currentYearDetail: number;
    totalBasicRecords: number;
    currentYearBasic: number;
  }>;
  error?: string;
}

export interface DashboardYearlyComparison {
  success: boolean;
  data?: {
    yearlyData: Array<{
      year: string;
      records: number;
    }>;
    type: string;
    startYear: string;
    endYear: string;
  };
  error?: string;
}

export interface DashboardMonthlyData {
  success: boolean;
  data?: {
    year: number;
    type: string;
    monthlyData: Array<{
      month: number;
      records: number;
      year: number;
    }>;
    totalRecords: number;
  };
  error?: string;
}

export interface DashboardCatalog {
  name: string;
  description: string;
  count: number;
}

export interface DashboardCatalogs {
  success: boolean;
  data?: DashboardCatalog[];
  error?: string;
}

// Interfaces específicas para Reportes AT2
export interface AT2Concept {
  C_CONCEPTO: string;
  D_CONCEPTO: string;
  GRUPO_ESPECIAL: string;
  total_atenciones: number;
  medicos_generales: number;
  medicos_especialistas: number;
  enfermeras_profesionales: number;
  enfermeras_auxiliares: number;
}

export interface AT2MasterSummary {
  success: boolean;
  data?: AT2Concept[];
  filters?: {
    year: string;
    month?: string;
    type: string;
  };
  performance?: {
    executionTime: number;
    cached: boolean;
  };
  summary?: {
    total_concepts: number;
    total_atenciones: number;
    periodo: string;
  };
  error?: string;
}

export interface AT2Resource {
  recurso: string;
  tipo: string;
  total_atenciones: number;
  total_registros: number;
}

export interface AT2ByResource {
  success: boolean;
  data?: AT2Resource[];
  filters?: {
    year: string;
    month?: string;
    type: string;
  };
  performance?: {
    executionTime: number;
    cached: boolean;
  };
  summary?: {
    total_recursos: number;
    total_atenciones: number;
    periodo: string;
  };
  error?: string;
}

export interface AT2AgeGroup {
  grupo_edad: string;
  total_atenciones: number;
  medicos_generales: number;
  medicos_especialistas: number;
  enfermeras_profesionales: number;
  enfermeras_auxiliares: number;
}

export interface AT2ByAgeGroup {
  success: boolean;
  data?: AT2AgeGroup[];
  filters?: {
    year: string;
    month?: string;
    type: string;
  };
  summary?: {
    total_grupos: number;
    total_atenciones: number;
    periodo: string;
  };
  error?: string;
}

export interface AT2ConsultationType {
  tipo_consulta: string;
  descripcion: string;
  total_atenciones: number;
  medicos_generales: number;
  medicos_especialistas: number;
}

export interface AT2ConsultationTypes {
  success: boolean;
  data?: AT2ConsultationType[];
  filters?: {
    year: string;
    month?: string;
    type: string;
  };
  summary?: {
    total_tipos: number;
    total_atenciones: number;
    periodo: string;
  };
  error?: string;
}

export interface AT2GeographicData {
  municipio_codigo: string;
  departamento_codigo: string;
  total_atenciones: number;
  medicos_generales: number;
  medicos_especialistas: number;
  enfermeras_profesionales: number;
  enfermeras_auxiliares: number;
}

export interface AT2Geographic {
  success: boolean;
  data?: AT2GeographicData[];
  filters?: {
    year: string;
    month?: string;
    type: string;
  };
  performance?: {
    executionTime: number;
    cached: boolean;
  };
  summary?: {
    total_municipios: number;
    total_atenciones: number;
    periodo: string;
  };
  error?: string;
}

// Servicios de API
export const apiService = {
  // Health check
  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await api.get('/health');
    return response.data;
  },

  // Obtener todas las tablas disponibles
  async getTables(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/tables');
    return response.data.data;
  },

  // Obtener estructura de una tabla
  async getTableStructure(tableName: string): Promise<Array<{
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string | null;
    Extra: string;
  }>> {
    const response = await api.get<ApiResponse<Array<{
      Field: string;
      Type: string;
      Null: string;
      Key: string;
      Default: string | null;
      Extra: string;
    }>>>(`/tables/${tableName}/structure`);
    return response.data.data;
  },

  // Obtener datos de una tabla con paginación
  async getTableData(
    tableName: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<Record<string, unknown>[]>> {
    const { limit = 100, offset = 0 } = options;
    const response = await api.get<PaginatedResponse<Record<string, unknown>[]>>(
      `/tables/${tableName}/data?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  // Obtener datos agregados para gráficos
  async getAggregatedData(
    tableName: string,
    options: {
      groupBy?: string;
      aggregate?: 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN';
      field?: string;
    } = {}
  ): Promise<Record<string, unknown>[]> {
    const { groupBy, aggregate = 'COUNT', field = '*' } = options;
    const params = new URLSearchParams();

    if (groupBy) params.append('groupBy', groupBy);
    params.append('aggregate', aggregate);
    params.append('field', field);

    const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
      `/data/aggregated/${tableName}?${params.toString()}`
    );
    return response.data.data;
  },

  // Obtener datos por año
  async getDataByYear(year: number): Promise<Record<string, unknown>[]> {
    const response = await api.get<ApiResponse<Record<string, unknown>[]>>(`/data/year/${year}`);
    return response.data.data;
  },

  // Ejecutar consulta personalizada (para futuras implementaciones)
  async executeCustomQuery(_query: string, tableName: string): Promise<Record<string, unknown>[]> {
    // Por ahora, usaremos los endpoints existentes
    // En el futuro se puede implementar un endpoint más flexible
    const response = await this.getTableData(tableName);
    return response.data;
  },

  // Obtener información completa de una tabla (estructura + datos de muestra)
  async getTableInfo(tableName: string): Promise<TableInfo> {
    const structure = await this.getTableStructure(tableName);
    // Eliminamos sampleData ya que no se usa
    // const sampleData = await this.getTableData(tableName, { limit: 10 });

    return {
      name: tableName,
      columns: structure.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }))
    };
  },

  // Crear un dataset para gráficos basado en datos reales
  async createChartDataset(
    tableName: string,
    config: {
      labelColumn: string;
      valueColumns: string[];
      aggregateFunction?: 'COUNT' | 'SUM' | 'AVG';
      filters?: Record<string, unknown>;
    }
  ): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  }> {
    const { labelColumn, valueColumns, aggregateFunction = 'COUNT' } = config;

    // Para empezar, usaremos datos agregados simples
    const rawData = await this.getAggregatedData(tableName, {
      groupBy: labelColumn,
      aggregate: aggregateFunction,
      field: valueColumns[0]
    });

    const labels = rawData.map(row => String(row[labelColumn] || 'Unknown'));
    const data = rawData.map(row => Number(row.value) || 0);

    return {
      labels,
      datasets: [{
        label: valueColumns[0],
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)'
      }]
    };
  },

  // Test de conexión a base de datos
  async testDatabaseConnection(connectionConfig: {
    type: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    timeout?: number;
    useSSL?: boolean;
    poolSize?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/datasources/test', connectionConfig);
      return response.data as { success: boolean; message: string };
    } catch (error) {
      // Manejar errores de red
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          return {
            success: false,
            message: 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.'
          };
        }
      }

      return {
        success: false,
        message: 'Error de conexión. Verifica los parámetros e intenta nuevamente.'
      };
    }
  },

  // Obtener tipos de base de datos disponibles
  async getDatabaseTypes(): Promise<Array<{
    type: string;
    name: string;
    defaultPort: number | null;
    description: string;
  }>> {
    try {
      const response = await api.get('/datasources/types');
      return response.data.data as Array<{
        type: string;
        name: string;
        defaultPort: number | null;
        description: string;
      }>;
    } catch (error) {
      console.error('Error getting database types:', error);
      // Retornar tipos por defecto si falla la API
      return [
        { type: 'mysql', name: 'MySQL', defaultPort: 3306, description: 'Base de datos relacional de código abierto' },
        { type: 'postgresql', name: 'PostgreSQL', defaultPort: 5432, description: 'Base de datos relacional avanzada' },
        { type: 'sqlite', name: 'SQLite', defaultPort: null, description: 'Base de datos ligera embebida' },
        { type: 'sqlserver', name: 'SQL Server', defaultPort: 1433, description: 'Base de datos de Microsoft' },
        { type: 'oracle', name: 'Oracle', defaultPort: 1521, description: 'Base de datos empresarial de Oracle' }
      ];
    }
  },

  // =============== FUNCIONES DE DASHBOARD ===============

  // Obtener estadísticas rápidas del dashboard
  async getDashboardQuickStats(): Promise<DashboardQuickStats> {
    try {
      const response = await api.get('/dashboard/quick-stats');
      return response.data as DashboardQuickStats;
    } catch (error) {
      console.error('Error getting dashboard quick stats:', error);
      throw error;
    }
  },

  // Obtener comparación anual
  async getDashboardYearlyComparison(): Promise<DashboardYearlyComparison> {
    try {
      const response = await api.get('/dashboard/yearly-comparison');
      return response.data as DashboardYearlyComparison;
    } catch (error) {
      console.error('Error getting yearly comparison:', error);
      throw error;
    }
  },

  // Obtener datos mensuales
  async getDashboardMonthlyData(year: string, type: string): Promise<DashboardMonthlyData> {
    try {
      const response = await api.get(`/dashboard/monthly-data/${year}/${type}`);
      return response.data as DashboardMonthlyData;
    } catch (error) {
      console.error('Error getting monthly data:', error);
      throw error;
    }
  },

  // Obtener catálogos
  async getDashboardCatalogs(): Promise<DashboardCatalogs> {
    try {
      const response = await api.get('/dashboard/catalogs');
      return response.data as DashboardCatalogs;
    } catch (error) {
      console.error('Error getting catalogs:', error);
      throw error;
    }
  },

  // =============== FUNCIONES DE REPORTES AT2 ===============

  // Obtener resumen maestro AT2
  async getAT2MasterSummary(year: string = '2024', month?: string): Promise<AT2MasterSummary> {
    try {
      const params = { year, type: 'detail' };
      if (month) Object.assign(params, { month });

      const response = await api.get('/reports/at2/master-summary', { params });
      return response.data as AT2MasterSummary;
    } catch (error) {
      console.error('Error getting AT2 master summary:', error);
      throw error;
    }
  },

  // Obtener reporte por recurso
  async getAT2ByResource(year: string = '2024', month?: string): Promise<AT2ByResource> {
    try {
      const params = { year, type: 'detail' };
      if (month) Object.assign(params, { month });

      const response = await api.get('/reports/at2/by-resource', { params });
      return response.data as AT2ByResource;
    } catch (error) {
      console.error('Error getting AT2 by resource:', error);
      throw error;
    }
  },

  // Obtener reporte por grupo de edad
  async getAT2ByAgeGroup(year: string = '2024', month?: string): Promise<AT2ByAgeGroup> {
    try {
      const params = { year, type: 'detail' };
      if (month) Object.assign(params, { month });

      const response = await api.get('/reports/at2/by-age-group', { params });
      return response.data as AT2ByAgeGroup;
    } catch (error) {
      console.error('Error getting AT2 by age group:', error);
      throw error;
    }
  },

  // Obtener reporte de tipos de consulta
  async getAT2ConsultationTypes(year: string = '2024', month?: string): Promise<AT2ConsultationTypes> {
    try {
      const params = { year, type: 'detail' };
      if (month) Object.assign(params, { month });

      const response = await api.get('/reports/at2/consultation-types', { params });
      return response.data as AT2ConsultationTypes;
    } catch (error) {
      console.error('Error getting AT2 consultation types:', error);
      throw error;
    }
  },

  // Obtener reporte geográfico
  async getAT2Geographic(year: string = '2024', month?: string): Promise<AT2Geographic> {
    try {
      const params = { year, type: 'detail' };
      if (month) Object.assign(params, { month });

      const response = await api.get('/reports/at2/geographic', { params });
      return response.data as AT2Geographic;
    } catch (error) {
      console.error('Error getting AT2 geographic:', error);
      throw error;
    }
  }
};

export default api;
