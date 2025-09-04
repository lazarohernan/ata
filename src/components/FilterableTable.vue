<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header con título y acciones -->
    <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12M9 21h6" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
            <p class="text-sm text-gray-500 mt-1">Explora y filtra los datos de manera intuitiva</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="refreshData"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
          <button
            @click="exportData"
            :disabled="filteredData.length === 0"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Panel de Filtros Mejorado -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          <h4 class="text-lg font-medium text-gray-900">Filtros Inteligentes</h4>
          <span class="text-sm text-gray-500">• Filtra datos de manera precisa</span>
        </div>
        <div v-if="hasActiveFilters" class="text-sm text-blue-600 font-medium">
          {{ filteredData.length }} de {{ originalDataLength }} registros
        </div>
      </div>

      <!-- Filtros con diseño mejorado -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por Año -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Año</label>
          <div class="relative">
            <select
              v-model="filters.year"
              @change="applyFilters"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200 appearance-none"
            >
              <option value="">Todos los años</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filtro por Mes -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Mes</label>
          <div class="relative">
            <select
              v-model="filters.month"
              @change="applyFilters"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200 appearance-none"
            >
              <option value="">Todos los meses</option>
              <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filtro por Servicio -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
          <div class="relative">
            <select
              v-model="filters.service"
              @change="applyFilters"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200 appearance-none"
            >
              <option value="">Todos los servicios</option>
              <option v-for="service in availableServices" :key="service" :value="service">
                Servicio {{ service }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Búsqueda general -->
        <div class="relative">
          <label class="flex items-center text-sm font-medium text-gray-700 mb-2">
            <svg class="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Búsqueda
          </label>
          <div class="relative">
            <input
              v-model="filters.search"
              @input="applyFilters"
              type="text"
              placeholder="🔍 Buscar en todos los campos..."
              class="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200"
            />
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros Activos - Diseño mejorado -->
      <div v-if="hasActiveFilters" class="mt-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span class="text-sm font-medium text-gray-700">Filtros Aplicados:</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="filters.year" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ filters.year }}
                <button @click="clearFilter('year')" class="ml-2 text-blue-600 hover:text-blue-800 font-bold">×</button>
              </span>
              <span v-if="filters.month" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V3m0 2v2" />
                </svg>
                {{ getMonthName(filters.month) }}
                <button @click="clearFilter('month')" class="ml-2 text-green-600 hover:text-green-800 font-bold">×</button>
              </span>
              <span v-if="filters.service" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Servicio {{ filters.service }}
                <button @click="clearFilter('service')" class="ml-2 text-purple-600 hover:text-purple-800 font-bold">×</button>
              </span>
              <span v-if="filters.search" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                "{{ filters.search }}"
                <button @click="clearFilter('search')" class="ml-2 text-orange-600 hover:text-orange-800 font-bold">×</button>
              </span>
            </div>
          </div>
          <button
            @click="clearAllFilters"
            class="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar Todo
          </button>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div v-if="!loading && filteredData.length > 0" class="mt-3 flex items-center justify-between text-sm">
        <div class="flex items-center space-x-4 text-gray-600">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <strong>{{ filteredData.length }}</strong> registros encontrados
          </span>
          <span v-if="hasActiveFilters" class="flex items-center text-blue-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filtros activos
          </span>
        </div>
      </div>
    </div>

    <!-- Tabla de datos con diseño mejorado -->
    <div class="overflow-x-auto bg-white">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-600 font-medium">Cargando datos...</span>
        </div>
      </div>

      <!-- Tabla principal -->
      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th
              v-for="column in (columns && columns.length > 0 ? columns : tableColumns)"
              :key="column.key"
              class="group px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
              @click="sortBy(column.key)"
            >
              <div class="flex items-center justify-between">
                <span>{{ column.label }}</span>
                <div class="flex items-center space-x-1">
                  <svg 
                    v-if="sortColumn === column.key" 
                    class="w-4 h-4 text-blue-600 transition-transform duration-200"
                    :class="{ 'rotate-180': sortDirection === 'desc' }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <svg 
                    v-else 
                    class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors duration-200" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-50">
          <tr 
            v-for="(row, index) in paginatedData" 
            :key="row.id || Math.random()" 
            class="hover:bg-blue-50 transition-colors duration-150"
            :class="{ 'bg-gray-25': index % 2 === 1 }"
          >
            <td
              v-for="column in (columns && columns.length > 0 ? columns : tableColumns)"
              :key="column.key"
              class="px-6 py-4 text-sm text-gray-900"
            >
              <span v-if="column.key === 'N_MES'" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-700">
                {{ getMonthName(row[column.key]) }}
              </span>
              <span v-else-if="column.key === 'C_SERVICIO'" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-purple-700">
                Servicio {{ row[column.key] }}
              </span>
              <span v-else-if="column.key === 'N_ANIO'" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-blue-700">
                {{ row[column.key] }}
              </span>
              <span v-else-if="column.key === 'V_US' || column.key === 'V_FORMULARIO'" class="font-mono text-right px-2 py-1 rounded text-gray-700">
                {{ formatNumber(row[column.key]) }}
              </span>
              <span v-else class="text-gray-900">
                {{ row[column.key] || '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Estado sin datos -->
      <div v-if="!loading && filteredData.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
        <p class="mt-1 text-sm text-gray-500">No se encontraron registros con los filtros aplicados.</p>
        <div class="mt-4">
          <button
            @click="clearAllFilters"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>


    <!-- Footer con paginación mejorada -->
    <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-700 flex items-center space-x-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>
              Mostrando <strong>{{ startRecord }}</strong> a <strong>{{ endRecord }}</strong> de <strong>{{ filteredData.length }}</strong> registros
              <span v-if="originalDataLength > filteredData.length" class="text-blue-600 ml-2">
                (de {{ formatNumber(originalDataLength) }} total disponibles)
              </span>
            </span>
          </div>
          <div v-if="hasActiveFilters" class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            📊 Filtrados de {{ formatNumber(originalDataLength) }}
          </div>
          <div v-if="originalDataLength > filteredData.length && !hasActiveFilters" class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            📊 {{ formatNumber(originalDataLength - filteredData.length) }} registros más disponibles
          </div>
          
          <!-- Selector de página rápida -->
          <div v-if="totalPages > 10" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">Ir a página:</span>
            <input
              v-model.number="quickPageInput"
              @keyup.enter="goToQuickPage"
              type="number"
              min="1"
              :max="totalPages"
              class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Página"
            />
            <button
              @click="goToQuickPage"
              class="px-3 py-1 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              Ir
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Botón Primera Página -->
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Ir a la primera página"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <!-- Botón Anterior -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Página anterior"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <!-- Números de Página -->
          <div class="flex items-center space-x-1">
            <div v-if="loading" class="px-3 py-2 text-sm text-blue-600">
              <svg class="animate-spin h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </div>
            <template v-else v-for="page in visiblePages" :key="page">
              <button
                v-if="page === '...'"
                disabled
                class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-default"
              >
                ...
              </button>
              <button
                v-else
                @click="goToPage(Number(page))"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200',
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                ]"
                :title="`Ir a la página ${page}`"
              >
                {{ page }}
              </button>
            </template>
          </div>
          
          <!-- Botón Siguiente -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Página siguiente"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Botón Última Página -->
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Ir a la última página"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface Props {
  title: string;
  tableName: string;
  columns?: Column[]; // Ahora es opcional
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
});

