<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header (condicional) -->
      <div v-if="!hideHeader && !isEmbed" class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Dashboard SESAL</h1>
            <p class="mt-1 text-sm text-gray-600">Resumen ejecutivo de datos históricos del sistema</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="initializeDashboard"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? 'Actualizando...' : 'Actualizar Datos' }}
            </button>
            <button
              @click="$router.push('/data-sources')"
              class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-all duration-200 transform hover:scale-105"
            >
              Ver Fuentes
            </button>
            <button
              @click="showEmbedModal = true"
              class="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-all duration-200 transform hover:scale-105"
            >
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Compartir/Embed
            </button>

          </div>
        </div>
      </div>

      <!-- Header simplificado para embed -->
      <div v-if="!hideHeader && isEmbed" class="mb-4 text-center">
        <h1 class="text-lg font-semibold text-gray-800">Dashboard SESAL - Embed</h1>
        <p class="text-xs text-gray-600">Resumen ejecutivo de datos históricos</p>
      </div>

      <!-- Dashboard Simple Grid -->
      <div class="space-y-8">
        <!-- Indicador de carga -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando datos del dashboard...</span>
        </div>

        <!-- Métricas Principales (condicional) -->
        <div v-if="!hideMetrics && !loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Sistema Completo -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-blue-100 truncate">Total Sistema Completo</dt>
                  <dd class="text-2xl font-bold text-white">{{ formatNumber(totalSystemRecords + totalBasicRecords) }}</dd>
                  <dd class="text-xs text-blue-100">16.7+ millones de registros</dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Datos Detallados 2024 -->
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-blue-100 truncate">Registros Detallados 2024</dt>
                  <dd class="text-2xl font-bold text-white">{{ formatNumber(totalDetailRecords2024) }}</dd>
                  <dd class="text-xs text-blue-100">1.09+ millones</dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Datos Básicos Históricos -->
          <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-indigo-100 truncate">Datos Históricos Básicos</dt>
                  <dd class="text-2xl font-bold text-white">{{ formatNumber(totalBasicRecords) }}</dd>
                  <dd class="text-xs text-indigo-100">333K registros (2008-2025)</dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Años de Datos -->
          <div class="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-blue-100 truncate">Años de Datos</dt>
                  <dd class="text-2xl font-bold text-white">18 años</dd>
                  <dd class="text-xs text-blue-100">2008 - 2025</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Selector de Tabla Mejorado -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">Explorador de Datos SESAL</h3>
              <p class="text-sm text-gray-600 mt-1">Selecciona el año y tipo de datos que deseas analizar</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Selector de Año -->
            <div class="space-y-3">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Año de Datos
              </label>
              <div class="relative">
                <select
                  v-model="selectedTableYear"
                  @change="updateTableSelection"
                  class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 appearance-none"
                >
                  <option value="">🗓️ Seleccionar año...</option>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }} - {{ getTableDescription(year) }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Selector de Tipo -->
            <div class="space-y-3">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2" />
                </svg>
                Tipo de Datos
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="selectedTableType = 'basic'; updateTableSelection()"
                  :class="[
                    'p-4 rounded-lg border-2 text-left transition-all duration-200',
                    selectedTableType === 'basic' 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                  ]"
                >
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-lg">📊</span>
                    <span class="font-medium">Básicos</span>
                  </div>
                  <p class="text-xs text-gray-600">Datos resumidos por mes</p>
                </button>
                
                <button
                  @click="selectedTableType = 'detail'; updateTableSelection()"
                  :class="[
                    'p-4 rounded-lg border-2 text-left transition-all duration-200',
                    selectedTableType === 'detail' 
                      ? 'border-purple-500 bg-purple-50 text-purple-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25'
                  ]"
                >
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-lg">📋</span>
                    <span class="font-medium">Detallados</span>
                  </div>
                  <p class="text-xs text-gray-600">Datos completos con personal</p>
                </button>
              </div>
            </div>
          </div>

          <!-- Información de la tabla seleccionada -->
          <div v-if="selectedTableName" class="mt-6 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Tabla seleccionada: <strong>{{ selectedTableName }}</strong>
                </p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ selectedTableType === 'basic' ? '📊 Datos resumidos' : '📋 Datos detallados' }} • 
                  Año {{ selectedTableYear }} • 
                  Límite: 15 registros
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Datos con Filtros -->
        <FilterableTable
          v-if="selectedTableName"
          :title="'Datos SESAL ' + selectedTableYear + ' - ' + (selectedTableType === 'basic' ? 'Resumen' : 'Detallados') + ' - Con Filtros'"
          :table-name="selectedTableName"
          :auto-load="true"
        />

        <!-- Gráfico de Registros por Mes con Filtros -->
        <div v-if="!hideCharts" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900">Tendencia de Registros por Mes</h3>
            <div class="flex items-center space-x-3">
              <!-- Filtro de Año -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Año:</label>
                <select
                  v-model="chartFilters.year"
                  @change="updateChartData"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
              
              <!-- Filtro de Tipo de Datos -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Tipo:</label>
                <select
                  v-model="chartFilters.type"
                  @change="updateChartData"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Básicos</option>
                  <option value="detail">Detallados</option>
                </select>
              </div>
              
              <!-- Filtro de Servicio -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Servicio:</label>
                <select
                  v-model="chartFilters.service"
                  @change="updateChartData"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Servicio 1</option>
                  <option value="2">Servicio 2</option>
                  <option value="3">Servicio 3</option>
                </select>
              </div>
              
              <!-- Botón de Actualizar -->
              <button
                @click="updateChartData"
                class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
          
          <div class="h-64">
            <ChartComponent :chart="monthlyChart" />
          </div>
          
          <!-- Información del gráfico -->
          <div class="mt-4 text-sm text-gray-600">
            <p>📊 Mostrando datos de <strong>{{ chartFilters.year || 'todos los años' }}</strong> - 
               Tipo: <strong>{{ chartFilters.type === 'basic' ? 'Básicos' : 'Detallados' }}</strong>
               <span v-if="chartFilters.service">- Servicio: <strong>{{ chartFilters.service }}</strong></span>
            </p>
          </div>
        </div>

        <!-- Comparación por Años -->
        <div v-if="!hideCharts" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Comparación de Registros por Año (2020-2024)</h3>
          <div class="h-80">
            <ChartComponent :chart="yearlyChart" />
          </div>
        </div>

        <!-- Resumen de Volumen de Datos -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Volumen de Datos por Categoría</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Datos Mensuales -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Datos Mensuales Básicos
              </h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total registros (2008-2025):</span>
                  <span class="font-semibold text-gray-900">{{ formatNumber(totalBasicRecords) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Promedio por año:</span>
                  <span class="font-semibold text-gray-900">{{ formatNumber(Math.round(totalBasicRecords / 18)) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Tablas disponibles:</span>
                  <span class="font-semibold text-gray-900">18 tablas</span>
                </div>
              </div>
            </div>

            <!-- Datos Detallados -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                Datos Mensuales Detallados
              </h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total registros (2008-2025):</span>
                  <span class="font-semibold text-gray-900">{{ formatNumber(totalSystemRecords) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Promedio por año:</span>
                  <span class="font-semibold text-gray-900">{{ formatNumber(Math.round(totalSystemRecords / 17)) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Tablas disponibles:</span>
                  <span class="font-semibold text-gray-900">17 tablas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Catálogos -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Catálogos del Sistema</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="catalog in catalogData" :key="catalog.name" class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">{{ catalog.name }}</h4>
              <p class="text-sm text-gray-600 mb-2">{{ catalog.description }}</p>
              <div class="text-lg font-bold text-blue-600">{{ catalog.count }} registros</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Embed Modal -->
  <div v-if="showEmbedModal" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay de fondo -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showEmbedModal = false"></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-7xl bg-white rounded-lg shadow-xl">
        <!-- Header del modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">Compartir Dashboard</h3>
              <p class="text-sm text-gray-500 mt-1">Genera código para integrar este dashboard en cualquier sitio web</p>
            </div>
          </div>
          <button
            @click="showEmbedModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenido del modal -->
        <div class="p-8">
          <!-- Información principal -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Compartible</h3>
            <p class="text-gray-600 max-w-md mx-auto">
              Comparte este link para que otros puedan ver el dashboard completo del Sistema ATA
            </p>
          </div>

          <!-- Link directo -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-dashed border-blue-200">
            <div class="text-center">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span class="text-lg font-semibold text-gray-900">Link Directo del Dashboard</span>
              </div>

              <!-- URL del dashboard -->
              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                <p class="text-sm text-gray-600 mb-2">URL para compartir:</p>
                <div class="flex items-center space-x-3">
                  <input
                    :value="embedCode.url"
                    readonly
                    class="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <button
                    @click="copyToClipboard(embedCode.url)"
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copiar</span>
                  </button>
                </div>
              </div>

              <!-- Información adicional -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="bg-white rounded-lg p-3 border border-gray-100">
                  <div class="text-2xl mb-1">📊</div>
                  <div class="text-sm font-medium text-gray-900">Dashboard Completo</div>
                  <div class="text-xs text-gray-600">Métricas + Gráficos</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-100">
                  <div class="text-2xl mb-1">🔄</div>
                  <div class="text-sm font-medium text-gray-900">Datos Actualizados</div>
                  <div class="text-xs text-gray-600">En tiempo real</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-100">
                  <div class="text-2xl mb-1">📱</div>
                  <div class="text-sm font-medium text-gray-900">Responsive</div>
                  <div class="text-xs text-gray-600">Móvil y Desktop</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información de uso -->
          <div class="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Cómo usar:</h4>
            <div class="space-y-2 text-sm text-gray-700">
              <div class="flex items-start space-x-3">
                <span class="text-blue-600 font-bold">1.</span>
                <span>Copia el link de arriba y compártelo</span>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-blue-600 font-bold">2.</span>
                <span>El dashboard se abrirá automáticamente con todos los datos</span>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-blue-600 font-bold">3.</span>
                <span>No requiere configuración adicional</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="flex items-center justify-center space-x-4 px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            @click="showEmbedModal = false"
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cerrar
          </button>
          <button
            @click="copyToClipboard(embedCode.url)"
            class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copiar Link y Compartir</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import ChartComponent from '../components/ChartComponent.vue';
import FilterableTable from '../components/FilterableTable.vue';

// Props para modo embed
interface Props {
  isEmbed?: boolean;
  hideHeader?: boolean;
  hideMetrics?: boolean;
  hideCharts?: boolean;
  hideFooter?: boolean;
}

defineProps<Props>();





// Embed modal state
const showEmbedModal = ref(false);

// Datos reales del sistema SESAL (desde API)
const totalRecords2024 = ref(0);
const totalDetailRecords2024 = ref(0);
const totalSystemRecords = ref(0);
const totalBasicRecords = ref(0);
const loading = ref(false);
const dashboardMetrics = ref(null);

// Filtros para el gráfico de tendencias
const chartFilters = ref({
  year: 2024,
  type: 'basic',
  service: ''
});

// Datos para catálogos (cargados dinámicamente)
const catalogData = ref<any[]>([]);

// Estado para selección de tabla
const selectedTableYear = ref('');
const selectedTableType = ref('basic');
const selectedTableName = ref('');

// Años disponibles para las tablas
const availableYears = ref(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008']);

// Métodos para manejo de tablas
const updateTableSelection = () => {
  if (selectedTableYear.value && selectedTableType.value) {
    if (selectedTableType.value === 'basic') {
      selectedTableName.value = `AT2_BDT_MENSUAL_${selectedTableYear.value}`;
    } else {
      selectedTableName.value = `AT2_BDT_MENSUAL_DETALLE_${selectedTableYear.value}`;
    }
    console.log('Tabla seleccionada:', selectedTableName.value);
  } else {
    selectedTableName.value = '';
  }
};

const getTableDescription = (year: string) => {
  const currentYear = new Date().getFullYear();
  if (year === currentYear.toString()) {
    return 'Año actual';
  } else if (year === (currentYear - 1).toString()) {
    return 'Año anterior';
  } else {
    return 'Año histórico';
  }
};

// Datos del gráfico mensual (cargados dinámicamente)
const monthlyChartData = ref([1500, 1600, 1400, 1700, 1800, 1600, 1900, 1750, 1650, 1850, 1700, 1600]);

// Gráfico mensual
const monthlyChart = computed(() => ({
  id: `monthly-${chartFilters.value.year}`,
  title: `Registros Mensuales ${chartFilters.value.year}`,
  type: 'bar' as const,
  data: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: `Registros ${chartFilters.value.type === 'basic' ? 'Básicos' : 'Detallados'}`,
      data: monthlyChartData.value,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
}));

// Función para actualizar los datos del gráfico según los filtros
const updateChartData = async () => {
  try {
    console.log('🔄 Actualizando gráfico con filtros:', chartFilters.value);
    loading.value = true;
    
    // Cargar datos reales del backend
    const response = await fetch(`http://localhost:3001/api/dashboard/monthly-data/${chartFilters.value.year}/${chartFilters.value.type}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Extraer datos mensuales y convertir a array de 12 elementos
      const monthlyData = result.data.monthlyData || [];
      monthlyChartData.value = monthlyData.map((item: any) => item.records || 0);
      
      console.log('✅ Datos del gráfico actualizados:', {
        year: result.data.year,
        type: result.data.type,
        totalRecords: result.data.totalRecords,
        monthlyData: monthlyChartData.value
      });
    } else {
      console.error('❌ Error en respuesta:', result.message);
      // En caso de error, usar datos por defecto
      monthlyChartData.value = [1500, 1600, 1400, 1700, 1800, 1600, 1900, 1750, 1650, 1850, 1700, 1600];
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar datos del gráfico:', error);
    // En caso de error, usar datos por defecto
    monthlyChartData.value = [1500, 1600, 1400, 1700, 1800, 1600, 1900, 1750, 1650, 1850, 1700, 1600];
  } finally {
    loading.value = false;
  }
};

// Datos del gráfico anual (cargados dinámicamente)
const yearlyChartData = ref({
  labels: ['2020', '2021', '2022', '2023', '2024'],
  data: [145000, 168000, 189000, 203000, 225000]
});

// Gráfico anual
const yearlyChart = computed(() => ({
  id: 'yearly-comparison',
  title: 'Comparación Anual',
  type: 'line' as const,
  data: {
    labels: yearlyChartData.value.labels,
    datasets: [{
      label: 'Total Registros',
      data: yearlyChartData.value.data,
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: false }
    }
  }
}));

// URL directa del dashboard completo
const embedCode = computed(() => {
  const baseUrl = window.location.origin;
  // Link directo al dashboard sin parámetros complejos
  return {
    url: `${baseUrl}/#/dashboard`
  };
});

// Funciones de utilidad
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-ES').format(num);
};



// Función para copiar el link al portapapeles
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Mostrar notificación de éxito
    showNotification('✅ Link copiado al portapapeles', 'success');
  } catch (err) {
    console.error('Error al copiar:', err);
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('✅ Link copiado al portapapeles', 'success');
  }
};

// Función para mostrar notificaciones
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  const notification = document.createElement('div');
  notification.innerHTML = message;
  notification.className = `fixed top-4 right-4 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
  document.body.appendChild(notification);

  // Animación de entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Animación de salida
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// Funciones para cargar datos del dashboard
const loadDashboardMetrics = async () => {
  try {
    console.log('📊 Cargando métricas del dashboard...');
    loading.value = true;
    
    // Usar quick-stats para carga rápida
    const response = await fetch('http://localhost:3001/api/dashboard/quick-stats');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      const metrics = result.data;
      dashboardMetrics.value = metrics;
      
      // Actualizar variables reactivas
      totalSystemRecords.value = metrics.totalSystemRecords || 0;
      totalBasicRecords.value = metrics.totalBasicRecords || 0;
      totalDetailRecords2024.value = metrics.currentYearDetail || 0;
      totalRecords2024.value = metrics.currentYearBasic || 0;
      
      // Actualizar años disponibles
      availableYears.value = metrics.availableYears || [];
      
      console.log('✅ Métricas del dashboard cargadas:', {
        total: totalSystemRecords.value,
        basic: totalBasicRecords.value,
        currentYearDetail: totalDetailRecords2024.value,
        currentYearBasic: totalRecords2024.value,
        availableYears: availableYears.value.length
      });
    } else {
      console.error('❌ Error en respuesta de métricas:', result.message);
    }
  } catch (error) {
    console.error('❌ Error al cargar métricas del dashboard:', error);
  } finally {
    loading.value = false;
  }
};

const loadYearlyComparison = async () => {
  try {
    console.log('📈 Cargando comparación anual...');
    
    const response = await fetch('http://localhost:3001/api/dashboard/yearly-comparison?startYear=2020&endYear=2024&type=basic');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      const yearlyData = result.data.yearlyData || [];
      yearlyChartData.value = {
        labels: yearlyData.map((item: any) => item.year),
        data: yearlyData.map((item: any) => item.records)
      };
      
      console.log('✅ Comparación anual cargada:', yearlyChartData.value);
    } else {
      console.error('❌ Error en respuesta de comparación anual:', result.message);
      // En caso de error, usar datos por defecto
      yearlyChartData.value = {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        data: [145000, 168000, 189000, 203000, 225000]
      };
    }
  } catch (error) {
    console.error('❌ Error al cargar comparación anual:', error);
    // En caso de error, usar datos por defecto
    yearlyChartData.value = {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [145000, 168000, 189000, 203000, 225000]
    };
  }
};

const loadCatalogData = async () => {
  try {
    console.log('📚 Cargando datos de catálogos...');
    
    const response = await fetch('http://localhost:3001/api/dashboard/catalogs');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      catalogData.value = result.data || [];
      console.log('✅ Datos de catálogos cargados:', catalogData.value.length, 'catálogos');
    } else {
      console.error('❌ Error en respuesta de catálogos:', result.message);
    }
  } catch (error) {
    console.error('❌ Error al cargar datos de catálogos:', error);
  }
};

// Inicialización del dashboard
const initializeDashboard = async () => {
  console.log('🚀 Inicializando dashboard con datos reales...');
  
  // Cargar datos en paralelo para mejor rendimiento
  await Promise.all([
    loadDashboardMetrics(),
    loadYearlyComparison(),
    loadCatalogData()
  ]);
  
  // Cargar datos mensuales para el año por defecto
  await updateChartData();
  
  console.log('✅ Dashboard inicializado completamente');
};

onMounted(() => {
  initializeDashboard();
});
</script>