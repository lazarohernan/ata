<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Enhanced Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <svg class="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16" />
              </svg>
              Fuentes de Datos
            </h1>
            <p class="mt-2 text-lg text-gray-600">
              Administra tus conexiones de base de datos y fuentes de datos para tus análisis.
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ dataSources.length }}</div>
              <div class="text-sm text-gray-500">Fuentes Totales</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">{{ connectedCount }}</div>
              <div class="text-sm text-gray-500">Conectadas</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Left side - Search and Filters -->
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Buscar fuentes de datos..."
                class="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              @change="applyFilters"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Todos los estados</option>
              <option value="connected">Conectadas</option>
              <option value="disconnected">Desconectadas</option>
              <option value="testing">En prueba</option>
            </select>

            <!-- Type Filter -->
            <select
              v-model="typeFilter"
              @change="applyFilters"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Todos los tipos</option>
              <option v-for="type in uniqueTypes" :key="type" :value="type">
                {{ getDatabaseTypeLabel(type) }}
              </option>
            </select>
          </div>

          <!-- Right side - View toggle and Add button -->
          <div class="flex items-center space-x-3">
            <!-- View Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            <!-- Add Data Source Button -->
            <button
              @click="openAddModal"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Fuente
            </button>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">Filtros aplicados:</span>
              <div class="flex flex-wrap items-center gap-2">
                <span v-if="searchQuery" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  "{{ searchQuery }}"
                  <button @click="clearSearch" class="ml-2 text-blue-600 hover:text-blue-800 font-bold">×</button>
                </span>
                <span v-if="statusFilter" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  Estado: {{ getStatusLabel(statusFilter) }}
                  <button @click="clearStatusFilter" class="ml-2 text-green-600 hover:text-green-800 font-bold">×</button>
                </span>
                <span v-if="typeFilter" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Tipo: {{ getDatabaseTypeLabel(typeFilter) }}
                  <button @click="clearTypeFilter" class="ml-2 text-purple-600 hover:text-purple-800 font-bold">×</button>
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
      </div>

      <!-- Data Sources Display -->
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="source in filteredDataSources"
          :key="source.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300"
        >
          <!-- Header de la tarjeta -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div class="p-2 rounded-lg" :class="getTypeIcon(source.type).bgColor">
                    <svg class="w-5 h-5" :class="getTypeIcon(source.type).textColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getTypeIcon(source.type).path" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">{{ source.name }}</h3>
                    <p class="text-sm text-gray-500">{{ getDatabaseTypeLabel(source.type) }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    source.status === 'connected'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : source.status === 'testing'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  ]"
                >
                  <svg v-if="source.status === 'connected'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="source.status === 'testing'" class="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {{ getStatusLabel(source.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Connection Details -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Servidor:</span>
              <span class="font-mono text-gray-900">{{ source.host }}:{{ source.port }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Base de datos:</span>
              <span class="font-medium text-gray-900">{{ source.database }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Usuario:</span>
              <span class="text-gray-900">{{ source.username }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">SSL:</span>
              <span :class="source.useSSL ? 'text-green-600' : 'text-gray-500'">
                {{ source.useSSL ? 'Habilitado' : 'Deshabilitado' }}
              </span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">{{ source.poolSize || 5 }}</div>
                <div class="text-gray-500">Pool Size</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">{{ source.timeout || 30 }}s</div>
                <div class="text-gray-500">Timeout</div>
              </div>
            </div>
          </div>

          <!-- Last Updated -->
          <div class="text-xs text-gray-500 mb-4" v-if="source.updatedAt">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Actualizado: {{ formatDate(source.updatedAt) }}
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-wrap gap-2">
            <button
              @click="testConnection(source)"
              :disabled="source.status === 'testing'"
              class="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="source.status === 'testing'" class="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ source.status === 'testing' ? 'Probando...' : 'Probar' }}
            </button>
            <button
              @click="editDataSource(source)"
              class="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              @click="confirmDeleteDataSource(source)"
              class="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    :checked="selectAll"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente de Datos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servidor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="source in filteredDataSources"
                :key="source.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedSources.includes(source.id)"
                    @change="toggleSourceSelection(source.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="p-2 rounded-lg mr-3" :class="getTypeIcon(source.type).bgColor">
                      <svg class="w-4 h-4" :class="getTypeIcon(source.type).textColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getTypeIcon(source.type).path" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ source.name }}</div>
                      <div class="text-sm text-gray-500">{{ source.database }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ getDatabaseTypeLabel(source.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ source.host }}:{{ source.port }}</div>
                  <div class="text-sm text-gray-500">{{ source.username }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      source.status === 'connected'
                        ? 'bg-green-100 text-green-800'
                        : source.status === 'testing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    <svg v-if="source.status === 'connected'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="source.status === 'testing'" class="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ getStatusLabel(source.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ source.updatedAt ? formatDate(source.updatedAt) : 'Nunca' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="testConnection(source)"
                      :disabled="source.status === 'testing'"
                      class="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      @click="editDataSource(source)"
                      class="text-gray-600 hover:text-gray-900 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteDataSource(source)"
                      class="text-red-600 hover:text-red-900 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedSources.length > 0" class="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">
              {{ selectedSources.length }} fuente(s) seleccionada(s)
            </span>
            <div class="flex items-center space-x-2">
              <button
                @click="testSelectedSources"
                class="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Probar Seleccionadas
              </button>
              <button
                @click="deleteSelectedSources"
                class="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar Seleccionadas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="dataSources.length === 0" class="text-center py-12">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16" />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay fuentes de datos</h3>
        <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primera fuente de datos.</p>
        <button
          @click="openAddModal"
          class="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Primera Fuente
        </button>
      </div>
    </div>

    <!-- Modal para agregar/editar fuentes de datos -->
    <DataSourceModal
      :is-visible="showModal"
      :data-source="editingDataSource"
      @close="closeModal"
      @saved="handleDataSourceSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import DataSourceModal from '../components/DataSourceModal.vue';

const dashboardStore = useDashboardStore();
const { dataSources, loadDataSourcesFromStorage } = dashboardStore;

// Estado del modal
const showModal = ref(false);
const editingDataSource = ref<any>(null);

// Estado de la vista
const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const selectedSources = ref<string[]>([]);
const selectAll = ref(false);

// Computed properties
const hasDataSources = computed(() => dataSources.length > 0);
const connectedCount = computed(() => {
  if (!dataSources.value || !Array.isArray(dataSources.value)) {
    return 0;
  }
  return dataSources.value.filter(ds => ds && ds.status === 'connected').length;
});
const hasActiveFilters = computed(() => !!searchQuery.value || !!statusFilter.value || !!typeFilter.value);

const uniqueTypes = computed(() => {
  if (!dataSources.value || !Array.isArray(dataSources.value)) {
    return [];
  }
  const types = [...new Set(dataSources.value.map(ds => ds.type).filter(Boolean))];
  return types;
});

const filteredDataSources = computed(() => {
  if (!dataSources.value || !Array.isArray(dataSources.value)) {
    return [];
  }

  let filtered = [...dataSources.value];

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(source =>
      source &&
      source.name && source.name.toLowerCase().includes(query) ||
      source.database && source.database.toLowerCase().includes(query) ||
      source.host && source.host.toLowerCase().includes(query) ||
      source.username && source.username.toLowerCase().includes(query) ||
      source.type && source.type.toLowerCase().includes(query)
    );
  }

  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(source => source && source.status === statusFilter.value);
  }

  // Filtro por tipo
  if (typeFilter.value) {
    filtered = filtered.filter(source => source && source.type === typeFilter.value);
  }

  return filtered;
});

// Watchers
watch(filteredDataSources, () => {
  // Reset selections when filtered data changes
  selectedSources.value = [];
  selectAll.value = false;
});

// Métodos del modal
const openAddModal = () => {
  editingDataSource.value = null;
  showModal.value = true;
};

const editDataSource = (source: any) => {
  editingDataSource.value = source;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingDataSource.value = null;
};

const handleDataSourceSaved = (dataSource: any) => {
  console.log('Fuente de datos guardada:', dataSource);
  closeModal();
};

// Métodos de filtrado
const applyFilters = () => {
  // Los computed properties se actualizarán automáticamente
};

const clearSearch = () => {
  searchQuery.value = '';
  applyFilters();
};

const clearStatusFilter = () => {
  statusFilter.value = '';
  applyFilters();
};

const clearTypeFilter = () => {
  typeFilter.value = '';
  applyFilters();
};

const clearAllFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
  applyFilters();
};

