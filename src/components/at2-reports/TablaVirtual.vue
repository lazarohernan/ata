<template>
  <div class="overflow-x-auto">
    <div class="min-w-full">
      <!-- Header fijo -->
      <div class="bg-gray-50 border-b border-gray-200">
        <div class="flex">
          <div
            v-for="encabezado in encabezados"
            :key="encabezado.clave"
            :class="['px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0', anchoColumna]"
          >
            {{ encabezado.etiqueta }}
          </div>
        </div>
      </div>

      <!-- Contenedor virtual -->
      <div
        ref="viewportRef"
        class="relative overflow-auto"
        :style="{ height: `${alturaViewport}px` }"
        @scroll="manejarScroll"
      >
        <!-- Espaciador superior -->
        <div :style="{ height: `${alturaSuperior}px` }"></div>

        <!-- Filas visibles -->
        <div class="bg-white">
          <div
            v-for="(fila, index) in filasVisibles"
            :key="obtenerClaveFila(fila, index + indiceInicio)"
            class="flex hover:bg-gray-50 border-b border-gray-100"
          >
            <div
              v-for="encabezado in encabezados"
              :key="encabezado.clave"
              :class="['px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 last:border-r-0', anchoColumna]"
            >
              {{ formatearCelda(fila[encabezado.clave]) }}
            </div>
          </div>
        </div>

        <!-- Espaciador inferior -->
        <div :style="{ height: `${alturaInferior}px` }"></div>
      </div>

      <!-- Información de rendimiento -->
      <div class="mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
        <span>Mostrando {{ filasVisibles.length }} de {{ totalFilas }} filas</span>
        <span class="ml-4">Rango: {{ indiceInicio + 1 }}-{{ indiceFin }}</span>
        <span class="ml-4">Memoria: {{ (JSON.stringify(filasVisibles).length / 1024).toFixed(1) }} KB</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  datos: any[]
  encabezados: Array<{ clave: string; etiqueta: string }>
  alturaFila?: number
  alturaViewport?: number
  buffer?: number
}

const props = withDefaults(defineProps<Props>(), {
  alturaFila: 48, // Altura aproximada de cada fila
  alturaViewport: 400, // Altura del viewport
  buffer: 5 // Número de filas extra a renderizar
})

// Estados
const viewportRef = ref<HTMLElement>()
const scrollTop = ref(0)

// Computed
const totalFilas = computed(() => props.datos.length)

const filasTotales = computed(() => Math.ceil(props.alturaViewport / props.alturaFila))

const filasVisibles = computed(() => {
  const inicio = indiceInicio.value
  const fin = Math.min(indiceFin.value, totalFilas.value)
  return props.datos.slice(inicio, fin)
})

const indiceInicio = computed(() => {
  const inicio = Math.floor(scrollTop.value / props.alturaFila)
  return Math.max(0, inicio - props.buffer)
})

const indiceFin = computed(() => {
  const fin = indiceInicio.value + filasTotales.value + (props.buffer * 2)
  return Math.min(totalFilas.value, fin)
})

const alturaSuperior = computed(() => indiceInicio.value * props.alturaFila)

const alturaInferior = computed(() => Math.max(0, (totalFilas.value - indiceFin.value) * props.alturaFila))

const anchoColumna = computed(() => {
  if (props.encabezados.length === 0) return ''
  return `w-${Math.floor(100 / props.encabezados.length)}/${Math.floor(100 / props.encabezados.length)}`
})

// Funciones
const manejarScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

const formatearCelda = (valor: any) => {
  if (typeof valor === 'number') {
    return new Intl.NumberFormat('es-ES').format(valor)
  }
  return valor || '-'
}

const obtenerClaveFila = (fila: any, index: number) => {
  return fila.id || fila[Object.keys(fila)[0]] || `fila-${index}`
}

// Scroll suave a una fila específica
const scrollToRow = (index: number) => {
  const scrollPosition = index * props.alturaFila
  if (viewportRef.value) {
    viewportRef.value.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    })
  }
}

// Scroll al inicio
const scrollToTop = () => {
  scrollToRow(0)
}

// Scroll al final
const scrollToBottom = () => {
  scrollToRow(totalFilas.value - filasTotales.value)
}

// Exponer funciones útiles
defineExpose({
  scrollToRow,
  scrollToTop,
  scrollToBottom,
  totalFilas,
  filasVisibles
})
</script>

<style scoped>
/* Optimizaciones de rendimiento */
.virtual-table {
  contain: layout style paint;
}

.virtual-row {
  will-change: transform;
  contain: layout style paint;
}
</style>





