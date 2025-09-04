<template>
  <div v-if="progreso.estado !== 'inactivo'" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay de fondo -->
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Header del modal -->
      <div class="bg-gradient-to-r from-sky-400 to-sky-600 px-6 py-4 text-white">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ progreso.estado === 'completado' ? '¡Carga Completada!' : 'Cargando Reportes' }}
          </h3>
          <button
            @click="cerrarModal"
            class="p-1 hover:bg-white/20 rounded-full transition-colors"
            :title="progreso.estado === 'completado' ? 'Cerrar' : 'Cerrar y continuar en segundo plano'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del modal -->
      <div class="px-6 py-6">
        <!-- Icono y estado principal -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 mb-4">
            <div class="w-8 h-8 text-sky-600">
              <svg v-if="progreso.estado === 'cargando'" class="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <svg v-else class="text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ progreso.estado === 'completado' ? '¡Carga completada!' : 'Cargando reportes...' }}
          </h3>
          <p class="text-gray-600">
            {{ progreso.completados }} de {{ progreso.total }} reportes
          </p>
        </div>

        <!-- Porcentaje y tiempo estimado -->
        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-sky-600 mb-2">{{ progreso.porcentaje }}%</div>
          <div v-if="progreso.tiempoEstimado > 0 && progreso.estado === 'cargando'" class="text-sm text-gray-500">
            Tiempo estimado: ~{{ Math.ceil(progreso.tiempoEstimado / 1000) }} segundos
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-6">
          <div class="relative">
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                class="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                :style="{ width: progreso.porcentaje + '%' }"
              >
                <!-- Animación de pulso durante carga -->
                <div
                  v-if="progreso.estado === 'cargando'"
                  class="h-full bg-gradient-to-r from-sky-300 to-sky-500 rounded-full animate-pulse"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicadores de progreso por reporte -->
        <div class="mb-6">
          <div class="flex justify-center space-x-1">
            <div
              v-for="i in progreso.total"
              :key="i"
              class="w-2 h-2 rounded-full transition-all duration-500"
              :class="getEstadoClase(i)"
            ></div>
          </div>
        </div>

        <!-- Indicador de carga en segundo plano (solo dentro del modal) -->
        <div v-if="mostrandoCargaSegundoPlano && progreso.estado === 'cargando'" class="text-center mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-center justify-center space-x-2 text-amber-800">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span class="text-sm font-medium">Cargando en segundo plano...</span>
          </div>
          <p class="text-xs text-amber-600 mt-1">
            Puede continuar usando la aplicación mientras se completan los reportes
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="text-center space-y-3">
          <button
            @click="cerrarModal"
            class="w-full px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium shadow-sm"
          >
            {{ progreso.estado === 'completado' ? 'Continuar' : 'Cerrar y continuar en segundo plano' }}
          </button>

          <div v-if="progreso.estado === 'cargando'" class="text-xs text-gray-500">
            💡 Los datos continuarán cargándose en segundo plano
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
  cerrarSegundoPlano: []
}>()

// Estado para controlar el indicador de carga en segundo plano
const mostrandoCargaSegundoPlano = ref(false)
const cargaSegundoPlanoActiva = ref(false)

// Función para cerrar el modal
const cerrarModal = () => {
  if (props.progreso.estado === 'cargando') {
    // Si está cargando, mostrar indicador de carga en segundo plano
    cargaSegundoPlanoActiva.value = true
    mostrandoCargaSegundoPlano.value = true

    // Emitir evento para que el padre sepa que se cerró con carga en segundo plano
    emit('cerrarSegundoPlano')

    // Ocultar el indicador después de 3 segundos
    setTimeout(() => {
      mostrandoCargaSegundoPlano.value = false
    }, 3000)
  } else {
    // Si está completado, cerrar normalmente
    emit('cerrar')
  }
}

// Watch para detectar cuando la carga se completa mientras está en segundo plano
watch(() => props.progreso.estado, (nuevoEstado) => {
  if (nuevoEstado === 'completado' && cargaSegundoPlanoActiva.value) {
    cargaSegundoPlanoActiva.value = false
    mostrandoCargaSegundoPlano.value = false
  }
})

const getEstadoClase = (index: number) => {
  const progresoPorItem = 100 / props.progreso.total
  const progresoActual = props.progreso.porcentaje

  if (progresoActual >= (index * progresoPorItem)) {
    if (props.progreso.estado === 'completado') {
      return 'bg-green-400 shadow-sm'
    }
    return 'bg-sky-400 shadow-sm'
  }

  return 'bg-gray-300'
}
</script>