// Métodos de selección
const toggleSourceSelection = (sourceId: string) => {
  const index = selectedSources.value.indexOf(sourceId);
  if (index > -1) {
    selectedSources.value.splice(index, 1);
  } else {
    selectedSources.value.push(sourceId);
  }
  updateSelectAllState();
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedSources.value = [];
  } else {
    selectedSources.value = filteredDataSources.value.map(ds => ds.id);
  }
  selectAll.value = !selectAll.value;
};

const updateSelectAllState = () => {
  selectAll.value = selectedSources.value.length === filteredDataSources.value.length &&
                   filteredDataSources.value.length > 0;
};

// Métodos de conexión
const testConnection = async (source: any) => {
  try {
    source.status = 'testing';
    const result = await dashboardStore.testConnection(source.id);
    console.log('Connection test result:', result);
  } catch (err) {
    console.error('Connection test failed:', err);
    source.status = 'disconnected';
  }
};

const testSelectedSources = async () => {
  const sourcesToTest = dataSources.value.filter(ds => selectedSources.value.includes(ds.id));
  for (const source of sourcesToTest) {
    await testConnection(source);
  }
};

// Métodos de eliminación
const confirmDeleteDataSource = async (source: any) => {
  if (confirm(`¿Está seguro de que desea eliminar la fuente de datos "${source.name}"?\n\nEsta acción no se puede deshacer.`)) {
    try {
      await dashboardStore.deleteDataSource(source.id);
      console.log('Fuente de datos eliminada:', source.name);
    } catch (error) {
      console.error('Error al eliminar fuente de datos:', error);
      alert('Error al eliminar la fuente de datos. Intenta nuevamente.');
    }
  }
};

