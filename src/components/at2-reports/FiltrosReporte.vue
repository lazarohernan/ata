<template>
  <div class="flex flex-wrap gap-4 items-center justify-between">
    <div class="flex gap-4">
      <select
        :value="añoSeleccionadoLocal"
        @input="actualizarAño"
        class="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="año in añosDisponibles" :key="año" :value="año">{{ año }}</option>
      </select>

      <select
        :value="mesSeleccionadoLocal"
        @input="actualizarMes"
        class="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todo el año</option>
        <option v-for="mes in mesesDisponibles" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
      </select>

      <button
        @click="$emit('actualizar-inmediato')"
        :disabled="cargando"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
      >
        <svg v-if="cargando" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <button
      @click="$emit('limpiar-cache')"
      class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center text-sm"
      title="Limpiar caché del navegador"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
      Limpiar Caché
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  añosDisponibles: number[]
  mesesDisponibles: Array<{ value: string; label: string }>
  añoSeleccionado: string
  mesSeleccionado: string
  cargando?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cargando: false
})

// Emits
const emit = defineEmits<{
  'cambiar-filtros': []
  'actualizar-reportes': []
  'limpiar-cache': []
  'actualizar-inmediato': []
  'update:año-seleccionado': [value: string]
  'update:mes-seleccionado': [value: string]
}>()

// Variables locales para v-model
const añoSeleccionadoLocal = ref(props.añoSeleccionado)
const mesSeleccionadoLocal = ref(props.mesSeleccionado)

// Watchers para sincronizar con props
watch(() => props.añoSeleccionado, (nuevoValor) => {
  añoSeleccionadoLocal.value = nuevoValor
})

watch(() => props.mesSeleccionado, (nuevoValor) => {
  mesSeleccionadoLocal.value = nuevoValor
})

// Funciones de actualización
const actualizarAño = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const nuevoValor = target.value
  añoSeleccionadoLocal.value = nuevoValor
  emit('update:año-seleccionado', nuevoValor)
  emit('cambiar-filtros')
}

const actualizarMes = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const nuevoValor = target.value
  mesSeleccionadoLocal.value = nuevoValor
  emit('update:mes-seleccionado', nuevoValor)
  emit('cambiar-filtros')
}

// Exponer valores para acceso desde el padre
defineExpose({
  añoSeleccionado: () => añoSeleccionadoLocal.value,
  mesSeleccionado: () => mesSeleccionadoLocal.value
})
</script>
