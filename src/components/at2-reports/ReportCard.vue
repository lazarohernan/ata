<template>
  <div class="bg-white rounded-xl p-6 transition-all duration-300">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <div class="w-12 h-12 bg-opacity-100 rounded-full flex items-center justify-center"
           :class="iconBgClass">
        <svg class="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="iconPath" />
        </svg>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="flex flex-col items-center space-y-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-current"
             :class="iconBgClass.replace('bg-', 'border-')"></div>
        <span class="text-xs text-gray-500">{{ loadingText }}</span>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="data && data.length > 0" class="space-y-3">
      <slot name="content" :data="data" :summary="summary">
        <!-- Default content -->
        <div v-for="(item, index) in data.slice(0, maxItems)" :key="itemKey ? item[itemKey] : index"
             class="flex justify-between items-center">
          <span class="text-sm text-gray-600">{{ formatLabel(item) }}:</span>
          <span class="font-semibold" :class="valueColorClass">
            {{ formatValue(item.total_atenciones || item.total || item.count || 0) }}
          </span>
        </div>
      </slot>

      <div class="mt-4">
        <button @click="$emit('show-details', reportType)"
                class="w-full px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
                :class="buttonClass">
          Ver Detalles
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>{{ errorText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  title: string
  reportType: string
  data?: any[]
  summary?: any
  loading?: boolean
  error?: boolean
  maxItems?: number
  itemKey?: string
  loadingText?: string
  errorText?: string
  colorScheme?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo'
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 3,
  loadingText: 'Cargando...',
  errorText: 'Error al cargar datos',
  colorScheme: 'blue'
})

// Emits
const emit = defineEmits<{
  'show-details': [reportType: string]
}>()

// Computed
const iconBgClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-500 text-white'
  }
  return colors[props.colorScheme]
})

const valueColorClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    indigo: 'text-white'
  }
  return colors[props.colorScheme]
})

const iconPath = computed(() => {
  const icons = {
    blue: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    green: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    purple: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    yellow: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    red: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    indigo: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  }
  return icons[props.colorScheme] || icons.blue
})

const buttonClass = computed(() => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600'
  }
  return colors[props.colorScheme]
})

// Functions
const formatValue = (value: number) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-ES').format(value)
}

const formatLabel = (item: any) => {
  return item.recurso || item.grupo_edad || item.tipo_consulta || item.nombre || item.municipio || Object.keys(item)[0]
}
</script>