// Estado reactivo
const data = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const rowsPerPage = 15;
const sortColumn = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const originalDataLength = ref(0);
const quickPageInput = ref<number | null>(null);

// Columnas de la tabla - se generan dinámicamente
const tableColumns = ref<Column[]>([]);

// Filtros
const filters = ref({
  year: '',
  month: '',
  service: '',
  search: ''
});

// Opciones para filtros - Generar dinámicamente desde los datos
const availableYears = ref<string[]>([]);
const availableMonths = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];
const availableServices = ref<string[]>([]);

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.year || filters.value.month || filters.value.service || filters.value.search;
});

const totalPages = computed(() => {
  // Siempre usar el total real de registros disponibles para la paginación
  return Math.ceil(originalDataLength.value / rowsPerPage);
});

// Páginas visibles para la paginación (máximo 7 páginas visibles)
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages: (number | string)[] = [];
  
  if (total <= 7) {
    // Si hay 7 o menos páginas, mostrar todas
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Si hay más de 7 páginas, mostrar páginas inteligentes
    if (current <= 4) {
      // Cerca del inicio
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      // Cerca del final
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // En el medio
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages;
});

const startRecord = computed(() => {
  return ((currentPage.value - 1) * rowsPerPage) + 1;
});

const endRecord = computed(() => {
  return Math.min(currentPage.value * rowsPerPage, filteredData.value.length);
});

const paginatedData = computed(() => {
  // Siempre mostrar los datos cargados (la paginación se maneja en el backend)
  return filteredData.value;
});

// Métodos
const loadData = async (filtersApplied = false) => {
  if (!props.tableName) return;

  loading.value = true;
  try {
    // Construir URL con filtros si se están aplicando
    let url = `http://localhost:3001/api/tables/${props.tableName}/data?limit=${rowsPerPage}&offset=${(currentPage.value - 1) * rowsPerPage}`;

    if (filtersApplied) {
      if (filters.value.year) url += `&year=${filters.value.year}`;
      if (filters.value.month) url += `&month=${filters.value.month}`;
      if (filters.value.service) url += `&service=${filters.value.service}`;
      if (filters.value.search) url += `&search=${encodeURIComponent(filters.value.search)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar datos');

    const result = await response.json();
    data.value = result.data || [];
    filteredData.value = result.data || [];
    originalDataLength.value = result.pagination?.total || 0;

    console.log(`Datos cargados para ${props.tableName}:`, data.value.length, 'registros de', originalDataLength.value, 'total');

    // Cargar opciones de filtros desde el servidor
    await loadFilterOptions();

    // Generar columnas dinámicamente
    if (!props.columns || props.columns.length === 0) {
      generateDynamicColumns();
    }

  } catch (err) {
    console.error('Error loading data:', err);
    data.value = [];
    filteredData.value = [];
  } finally {
    loading.value = false;
  }
};

// Cargar opciones de filtros desde el servidor
const loadFilterOptions = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/tables/${props.tableName}/filter-options`);
    if (!response.ok) throw new Error('Error al cargar opciones de filtros');

    const result = await response.json();
    if (result.status === 'success') {
      availableYears.value = result.data.years || [];
      availableServices.value = result.data.services || [];
      console.log('Opciones de filtros cargadas desde servidor:', result.data);
    }
  } catch (err) {
    console.error('Error loading filter options:', err);
  }
};

