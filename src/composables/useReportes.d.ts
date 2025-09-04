import { Ref } from 'vue'

export interface EstadoReporte {
  estado: 'inactivo' | 'cargando' | 'exitoso' | 'error'
  datos: Record<string, unknown>[]
  resumen?: Record<string, unknown>
  tiempoCarga?: number
  desdeCache?: boolean
}

export interface EstadisticasCache {
  hits: number
  misses: number
  size: number
  memoryUsage: number
  hitRate: string
  memoryUsageMB: string
}

export interface EstadosCarga {
  resumenMaestro: boolean
  porRecurso: boolean
  porEdad: boolean
  tiposConsulta: boolean
  geografico: boolean
}

export interface ProgresoCarga {
  total: number
  completados: number
  porcentaje: number
  estado: 'inactivo' | 'cargando' | 'completado'
  tiempoInicio: number
  tiempoEstimado: number
}

export interface MesDisponible {
  value: string
  label: string
}

export interface UseReportesReturn {
  cargando: Ref<boolean>
  estadosCarga: Ref<EstadosCarga>
  progresoCarga: Ref<ProgresoCarga>
  resumenMaestro: Ref<EstadoReporte>
  reporteRecursos: Ref<EstadoReporte>
  reporteEdades: Ref<EstadoReporte>
  reporteConsultas: Ref<EstadoReporte>
  reporteGeografico: Ref<EstadoReporte>
  añoSeleccionado: Ref<string>
  mesSeleccionado: Ref<string>
  añosDisponibles: number[]
  mesesDisponibles: MesDisponible[]
  totalAtenciones: Ref<number>
  textoPeriodo: Ref<string>
  cacheStats: Ref<EstadisticasCache>
  obtenerEstadisticasCache: () => EstadisticasCache
  formatearNúmero: (num: number | string) => string
  cargarTodosReportes: () => Promise<void>
  actualizarFiltros: () => void
  actualizarFiltrosInmediato: () => void
  refrescarReportes: () => void
  limpiarCache: () => void
  obtenerReportePorTipo: (tipo: string) => Ref<EstadoReporte>
  mostrarModalReporte: (tipoReporte: string, datosModal: Ref<EstadoReporte>) => Promise<void>
  cargarReporte: (endpoint: string, referenciaReporte: Ref<EstadoReporte>, opciones?: Record<string, unknown>) => Promise<void>
  cleanup: () => void
}

declare module '../composables/useReportes.js' {
  export function useReportes(): UseReportesReturn
}
