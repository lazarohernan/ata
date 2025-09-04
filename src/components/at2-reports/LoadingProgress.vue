<template>
  <div v-if="progreso.estado !== 'inactivo'" class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-3">
          <div class="w-5 h-5 text-blue-600">
            <svg v-if="progreso.estado === 'cargando'" class="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900">
              {{ progreso.estado === 'completado' ? 'Carga completada' : 'Cargando reportes...' }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ progreso.completados }} de {{ progreso.total }} reportes
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="text-right">
            <div class="text-lg font-bold text-blue-600">{{ progreso.porcentaje }}%</div>
            <div v-if="progreso.tiempoEstimado > 0" class="text-xs text-gray-500">
              ~{{ Math.ceil(progreso.tiempoEstimado / 1000) }}s restantes
            </div>
          </div>
          <button
            v-if="progreso.estado === 'completado'"
            @click="emit('cerrar')"
            class="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="relative">
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            :style="{ width: progreso.porcentaje + '%' }"
          >
            <!-- Animación de pulso durante carga -->
            <div
              v-if="progreso.estado === 'cargando'"
              class="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"
            ></div>
          </div>
        </div>

        <!-- Indicadores de progreso por reporte -->
        <div class="flex justify-between mt-2">
          <div
            v-for="i in progreso.total"
            :key="i"
            class="flex-1 h-1 mx-0.5 rounded-full transition-all duration-300"
            :class="getEstadoClase(i)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


interface Progreso {
  total: number
  completados: number
  porcentaje: number
  estado: 'inactivo' | 'cargando' | 'completado'
  tiempoInicio: number
  tiempoEstimado: number
}

interface Props {
  progreso: Progreso
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cerrar: []
}>()

const getEstadoClase = (index: number) => {
  const progresoPorItem = 100 / props.progreso.total
  const progresoActual = props.progreso.porcentaje

  if (progresoActual >= (index * progresoPorItem)) {
    if (props.progreso.estado === 'completado') {
      return 'bg-green-500'
    }
    return 'bg-blue-500'
  }

  return 'bg-gray-300'
}
</script>
