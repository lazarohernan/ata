<template>
  <!-- Indicador de carga en segundo plano -->
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs"
  >
    <div class="flex items-center space-x-3">
      <!-- Spinner -->
      <div class="flex-shrink-0">
        <div class="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>

      <!-- Contenido -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">
          Cargando reportes...
        </p>
        <p class="text-xs text-gray-500">
          {{ completados }} de {{ total }} completados
        </p>
      </div>

      <!-- Botón de cerrar -->
      <button
        @click="cerrar"
        class="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Ocultar indicador"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Barra de progreso -->
    <div class="mt-3">
      <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500 ease-out"
          :style="{ width: porcentaje + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  total: number
  completados: number
  porcentaje: number
  estado: 'inactivo' | 'cargando' | 'completado'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cerrar: []
}>()

const cerrar = () => {
  emit('cerrar')
}

// Auto-ocultar cuando se complete
watch(() => props.estado, (nuevoEstado) => {
  if (nuevoEstado === 'completado') {
    // Esperar 2 segundos antes de ocultar automáticamente
    setTimeout(() => {
      emit('cerrar')
    }, 2000)
  }
})
</script>
