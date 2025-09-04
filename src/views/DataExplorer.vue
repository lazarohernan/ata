<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Explorador de Datos</h1>
            <p class="mt-1 text-lg text-gray-600">
              Explora, filtra y analiza tus datos de manera sencilla
            </p>
          </div>
        </div>
        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Panel de Tablas -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Tablas Disponibles
            </h3>

            <!-- Buscador de tablas -->
            <div class="mb-4">
              <input
                v-model="tableSearch"
                type="text"
                placeholder="Buscar tabla..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <!-- Lista de tablas -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <button
                v-for="table in filteredTables"
                :key="table"
                @click="selectTable(table)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200',
                  selectedTable === table
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="truncate">{{ table }}</span>
                  <span class="text-xs text-gray-500">{{ getTableType(table) }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel Principal de Datos -->
        <div class="lg:col-span-3">
          <!-- Información de la tabla seleccionada -->
          <div v-if="selectedTable" class="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ selectedTable }}</h3>
                <p class="text-sm text-gray-600">{{ tableInfo.description }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="loadTableData"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Cargar Datos
                </button>
                <button
                  @click="createChartFromTable"
                  class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                >
                  Crear Gráfico
                </button>
              </div>
            </div>

            <!-- Filtros Rápidos -->
            <div v-if="tableColumns.length > 0" class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Filtros Rápidos</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Columna</label>
                  <select
                    v-model="quickFilter.column"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Seleccionar columna</option>
                    <option v-for="column in tableColumns" :key="column.name" :value="column.name">
                      {{ column.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Operador</label>
                  <select
                    v-model="quickFilter.operator"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="=">Igual (=)</option>
                    <option value=">">Mayor que (>)</option>
                    <option value="<">Menor que (<)</option>
                    <option value=">=">Mayor o igual (>=)</option>
                    <option value="<=">Menor o igual (<=)</option>
                    <option value="LIKE">Contiene (LIKE)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    v-model="quickFilter.value"
                    type="text"
                    placeholder="Ingrese valor..."
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    @keyup.enter="applyQuickFilter"
                  />
                </div>
              </div>
              <div class="mt-3 flex space-x-2">
                <button
                  @click="applyQuickFilter"
                  class="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Aplicar Filtro
                </button>
                <button
                  @click="clearFilters"
                  class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          <!-- Tabla de Datos -->
          <div v-if="tableData.length > 0" class="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-medium text-gray-900">
                  Datos de {{ selectedTable }}
                  <span class="text-sm text-gray-500 ml-2">({{ tableData.length }} registros)</span>
                </h4>
                <div class="flex space-x-2">
                  <button
                    @click="exportToCSV"
                    class="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded hover:bg-green-200"
                  >
                    Exportar CSV
                  </button>
                  <button
                    @click="refreshData"
                    class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla con scroll horizontal -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      v-for="column in tableColumns"
                      :key="column.name"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ column.name }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="row in displayedData" :key="row.id || Math.random()" class="hover:bg-gray-50">
                    <td
                      v-for="column in tableColumns"
                      :key="column.name"
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {{ row[column.name] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación -->
            <div v-if="tableData.length > rowsPerPage" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                  Mostrando {{ ((currentPage - 1) * rowsPerPage) + 1 }} a {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }} registros
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded">
                    {{ currentPage }} de {{ totalPages }}
                  </span>
                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-else-if="selectedTable && !loading" class="bg-white rounded-xl shadow-lg border border-gray-200/50 p-12 text-center">
            <div class="bg-gradient-to-r from-gray-400 to-gray-500 p-4 rounded-full inline-block mb-4">
              <svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay datos cargados</h3>
            <p class="text-gray-600 mb-4">Selecciona una tabla y haz clic en "Cargar Datos" para ver su contenido.</p>
            <button
              @click="loadTableData"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Cargar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../stores/dashboard';

const router = useRouter();
const dashboardStore = useDashboardStore();
const {
  availableTables,
  loading,
  error,
  loadAvailableTables,
  loadTableStructure,
  createChartFromData
} = dashboardStore;

// Estado reactivo
const selectedTable = ref<string>('');
const tableData = ref<any[]>([]);
const tableColumns = ref<any[]>([]);
const tableSearch = ref('');
const currentPage = ref(1);
const rowsPerPage = 15;
const loadingData = ref(false);

// Filtros rápidos
const quickFilter = ref({
  column: '',
  operator: '=',
  value: ''
});

// Información de tablas
const tableInfo = computed(() => {
  if (!selectedTable.value) return { description: '' };

  const info: Record<string, { description: string; type: string }> = {
    // Datos mensuales
    'AT2_BDT_MENSUAL_2024': { description: 'Datos mensuales del año 2024', type: 'Datos' },
    'AT2_BDT_MENSUAL_2023': { description: 'Datos mensuales del año 2023', type: 'Datos' },
    'AT2_BDT_MENSUAL_2022': { description: 'Datos mensuales del año 2022', type: 'Datos' },
    'AT2_BDT_MENSUAL_2021': { description: 'Datos mensuales del año 2021', type: 'Datos' },
    'AT2_BDT_MENSUAL_2020': { description: 'Datos mensuales del año 2020', type: 'Datos' },
    // Catálogos
    'CAT_GRUPOS_EDAD': { description: 'Catálogo de grupos de edad', type: 'Catálogo' },
    'CAT_SEXO': { description: 'Catálogo de sexo', type: 'Catálogo' },
    'CAT_NIVEL_OPERATIVO': { description: 'Catálogo de niveles operativos', type: 'Catálogo' },
    'AT2_BDR_CONCEPTOS_GE': { description: 'Conceptos generales del sistema', type: 'Catálogo' }
  };

  return info[selectedTable.value] || { description: 'Tabla de datos', type: 'Datos' };
});

// Computed properties
const filteredTables = computed(() => {
  if (!tableSearch.value) return availableTables.value;
  return availableTables.value.filter(table =>
    table.toLowerCase().includes(tableSearch.value.toLowerCase())
  );
});

const totalPages = computed(() => {
  return Math.ceil(tableData.value.length / rowsPerPage);
});

const displayedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return tableData.value.slice(start, end);
});

// Métodos
const getTableType = (tableName: string) => {
  if (tableName.includes('CAT_') || tableName.includes('CONCEPTOS')) {
    return 'Catálogo';
  }
  return 'Datos';
};

const selectTable = async (tableName: string) => {
  selectedTable.value = tableName;
  currentPage.value = 1;
  tableData.value = [];
  quickFilter.value = { column: '', operator: '=', value: '' };

  // Cargar estructura de la tabla
  try {
    const structure = await loadTableStructure(tableName);
    tableColumns.value = structure.map((col: any) => ({
      name: col.Field,
      type: col.Type
    }));
  } catch (err) {
    console.error('Error loading table structure:', err);
    tableColumns.value = [];
  }
};

const loadTableData = async () => {
  if (!selectedTable.value) return;

  loadingData.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/tables/${selectedTable.value}/data?limit=1000`);
    if (!response.ok) throw new Error('Error al cargar datos');

    const data = await response.json();
    tableData.value = data.data || [];
    currentPage.value = 1;
  } catch (err) {
    console.error('Error loading table data:', err);
    tableData.value = [];
  } finally {
    loadingData.value = false;
  }
};

const applyQuickFilter = () => {
  if (!quickFilter.value.column || !quickFilter.value.value) return;

  const filtered = tableData.value.filter(row => {
    const cellValue = String(row[quickFilter.value.column] || '').toLowerCase();
    const filterValue = quickFilter.value.value.toLowerCase();

    switch (quickFilter.value.operator) {
      case '=':
        return cellValue === filterValue;
      case '>':
        return parseFloat(cellValue) > parseFloat(filterValue);
      case '<':
        return parseFloat(cellValue) < parseFloat(filterValue);
      case '>=':
        return parseFloat(cellValue) >= parseFloat(filterValue);
      case '<=':
        return parseFloat(cellValue) <= parseFloat(filterValue);
      case 'LIKE':
        return cellValue.includes(filterValue);
      default:
        return true;
    }
  });

  tableData.value = filtered;
  currentPage.value = 1;
};

const clearFilters = () => {
  quickFilter.value = { column: '', operator: '=', value: '' };
  loadTableData(); // Recargar datos sin filtros
};

const createChartFromTable = () => {
  if (!selectedTable.value || tableData.value.length === 0) {
    alert('Primero carga datos de la tabla');
    return;
  }

  // Crear un gráfico simple con los datos actuales
  const firstColumn = tableColumns.value[0]?.name;
  const secondColumn = tableColumns.value[1]?.name;

  if (!firstColumn || !secondColumn) {
    alert('La tabla necesita al menos 2 columnas para crear un gráfico');
    return;
  }

  router.push({
    name: 'ChartBuilder',
    query: {
      table: selectedTable.value,
      labelColumn: firstColumn,
      valueColumn: secondColumn
    }
  });
};

const exportToCSV = () => {
  if (tableData.value.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const headers = tableColumns.value.map(col => col.name);
  const csvContent = [
    headers.join(','),
    ...tableData.value.map(row =>
      headers.map(header => `"${row[header] || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${selectedTable.value}_export.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const refreshData = () => {
  loadTableData();
};

// Inicialización
onMounted(async () => {
  await loadAvailableTables();
});

// Watch para cambios en la tabla seleccionada
watch(selectedTable, (newTable) => {
  if (newTable) {
    // Auto-cargar datos de catálogos pequeños
    if (newTable.includes('CAT_') || newTable.includes('CONCEPTOS')) {
      loadTableData();
    }
  }
});
</script>

