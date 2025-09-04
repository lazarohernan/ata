<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <ChartBarIcon class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ isEditing ? 'Editar Gráfico' : 'Crear Nuevo Gráfico' }}
            </h1>
            <p class="mt-1 text-lg text-gray-600">
              Construye gráficos interactivos desde tus fuentes de datos.
            </p>
          </div>
        </div>
        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Configuration Panel -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200/50 p-8 backdrop-blur-sm">
          <div class="flex items-center space-x-3 mb-6">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Cog6ToothIcon class="h-5 w-5 text-white" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Chart Configuration</h2>
          </div>

          <form @submit.prevent="saveChart" class="space-y-6">
            <!-- Basic Info -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Título del Gráfico</label>
              <input
                v-model="chartConfig.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el título del gráfico"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
              <select
                v-model="chartConfig.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bar">Gráfico de Barras</option>
                <option value="line">Gráfico de Líneas</option>
                <option value="pie">Gráfico Circular</option>
                <option value="doughnut">Gráfico de Dona</option>
                <option value="area">Gráfico de Área</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fuente de Datos</label>
              <select
                v-model="chartConfig.dataSource"
                @change="loadTables"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una fuente de datos</option>
                <option
                  v-for="dataSource in dataSources"
                  :key="dataSource.id"
                  :value="dataSource.id"
                >
                  {{ dataSource.name }}
                </option>
              </select>
            </div>

            <!-- Table Selection -->
            <div v-if="availableTables.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tabla</label>
              <select
                v-model="chartConfig.tableName"
                @change="loadTableColumns"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una tabla</option>
                <option
                  v-for="table in availableTables"
                  :key="table"
                  :value="table"
                >
                  {{ table }}
                </option>
              </select>
            </div>

            <!-- Column Configuration -->
            <div v-if="tableColumns.length > 0" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Columna de Etiquetas (Eje X)</label>
                <select
                  v-model="chartConfig.labelColumn"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione columna para etiquetas</option>
                  <option
                    v-for="column in tableColumns"
                    :key="column.name"
                    :value="column.name"
                  >
                    {{ column.name }} ({{ column.type }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Columna de Valores (Eje Y)</label>
                <select
                  v-model="chartConfig.valueColumn"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione columna para valores</option>
                  <option
                    v-for="column in numericColumns"
                    :key="column.name"
                    :value="column.name"
                  >
                    {{ column.name }} ({{ column.type }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Función de Agregación</label>
                <select
                  v-model="chartConfig.aggregateFunction"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="COUNT">CONTAR</option>
                  <option value="SUM">SUMAR</option>
                  <option value="AVG">PROMEDIO</option>
                  <option value="MAX">MÁXIMO</option>
                  <option value="MIN">MÍNIMO</option>
                </select>
              </div>
            </div>

            <!-- Generated Query Display -->
            <div v-if="generatedQuery">
              <label class="block text-sm font-medium text-gray-700 mb-2">Consulta SQL Generada</label>
              <div class="bg-gray-50 p-3 rounded-md border">
                <code class="text-sm text-gray-800">{{ generatedQuery }}</code>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Esta consulta se utilizará para obtener los datos de tu gráfico
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-between pt-6">
              <button
                type="button"
                @click="executePreview"
                class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Vista Previa
              </button>
              <div class="space-x-3">
                <button
                  type="button"
                  @click="$router.push('/charts')"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {{ isEditing ? 'Actualizar Gráfico' : 'Crear Gráfico' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Preview Panel -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200/50 p-8 backdrop-blur-sm">
          <div class="flex items-center space-x-3 mb-6">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
              <EyeIcon class="h-5 w-5 text-white" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Vista Previa en Vivo</h2>
          </div>

          <div v-if="previewData" class="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <ChartComponent :chart="previewChart" class="relative z-10" />
          </div>

          <div v-else class="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div class="text-center relative z-10">
              <div class="bg-gradient-to-r from-gray-400 to-gray-500 p-4 rounded-full inline-block mb-4">
                <ChartBarIcon class="h-12 w-12 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Vista previa no disponible</h3>
              <p class="mt-2 text-sm text-gray-600 max-w-sm">Configura los ajustes de tu gráfico y haz clic en "Vista Previa" para ver el resultado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '../stores/dashboard';
import ChartComponent from '../components/ChartComponent.vue';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const { 
  dataSources, 
  availableTables, 
  tableStructures, 
  loading, 
  error,
  addChart, 
  updateChart,
  loadAvailableTables,
  loadTableStructure,
  createChartFromData
} = dashboardStore;

const isEditing = computed(() => !!route.params.id);

const chartConfig = ref({
  title: '',
  type: 'bar' as 'bar' | 'line' | 'pie' | 'doughnut' | 'area',
  dataSource: 'sesal-db',
  tableName: '',
  labelColumn: '',
  valueColumn: '',
  aggregateFunction: 'COUNT' as 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN',
  filters: {}
});

// Auto-llenar desde parámetros de URL (desde explorador de datos)
const urlParams = route.query;
if (urlParams.table) {
  chartConfig.value.tableName = urlParams.table as string;
  chartConfig.value.labelColumn = (urlParams.labelColumn as string) || '';
  chartConfig.value.valueColumn = (urlParams.valueColumn as string) || '';

  // Generar título automáticamente
  chartConfig.value.title = `Análisis de ${chartConfig.value.tableName}`;
}

const previewData = ref(null);
const tableColumns = ref<Array<{name: string, type: string}>>([]);

// Computed properties
const numericColumns = computed(() => {
  return tableColumns.value.filter(col => 
    col.type.toLowerCase().includes('int') || 
    col.type.toLowerCase().includes('decimal') || 
    col.type.toLowerCase().includes('float') ||
    col.type.toLowerCase().includes('double')
  );
});

const generatedQuery = computed(() => {
  if (!chartConfig.value.tableName || !chartConfig.value.labelColumn) return '';
  
  const { tableName, labelColumn, valueColumn, aggregateFunction } = chartConfig.value;
  const valueField = valueColumn || '*';
  
  return `SELECT ${labelColumn}, ${aggregateFunction}(${valueField}) as value FROM \`${tableName}\` GROUP BY ${labelColumn} ORDER BY value DESC`;
});

const previewChart = computed(() => ({
  ...chartConfig.value,
  id: 'preview',
  data: previewData.value || getSampleData(),
  options: getChartOptions(),
  position: { x: 0, y: 0, w: 6, h: 4 }
}));

// Methods
const loadTables = async () => {
  if (!chartConfig.value.dataSource) return;
  
  try {
    await loadAvailableTables();
  } catch (err) {
    console.error('Error loading tables:', err);
  }
};

const loadTableColumns = async () => {
  if (!chartConfig.value.tableName) return;
  
  try {
    const structure = await loadTableStructure(chartConfig.value.tableName);
    tableColumns.value = structure.map(col => ({
      name: col.Field,
      type: col.Type
    }));
  } catch (err) {
    console.error('Error loading table structure:', err);
  }
};

const executePreview = async () => {
  if (!chartConfig.value.tableName || !chartConfig.value.labelColumn) {
    alert('Please select a table and label column first');
    return;
  }

  try {
    const chartData = await createChartFromData(
      chartConfig.value.title || 'Preview Chart',
      chartConfig.value.tableName,
      chartConfig.value.type,
      {
        labelColumn: chartConfig.value.labelColumn,
        valueColumns: [chartConfig.value.valueColumn || '*'],
        aggregateFunction: chartConfig.value.aggregateFunction
      }
    );
    
    previewData.value = chartData.data;
  } catch (err) {
    console.error('Error creating preview:', err);
    alert('Error creating chart preview. Please check your configuration.');
  }
};

const saveChart = async () => {
  if (!chartConfig.value.title || !chartConfig.value.tableName || !chartConfig.value.labelColumn) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    if (isEditing.value) {
      // For editing, update the existing chart
      const existingChart = dashboardStore.getChartById(route.params.id as string);
      if (existingChart) {
        updateChart(route.params.id as string, {
          title: chartConfig.value.title,
          type: chartConfig.value.type,
          data: previewData.value || getSampleData(),
          options: getChartOptions()
        });
      }
    } else {
      // For new charts, create using the API
      await createChartFromData(
        chartConfig.value.title,
        chartConfig.value.tableName,
        chartConfig.value.type,
        {
          labelColumn: chartConfig.value.labelColumn,
          valueColumns: [chartConfig.value.valueColumn || '*'],
          aggregateFunction: chartConfig.value.aggregateFunction
        }
      );
    }

    router.push('/charts');
  } catch (err) {
    console.error('Error saving chart:', err);
    alert('Error saving chart. Please try again.');
  }
};

onMounted(async () => {
  // Load available tables on mount
  await loadTables();

  // Auto-cargar tabla desde URL params
  if (chartConfig.value.tableName) {
    await loadTableColumns();
  }

  if (isEditing.value) {
    const existingChart = dashboardStore.getChartById(route.params.id as string);
    if (existingChart) {
      chartConfig.value = {
        title: existingChart.title,
        type: existingChart.type,
        dataSource: existingChart.dataSource,
        tableName: '', // Will need to be extracted from query
        labelColumn: '',
        valueColumn: '',
        aggregateFunction: 'COUNT',
        filters: existingChart.filters
      };
      previewData.value = existingChart.data;
    }
  }
});

const getSampleData = () => {
  const sampleData = {
    bar: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Sample Data',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }]
    },
    line: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Sample Data',
        data: [12, 19, 3, 5, 2],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    pie: {
      labels: ['Red', 'Blue', 'Yellow', 'Green'],
      datasets: [{
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ]
      }]
    }
  };

  return sampleData[chartConfig.value.type] || sampleData.bar;
};

const getChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartConfig.value.title || 'Chart Preview'
      }
    }
  };
};


</script>