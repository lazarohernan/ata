<template>
  <!-- Barra de progreso de carga -->
  <LoadingProgress
    :progreso="progresoCarga"
    @cerrar="cerrarProgreso"
    @cerrar-segundo-plano="activarCargaSegundoPlano"
    @ocultar-modal="ocultarModal"
  />

  <!-- Indicador de carga en segundo plano -->
  <BackgroundLoader
    :visible="mostrarCargaSegundoPlano"
    :total="progresoCarga.total"
    :completados="progresoCarga.completados"
    :porcentaje="progresoCarga.porcentaje"
    :estado="progresoCarga.estado"
    @cerrar="ocultarCargaSegundoPlano"
  />

  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <svg class="w-8 h-8 mr-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Reportes AT2 - Sistema SESAL
            </h1>
            <p class="mt-2 text-lg text-gray-600">Análisis detallado de atenciones médicas por el sistema de salud</p>
          </div>

          <!-- Filtros usando componente optimizado -->
          <FiltrosReporte
            :años-disponibles="añosDisponibles"
            :meses-disponibles="mesesDisponibles"
            v-model:año-seleccionado="añoSeleccionado"
            v-model:mes-seleccionado="mesSeleccionado"
            :cargando="cargando"
            @cambiar-filtros="actualizarFiltros"
            @actualizar-inmediato="actualizarFiltrosInmediato"
            @limpiar-cache="limpiarCache"
          />
        </div>
      </div>

      <!-- Grid de Reportes Optimizada -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

        <!-- Resumen Maestro -->
        <ReportCard
          v-memo="[resumenMaestro.datos, resumenMaestro.resumen, estadosCarga.resumenMaestro, resumenMaestro.estado]"
          title="Resumen Maestro"
          report-type="master-summary"
          :data="resumenMaestro.datos"
          :summary="resumenMaestro.resumen"
          :loading="estadosCarga.resumenMaestro || resumenMaestro.estado === 'cargando'"
          :error="resumenMaestro.estado === 'error' && !estadosCarga.resumenMaestro"
          color-scheme="navy"
          loading-text="Cargando resumen..."
          error-text="Error al cargar resumen"
          @show-details="mostrarModal"
        >
          <template #content="{ summary }">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Conceptos:</span>
              <span class="font-semibold text-sky-600">{{ summary?.total_concepts }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Atenciones:</span>
              <span class="font-semibold text-sky-600">{{ formatearNúmero(summary?.total_atenciones) }}</span>
            </div>
          </template>
        </ReportCard>

        <!-- Por Recurso Médico -->
        <ReportCard
          v-memo="[reporteRecursos.datos, reporteRecursos.resumen, estadosCarga.porRecurso, reporteRecursos.estado]"
          title="Por Recurso Médico"
          report-type="by-resource"
          :data="reporteRecursos.datos"
          :summary="reporteRecursos.resumen"
          :loading="estadosCarga.porRecurso || reporteRecursos.estado === 'cargando'"
          :error="reporteRecursos.estado === 'error' && !estadosCarga.porRecurso"
          color-scheme="institutional-green"
          loading-text="Cargando recursos..."
          error-text="Error al cargar recursos"
          @show-details="mostrarModal"
        />

        <!-- Por Grupos de Edad -->
        <ReportCard
          v-memo="[reporteEdades.datos, reporteEdades.resumen, estadosCarga.porEdad, reporteEdades.estado]"
          title="Por Grupos de Edad"
          report-type="by-age-group"
          :data="reporteEdades.datos"
          :summary="reporteEdades.resumen"
          :loading="estadosCarga.porEdad || reporteEdades.estado === 'cargando'"
          :error="reporteEdades.estado === 'error' && !estadosCarga.porEdad"
          color-scheme="institutional-blue"
          loading-text="Cargando edades..."
          error-text="Error al cargar edades"
          @show-details="mostrarModal"
        />

        <!-- Tipos de Consulta -->
        <ReportCard
          v-memo="[reporteConsultas.datos, reporteConsultas.resumen, estadosCarga.tiposConsulta, reporteConsultas.estado]"
          title="Tipos de Consulta"
          report-type="consultation-types"
          :data="reporteConsultas.datos"
          :summary="reporteConsultas.resumen"
          :loading="estadosCarga.tiposConsulta || reporteConsultas.estado === 'cargando'"
          :error="reporteConsultas.estado === 'error' && !estadosCarga.tiposConsulta"
          color-scheme="yellow"
          loading-text="Cargando consultas..."
          error-text="Error al cargar consultas"
          @show-details="mostrarModal"
        />

        <!-- Distribución Geográfica -->
        <ReportCard
          v-memo="[reporteGeografico.datos, reporteGeografico.resumen, estadosCarga.geografico, reporteGeografico.estado]"
          title="Distribución Geográfica"
          report-type="geographic"
          :data="reporteGeografico.datos"
          :summary="reporteGeografico.resumen"
          :loading="estadosCarga.geografico || reporteGeografico.estado === 'cargando'"
          :error="reporteGeografico.estado === 'error' && !estadosCarga.geografico"
          color-scheme="institutional-green"
          loading-text="Cargando geografía..."
          error-text="Error al cargar geografía"
          @show-details="mostrarModal"
        >
          <template #content="{ summary }">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Municipios:</span>
              <span class="font-semibold text-sky-600">{{ summary?.total_municipios }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Atenciones:</span>
              <span class="font-semibold text-sky-600">{{ formatearNúmero(summary?.total_atenciones) }}</span>
            </div>
          </template>
        </ReportCard>

        <!-- Estadísticas Generales Optimizadas -->
        <div class="bg-gradient-to-r from-sky-400 to-sky-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Estadísticas Generales</h3>
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-90">Total Atenciones:</span>
              <span class="font-bold text-xl">{{ formatearNúmero(totalAtenciones) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-90">Periodo:</span>
              <span class="font-semibold">{{ textoPeriodo }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-90">Profesionales:</span>
              <span class="font-semibold">4 categorías</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Optimizado para Detalles -->
      <ModalReporte
        :mostrar="mostrarModalVisible"
        :título="tituloModal"
        :datos="datosModal"
        @cerrar="cerrarModal"
        @reintentar="reintentarModal"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReportes } from '../composables/useReportes.js'
import ReportCard from '../components/at2-reports/ReportCard.vue'
import FiltrosReporte from '../components/at2-reports/FiltrosReporte.vue'
import ModalReporte from '../components/at2-reports/ModalReporte.vue'
import LoadingProgress from '../components/at2-reports/LoadingProgress.vue'
import BackgroundLoader from '../components/at2-reports/BackgroundLoader.vue'

// Usar el composable optimizado
const {
  cargando,
  estadosCarga,
  progresoCarga,
  resumenMaestro,
  reporteRecursos,
  reporteEdades,
  reporteConsultas,
  reporteGeografico,
  añoSeleccionado,
  mesSeleccionado,
  añosDisponibles,
  mesesDisponibles,
  totalAtenciones,
  textoPeriodo,
  formatearNúmero,
  cargarTodosReportes,
  actualizarFiltros,
  actualizarFiltrosInmediato,

  limpiarCache,
  mostrarModalReporte
} = useReportes()

// Estados del modal
const mostrarModalVisible = ref(false)
const tituloModal = ref('')
const datosModal = ref({
  estado: 'inactivo' as const,
  datos: [] as Record<string, unknown>[],
  resumen: undefined as Record<string, unknown> | undefined,
  tiempoCarga: undefined as number | undefined,
  desdeCache: false
})

// Estados del BackgroundLoader
const mostrarCargaSegundoPlano = ref(false)

// Funciones del modal
const mostrarModal = async (tipoReporte: string) => {
  mostrarModalVisible.value = true

  // Títulos para cada reporte
  const titulos = {
    'master-summary': 'Resumen Maestro AT2',
    'by-resource': 'Atenciones por Recurso Médico',
    'by-age-group': 'Atenciones por Grupos de Edad',
    'consultation-types': 'Tipos de Consulta',
    'geographic': 'Distribución por Municipios'
  }

  tituloModal.value = titulos[tipoReporte as keyof typeof titulos] || 'Detalles del Reporte'

  // Cargar datos usando el composable optimizado
  await mostrarModalReporte(tipoReporte, datosModal)
}

const cerrarModal = () => {
  mostrarModalVisible.value = false
  datosModal.value = {
    estado: 'inactivo',
    datos: [] as Record<string, unknown>[],
    resumen: undefined,
    tiempoCarga: undefined,
    desdeCache: false
  }
}

const reintentarModal = () => {
  // Reintentar cargar el último reporte solicitado
  console.log('🔄 Reintentando carga del modal...')
  // Aquí podríamos implementar lógica para reintentar
}

const cerrarProgreso = () => {
  // Ocultar la barra de progreso
  progresoCarga.value.estado = 'inactivo'
}

// Funciones para BackgroundLoader
const activarCargaSegundoPlano = () => {
  // Activar el indicador de carga en segundo plano
  mostrarCargaSegundoPlano.value = true
  // Mantener el modal cerrado pero permitir que la carga continúe
  progresoCarga.value.estado = 'cargando' // Mantener estado de carga
}

const ocultarCargaSegundoPlano = () => {
  // Ocultar el indicador de carga en segundo plano
  mostrarCargaSegundoPlano.value = false
}

// Función para ocultar el modal
const ocultarModal = () => {
  // Cambiar el estado del progreso a 'inactivo' para ocultar el modal
  progresoCarga.value.estado = 'inactivo'
}

// Inicialización optimizada
onMounted(() => {
  console.log('🚀 Inicializando AT2Reports optimizado...')
  cargarTodosReportes()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