const deleteSelectedSources = async () => {
  if (confirm(`¿Está seguro de que desea eliminar ${selectedSources.value.length} fuente(s) de datos?\n\nEsta acción no se puede deshacer.`)) {
    try {
      for (const sourceId of selectedSources.value) {
        await dashboardStore.deleteDataSource(sourceId);
      }
      selectedSources.value = [];
      console.log('Fuentes de datos eliminadas');
    } catch (error) {
      console.error('Error al eliminar fuentes de datos:', error);
      alert('Error al eliminar las fuentes de datos. Intenta nuevamente.');
    }
  }
};

// Utilidades
const getDatabaseTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'sqlite': 'SQLite',
    'sqlserver': 'SQL Server',
    'oracle': 'Oracle'
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'connected': 'Conectado',
    'disconnected': 'Desconectado',
    'testing': 'Probando'
  };
  return labels[status] || status;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, { path: string; bgColor: string; textColor: string }> = {
    'mysql': {
      path: 'M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    'postgresql': {
      path: 'M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    'sqlite': {
      path: 'M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    'sqlserver': {
      path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    'oracle': {
      path: 'M13 10V3L4 14h7v7l9-11h-7z',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  };
  return icons[type] || icons['mysql'];
};

const formatDate = (date: Date | string): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Inicialización
onMounted(() => {
  loadDataSourcesFromStorage();
});
</script>