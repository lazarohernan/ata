import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api';

export interface Chart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options: {
    responsive: boolean;
    plugins: {
      legend: {
        position: 'top' | 'bottom' | 'left' | 'right';
      };
      title: {
        display: boolean;
        text: string;
      };
    };
  };
  dataSource: string;
  query: string;
  filters: Record<string, string | number>;
  position: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  chartIds: string[];
  filters: Record<string, string | number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'testing';
  timeout?: number;
  useSSL?: boolean;
  poolSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const dashboards = ref<Dashboard[]>([
    {
      id: '1',
      title: 'Análisis SESAL - Datos Mensuales',
      description: 'Dashboard principal con datos históricos mensuales de SESAL',
      chartIds: ['1', '2'],
      filters: {},
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      title: 'Análisis por Años',
      description: 'Análisis comparativo de datos por años',
      chartIds: [],
      filters: {},
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    }
  ]);

  const charts = ref<Chart[]>([
    {
      id: '1',
      title: 'Registros Mensuales 2024',
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Cantidad de Registros',
          data: [1703, 1724, 1750, 1715, 1726, 1731, 1733, 1721, 1717, 1724, 1732, 1711],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Registros Mensuales 2024'
          }
        }
      },
      dataSource: 'sesal-db',
      query: 'SELECT N_MES, COUNT(*) as value FROM `AT2_BDT_MENSUAL_2024` GROUP BY N_MES ORDER BY N_MES',
      filters: {},
      position: { x: 0, y: 0, w: 6, h: 4 }
    },
    {
      id: '2',
      title: 'Distribución por Año',
      type: 'pie',
      data: {
        labels: ['2022', '2023', '2024', '2025'],
        datasets: [{
          label: 'Registros por Año',
          data: [18500, 19200, 20700, 12000], // Datos de ejemplo
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Distribución por Año'
          }
        }
      },
      dataSource: 'sesal-db',
      query: 'SELECT N_ANIO, COUNT(*) as value FROM tables GROUP BY N_ANIO',
      filters: {},
      position: { x: 6, y: 0, w: 6, h: 4 }
    }
  ]);

  const dataSources = ref<DataSource[]>([
    {
      id: 'sesal-db',
      name: 'Base de Datos SESAL Histórica',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'sesal_historico',
      username: 'dataviz_user',
      password: 'dataviz_password123',
      status: 'connected',
      timeout: 30,
      useSSL: false,
      poolSize: 5,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    }
  ]);

  // Estado para datos de la API
  const availableTables = ref<string[]>([]);
  const tableStructures = ref<Record<string, Array<{
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string | null;
    Extra: string;
  }>>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getDashboardById = computed(() => {
    return (id: string) => dashboards.value.find(d => d.id === id);
  });

  const getChartById = computed(() => {
    return (id: string) => charts.value.find(c => c.id === id);
  });

  const getDataSourceById = computed(() => {
    return (id: string) => dataSources.value.find(ds => ds.id === id);
  });

  // Acciones
  const addDashboard = (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dashboards.value.push(newDashboard);
    return newDashboard;
  };

  const updateDashboard = (id: string, updates: Partial<Dashboard>) => {
    const index = dashboards.value.findIndex(d => d.id === id);
    if (index !== -1) {
      dashboards.value[index] = {
        ...dashboards.value[index],
        ...updates,
        updatedAt: new Date()
      };
    }
  };

  const deleteDashboard = (id: string) => {
    const index = dashboards.value.findIndex(d => d.id === id);
    if (index !== -1) {
      dashboards.value.splice(index, 1);
    }
  };

  const addChart = (chart: Omit<Chart, 'id'>) => {
    const newChart: Chart = {
      ...chart,
      id: Date.now().toString()
    };
    charts.value.push(newChart);
    return newChart;
  };

  const updateChart = (id: string, updates: Partial<Chart>) => {
    const index = charts.value.findIndex(c => c.id === id);
    if (index !== -1) {
      charts.value[index] = { ...charts.value[index], ...updates };
    }
  };

  const deleteChart = (id: string) => {
    const index = charts.value.findIndex(c => c.id === id);
    if (index !== -1) {
      charts.value.splice(index, 1);
    }
  };

  const addDataSource = async (dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDataSource: DataSource = {
      ...dataSource,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'disconnected' // Inicialmente desconectado hasta que se pruebe
    };
    
    // Guardar en localStorage para persistencia
    const storedSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
    storedSources.push(newDataSource);
    localStorage.setItem('dataSources', JSON.stringify(storedSources));
    
    dataSources.value.push(newDataSource);
    return newDataSource;
  };

  const updateDataSource = async (id: string, updates: Partial<DataSource>) => {
    const index = dataSources.value.findIndex(ds => ds.id === id);
    if (index !== -1) {
      const updatedDataSource = {
        ...dataSources.value[index],
        ...updates,
        updatedAt: new Date()
      };
      
      dataSources.value[index] = updatedDataSource;
      
      // Actualizar en localStorage
      const storedSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      const storedIndex = storedSources.findIndex((ds: DataSource) => ds.id === id);
      if (storedIndex !== -1) {
        storedSources[storedIndex] = updatedDataSource;
        localStorage.setItem('dataSources', JSON.stringify(storedSources));
      }
      
      return updatedDataSource;
    }
    throw new Error('Fuente de datos no encontrada');
  };

  const deleteDataSource = async (id: string) => {
    const index = dataSources.value.findIndex(ds => ds.id === id);
    if (index !== -1) {
      dataSources.value.splice(index, 1);
      
      // Eliminar de localStorage
      const storedSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      const filteredSources = storedSources.filter((ds: DataSource) => ds.id !== id);
      localStorage.setItem('dataSources', JSON.stringify(filteredSources));
      
      return true;
    }
    throw new Error('Fuente de datos no encontrada');
  };

  const loadDataSourcesFromStorage = () => {
    try {
      const storedSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      if (Array.isArray(storedSources) && storedSources.length > 0) {
        dataSources.value = storedSources.map((ds: Record<string, unknown>) => ({
          ...ds,
          createdAt: ds.createdAt ? new Date(ds.createdAt as string) : new Date(),
          updatedAt: ds.updatedAt ? new Date(ds.updatedAt as string) : new Date()
        })) as DataSource[];
      }
    } catch (error) {
      console.error('Error loading data sources from storage:', error);
      // Reset to empty array if there's an error
      dataSources.value = [];
    }
  };

  // Funciones para interactuar con la API
  const loadAvailableTables = async () => {
    try {
      loading.value = true;
      error.value = null;
      const tables = await apiService.getTables();
      availableTables.value = tables;
      return tables;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar tablas';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadTableStructure = async (tableName: string) => {
    try {
      const structure = await apiService.getTableStructure(tableName);
      tableStructures.value[tableName] = structure;
      return structure;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar estructura de tabla';
      throw err;
    }
  };

  const createChartFromData = async (
    title: string,
    tableName: string,
    chartType: Chart['type'],
    config: {
      labelColumn: string;
      valueColumns: string[];
      aggregateFunction?: 'COUNT' | 'SUM' | 'AVG';
    }
  ): Promise<Chart> => {
    try {
      loading.value = true;
      const chartData = await apiService.createChartDataset(tableName, config);
      
      const newChart: Chart = {
        id: Date.now().toString(),
        title,
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        dataSource: 'sesal-db',
        query: `SELECT ${config.labelColumn}, ${config.aggregateFunction}(${config.valueColumns[0]}) FROM ${tableName} GROUP BY ${config.labelColumn}`,
        filters: {},
        position: { x: 0, y: 0, w: 6, h: 4 }
      };

      charts.value.push(newChart);
      return newChart;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear gráfico';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshChartData = async (chartId: string) => {
    try {
      const chart = charts.value.find(c => c.id === chartId);
      if (!chart) throw new Error('Gráfico no encontrado');

      // Extraer nombre de tabla y configuración de la consulta del gráfico
      // Este es un enfoque simplificado - en una aplicación real se podría almacenar esta metadata
      const tableName = chart.query.split('FROM ')[1]?.split(' ')[0];
      if (!tableName) throw new Error('No se pudo determinar la tabla del gráfico');

      // Por ahora, usaremos una configuración predeterminada - esto debería mejorarse
      const chartData = await apiService.createChartDataset(tableName, {
        labelColumn: 'N_MES', // Columna predeterminada para meses
        valueColumns: ['*'],
        aggregateFunction: 'COUNT'
      });

      chart.data = chartData;
      return chart;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar datos del gráfico';
      throw err;
    }
  };

  const testConnection = async (dataSourceId: string): Promise<boolean> => {
    try {
      const dataSource = dataSources.value.find(ds => ds.id === dataSourceId);
      if (!dataSource) return false;

      dataSource.status = 'testing';
      const health = await apiService.checkHealth();
      dataSource.status = health.status === 'OK' ? 'connected' : 'disconnected';
      return dataSource.status === 'connected';
    } catch {
      const dataSource = dataSources.value.find(ds => ds.id === dataSourceId);
      if (dataSource) dataSource.status = 'disconnected';
      return false;
    }
  };

  const testDataSourceConnection = async (connectionConfig: {
    type: DataSource['type'];
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    timeout?: number;
    useSSL?: boolean;
    poolSize?: number;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      // Simular test de conexión - en una implementación real esto se haría con el backend
      const testResult = await apiService.testDatabaseConnection(connectionConfig);
      return testResult;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al probar la conexión'
      };
    }
  };

  const addChartToDashboard = (dashboardId: string, chartId: string) => {
    const dashboard = dashboards.value.find(d => d.id === dashboardId);
    if (dashboard && !dashboard.chartIds.includes(chartId)) {
      dashboard.chartIds.push(chartId);
      dashboard.updatedAt = new Date();
    }
  };

  const removeChartFromDashboard = (dashboardId: string, chartId: string) => {
    const dashboard = dashboards.value.find(d => d.id === dashboardId);
    if (dashboard) {
      const index = dashboard.chartIds.indexOf(chartId);
      if (index > -1) {
        dashboard.chartIds.splice(index, 1);
        dashboard.updatedAt = new Date();
      }
    }
  };

  return {
    // Estado
    dashboards,
    charts,
    dataSources,
    availableTables,
    tableStructures,
    loading,
    error,
    // Getters
    getDashboardById,
    getChartById,
    getDataSourceById,
    // Acciones
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addChart,
    updateChart,
    deleteChart,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    testConnection,
    testDataSourceConnection,
    loadDataSourcesFromStorage,
    // Nuevas acciones de API
    loadAvailableTables,
    loadTableStructure,
    createChartFromData,
    refreshChartData,
    addChartToDashboard,
    removeChartFromDashboard
  };
});