const applyFilters = () => {
  // Resetear a la primera página cuando se aplican filtros
  currentPage.value = 1;
  
  // Cargar datos con filtros aplicados desde el servidor
  loadData(true);
};

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  applyFilters();
};

const clearFilter = (filterType: 'year' | 'month' | 'service' | 'search') => {
  filters.value[filterType] = '';
  applyFilters();
};

const clearAllFilters = () => {
  filters.value = { year: '', month: '', service: '', search: '' };
  sortColumn.value = '';
  applyFilters();
};

const refreshData = () => {
  loadData(false);
};

// Función para navegar a una página específica
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    console.log(`Navegando a la página ${page}`);
    // Recargar datos para la nueva página
    loadData(true);
  }
};

// Función para navegar rápidamente a una página específica
const goToQuickPage = () => {
  if (quickPageInput.value && quickPageInput.value >= 1 && quickPageInput.value <= totalPages.value) {
    goToPage(quickPageInput.value);
    quickPageInput.value = null; // Limpiar input después de navegar
    console.log(`Navegación rápida a la página ${quickPageInput.value}`);
  }
};





const generateDynamicColumns = () => {
  if (!data.value || !Array.isArray(data.value) || data.value.length === 0) return;

  // Obtener todas las columnas únicas de los datos
  const allColumns = new Set<string>();
  data.value.forEach(row => {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach(key => allColumns.add(key));
    }
  });

  // Convertir a array y crear objetos Column
  const columnsArray = Array.from(allColumns).map(key => ({
    key,
    label: getColumnLabel(key),
    sortable: true
  }));

  // Ordenar columnas por importancia
  columnsArray.sort((a, b) => getColumnPriority(a.key) - getColumnPriority(b.key));

  tableColumns.value = columnsArray;

  console.log('Columnas generadas dinámicamente:', tableColumns.value);
};

const getColumnLabel = (key: string): string => {
  const labels: Record<string, string> = {
    'C_US': 'Código Usuario',
    'N_ANIO': 'Año',
    'N_MES': 'Mes',
    'C_SERVICIO': 'Servicio',
    'V_US': 'Valor',
    'C_CONCEPTO': 'Concepto',
    'V_FORMULARIO': 'Valor Formulario',
    'Q_AT_ENFERMERA_AUX': 'Cant. Enfermera Auxiliar',
    'Q_AT_ENFERMERA_PRO': 'Cant. Enfermera Profesional',
    'Q_AT_MEDICO_GEN': 'Cant. Médico General',
    'Q_AT_MEDICO_ESP': 'Cant. Médico Especialista',
    'N_EDAD': 'Edad',
    'C_EDAD': 'Código Edad',
    'GRUPO_EDAD_Quinquenal': 'Grupo Edad Quinquenal',
    'GRUPO_EDAD_SIDA_COMISCA': 'Grupo Edad SIDA COMISCA',
    'GRUPO_EDAD_ESTADISTICA': 'Grupo Edad Estadística'
  };
  
  return labels[key] || key;
};

const getColumnPriority = (key: string): number => {
  const priorities: Record<string, number> = {
    'C_US': 1,
    'N_ANIO': 2,
    'N_MES': 3,
    'C_SERVICIO': 4,
    'V_US': 5,
    'C_CONCEPTO': 6,
    'V_FORMULARIO': 7,
    'Q_AT_ENFERMERA_AUX': 8,
    'Q_AT_ENFERMERA_PRO': 9,
    'Q_AT_MEDICO_GEN': 10,
    'Q_AT_MEDICO_ESP': 11
  };
  
  return priorities[key] || 999; // Prioridad baja para columnas desconocidas
};

const exportData = () => {
  if (filteredData.value.length === 0) return;

  // Usar columnas dinámicas si no hay columnas proporcionadas
  const columnsToUse = props.columns && props.columns.length > 0 ? props.columns : tableColumns.value;
  
  if (columnsToUse.length === 0) return;

  const headers = columnsToUse.map(col => col.label);
  const csvContent = [
    headers.join(','),
    ...filteredData.value.map(row =>
      columnsToUse.map(col => `"${row[col.key] || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${props.tableName}_filtered_export.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getMonthName = (month: string | number) => {
  const months: Record<string, string> = {
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  return months[String(month)] || month;
};



const formatNumber = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString('es-ES');
};

// Inicialización
onMounted(() => {
  if (props.autoLoad) {
    loadData();
  }
});

// Watch para cambios en la tabla
watch(() => props.tableName, () => {
  if (props.tableName && props.autoLoad) {
    loadData();
  }
});
</script>
