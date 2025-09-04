<template>
  <div v-if="mostrar" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ título }}</h2>
          <p v-if="datos.resumen?.periodo" class="text-sm text-gray-600 mt-1">
            Período: {{ datos.resumen.periodo }}
          </p>
        </div>
        <button
          @click="emit('cerrar')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="datos.estado === 'cargando'" class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div class="text-center">
              <p class="text-lg font-medium text-gray-700">Cargando datos...</p>
              <p class="text-sm text-gray-500">Esto puede tomar unos momentos</p>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="datos.estado === 'exitoso'">
          <!-- Tabla de datos - Usar virtualización si hay muchos registros -->
          <div v-if="usarTablaVirtual" class="mb-6">
            <TablaVirtual
              :datos="datos.datos"
              :encabezados="encabezadosTabla"
              :altura-viewport="alturaTabla"
            />
          </div>

          <!-- Tabla normal para pocos registros -->
          <div v-else class="overflow-x-auto mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="encabezado in encabezadosTabla" :key="encabezado.clave"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ encabezado.etiqueta }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="fila in datos.datos" :key="generarClaveFila(fila)"
                    class="hover:bg-gray-50">
                  <td v-for="encabezado in encabezadosTabla" :key="encabezado.clave"
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearCeldaTabla(fila[encabezado.clave]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resumen -->
          <div v-if="datos.resumen" class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Resumen Ejecutivo</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(valor, clave) in datos.resumen" :key="clave"
                   class="text-center p-3 bg-white rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ formatearNúmero(valor) }}</div>
                <div class="text-sm text-gray-600">{{ formatearEtiqueta(clave) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p class="text-sm text-gray-500">No se pudieron cargar los detalles del reporte.</p>
          <button
            @click="$emit('reintentar')"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Footer con información de rendimiento -->
      <div v-if="datos.tiempoCarga" class="px-6 py-3 bg-blue-50 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-4">
            <span class="text-blue-700 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Tiempo de carga: {{ datos.tiempoCarga }}ms
            </span>
            <span v-if="datos.desdeCache" class="text-green-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Datos desde caché
            </span>
          </div>
          <span class="text-gray-500">
            {{ datos.datos?.length || 0 }} registros
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TablaVirtual from './TablaVirtual.vue'

export interface DatosModal {
  estado: 'inactivo' | 'cargando' | 'exitoso' | 'error'
  datos: any[]
  resumen?: any
  tiempoCarga?: number
  desdeCache?: boolean
}

interface Props {
  mostrar: boolean
  título: string
  datos: DatosModal
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  cerrar: []
  reintentar: []
}>()

// Computed
const encabezadosTabla = computed(() => {
  if (!props.datos.datos?.length) return []

  const primeraFila = props.datos.datos[0]
  return Object.keys(primeraFila).map(clave => ({
    clave,
    etiqueta: formatearEtiqueta(clave)
  }))
})

const usarTablaVirtual = computed(() => {
  // Usar tabla virtual si hay más de 100 filas
  return (props.datos.datos?.length || 0) > 100
})

const alturaTabla = computed(() => {
  // Altura adaptativa basada en el número de filas
  const numFilas = props.datos.datos?.length || 0
  if (numFilas < 50) return 300
  if (numFilas < 200) return 400
  if (numFilas < 500) return 500
  return 600 // Máximo para tablas muy grandes
})

// Funciones
const formatearNúmero = (num: any) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('es-ES').format(num)
}

const formatearEtiqueta = (clave: string | number) => {
  const claveStr = String(clave)
  return claveStr
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letra => letra.toUpperCase())
}

const formatearCeldaTabla = (valor: any) => {
  if (typeof valor === 'number') {
    return formatearNúmero(valor)
  }
  return valor || '-'
}

const generarClaveFila = (fila: any) => {
  return fila.id || fila[Object.keys(fila)[0]] || Math.random()
}
</script>
