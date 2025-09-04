import { ref, computed } from 'vue'
import { useDebounce } from './useDebounce'
import { apiService } from '../services/api'

/**
 * @typedef {Object} EstadoReporte
 * @property {'inactivo' | 'cargando' | 'exitoso' | 'error'} estado
 * @property {Array} datos
 * @property {Object} [resumen]
 * @property {number} [tiempoCarga]
 * @property {boolean} [desdeCache]
 */

/**
 * @typedef {Object} EstadisticasCache
 * @property {number} hits
 * @property {number} misses
 * @property {number} size
 * @property {number} memoryUsage
 * @property {string} hitRate
 * @property {string} memoryUsageMB
 */

/**
 * @typedef {Object} EstadosCarga
 * @property {boolean} resumenMaestro
 * @property {boolean} porRecurso
 * @property {boolean} porEdad
 * @property {boolean} tiposConsulta
 * @property {boolean} geografico
 */

/**
 * @typedef {Object} MesDisponible
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} UseReportesReturn
 * @property {import('vue').Ref<boolean>} cargando
 * @property {import('vue').Ref<EstadosCarga>} estadosCarga
 * @property {import('vue').Ref<EstadoReporte>} resumenMaestro
 * @property {import('vue').Ref<EstadoReporte>} reporteRecursos
 * @property {import('vue').Ref<EstadoReporte>} reporteEdades
 * @property {import('vue').Ref<EstadoReporte>} reporteConsultas
 * @property {import('vue').Ref<EstadoReporte>} reporteGeografico
 * @property {import('vue').Ref<string>} añoSeleccionado
 * @property {import('vue').Ref<string>} mesSeleccionado
 * @property {Array<number>} añosDisponibles
 * @property {Array<MesDisponible>} mesesDisponibles
 * @property {import('vue').Ref<number>} totalAtenciones
 * @property {import('vue').Ref<string>} textoPeriodo
 * @property {import('vue').Ref<EstadisticasCache>} cacheStats
 * @property {() => EstadisticasCache} obtenerEstadisticasCache
 * @property {(num: number | string) => string} formatearNúmero
 * @property {() => Promise<void>} cargarTodosReportes
 * @property {() => void} actualizarFiltros
 * @property {() => void} actualizarFiltrosInmediato
 * @property {() => void} refrescarReportes
 * @property {() => void} limpiarCache
 * @property {(tipo: string) => import('vue').Ref<EstadoReporte>} obtenerReportePorTipo
 * @property {(tipoReporte: string, datosModal: import('vue').Ref<EstadoReporte>) => Promise<void>} mostrarModalReporte
 * @property {(endpoint: string, referenciaReporte: import('vue').Ref<EstadoReporte>, opciones?: Object) => Promise<void>} cargarReporte
 * @property {() => void} cleanup
 */

// Configuración del caché optimizada
const DURACION_CACHE = 5 * 60 * 1000 // 5 minutos
const MAX_CACHE_SIZE = 20 // Máximo número de entradas en caché
const cacheReportes = new Map()
const cacheStats = ref({
  hits: 0,
  misses: 0,
  size: 0,
  memoryUsage: 0
})

// Estados globales
const cargando = ref(false)
const estadosCarga = ref({
  resumenMaestro: false,
  porRecurso: false,
  porEdad: false,
  tiposConsulta: false,
  geografico: false
})

// Estado de progreso de carga
const progresoCarga = ref({
  total: 5, // Total de reportes a cargar
  completados: 0,
  porcentaje: 0,
  estado: 'inactivo', // 'inactivo', 'cargando', 'completado'
  tiempoInicio: 0,
  tiempoEstimado: 0
})

// Configurar debounce para filtros
const { debounce: debounceFiltros, cleanup: cleanupDebounce } = useDebounce()

// Función para actualizar el progreso de carga
const actualizarProgreso = () => {
  const reportes = [
    { estado: resumenMaestro.value.estado, cargando: estadosCarga.value.resumenMaestro },
    { estado: reporteRecursos.value.estado, cargando: estadosCarga.value.porRecurso },
    { estado: reporteEdades.value.estado, cargando: estadosCarga.value.porEdad },
    { estado: reporteConsultas.value.estado, cargando: estadosCarga.value.tiposConsulta },
    { estado: reporteGeografico.value.estado, cargando: estadosCarga.value.geografico }
  ]

  const completados = reportes.filter(r => r.estado === 'exitoso').length
  const cargandoCount = reportes.filter(r => r.cargando).length
  const totalCargando = completados + cargandoCount

  progresoCarga.value.completados = completados
  progresoCarga.value.porcentaje = Math.round((totalCargando / progresoCarga.value.total) * 100)

  // Calcular tiempo estimado si está cargando
  if (progresoCarga.value.estado === 'cargando' && progresoCarga.value.tiempoInicio > 0) {
    const tiempoTranscurrido = Date.now() - progresoCarga.value.tiempoInicio
    const progresoActual = progresoCarga.value.porcentaje / 100
    if (progresoActual > 0) {
      progresoCarga.value.tiempoEstimado = tiempoTranscurrido / progresoActual
    }
  }

  // Actualizar estado general
  if (completados === progresoCarga.value.total) {
    progresoCarga.value.estado = 'completado'
    progresoCarga.value.porcentaje = 100
  } else if (cargandoCount > 0 || completados > 0) {
    progresoCarga.value.estado = 'cargando'
  }
}

// Datos de reportes
const resumenMaestro = ref({ estado: 'inactivo', datos: [], resumen: null })
const reporteRecursos = ref({ estado: 'inactivo', datos: [], resumen: null })
const reporteEdades = ref({ estado: 'inactivo', datos: [], resumen: null })
const reporteConsultas = ref({ estado: 'inactivo', datos: [], resumen: null })
const reporteGeografico = ref({ estado: 'inactivo', datos: [], resumen: null })

// Filtros
const añoSeleccionado = ref('2024')
const mesSeleccionado = ref('')

// Datos disponibles
const añosDisponibles = [
  2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  2014, 2013, 2012, 2011, 2010, 2009, 2008
]

const mesesDisponibles = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
]

// Funciones de utilidad
const formatearNúmero = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('es-ES').format(num)
}

// Función para generar clave de caché única
const generarClaveCache = (endpoint, año, mes) => {
  return `${endpoint}_${año}_${mes || 'todo'}`
}

// Función para verificar si hay datos válidos en caché con estadísticas
const obtenerDesdeCache = (claveCache) => {
  const datosCache = cacheReportes.get(claveCache)
  if (datosCache && Date.now() - datosCache.timestamp < DURACION_CACHE) {
    console.log(`📋 Cache hit para ${claveCache}`)
    cacheStats.value.hits++
    return datosCache.datos
  }

  // Cache miss o expirado
  if (datosCache) {
    console.log(`⏰ Cache expirado para ${claveCache}`)
    cacheReportes.delete(claveCache)
    cacheStats.value.size--
  } else {
    cacheStats.value.misses++
  }

  return null
}

// Función para guardar en caché con gestión de memoria
const guardarEnCache = (claveCache, datos) => {
  // Verificar límite de tamaño y limpiar si es necesario
  if (cacheReportes.size >= MAX_CACHE_SIZE) {
    console.log('🧹 Limpiando caché por límite de tamaño')
    limpiarCacheExpirado()
  }

  // Si aún está lleno después de limpiar, eliminar el más antiguo
  if (cacheReportes.size >= MAX_CACHE_SIZE) {
    const primeraClave = cacheReportes.keys().next().value
    cacheReportes.delete(primeraClave)
    cacheStats.value.size--
    console.log('🗑️ Eliminando entrada antigua del caché')
  }

  // Calcular tamaño aproximado de los datos
  const tamañoDatos = JSON.stringify(datos).length
  cacheStats.value.memoryUsage += tamañoDatos

  cacheReportes.set(claveCache, {
    datos,
    timestamp: Date.now(),
    tamaño: tamañoDatos
  })

  cacheStats.value.size++
  console.log(`💾 Guardado en caché: ${claveCache} (${tamañoDatos} bytes)`)
}

// Función para limpiar entradas expiradas del caché
const limpiarCacheExpirado = () => {
  const ahora = Date.now()
  let eliminados = 0

  for (const [clave, valor] of cacheReportes.entries()) {
    if (ahora - valor.timestamp > DURACION_CACHE) {
      cacheStats.value.memoryUsage -= valor.tamaño || 0
      cacheReportes.delete(clave)
      eliminados++
    }
  }

  if (eliminados > 0) {
    cacheStats.value.size -= eliminados
    console.log(`🧹 Limpiados ${eliminados} elementos expirados del caché`)
  }
}

// Función optimizada para cargar un reporte
const cargarReporte = async (endpoint, referenciaReporte, opciones = {}) => {
  const {
    prioridad = 'normal',
    reintentar = true,
    tiempoEspera = 1000
  } = opciones

  // Generar clave de caché
  const claveCache = generarClaveCache(endpoint, añoSeleccionado.value, mesSeleccionado.value)

  // Verificar caché
  const datosCache = obtenerDesdeCache(claveCache)
  if (datosCache) {
    referenciaReporte.value = datosCache
    actualizarProgreso() // Actualizar progreso al usar caché
    return
  }

  // Actualizar estado de carga
  const claveEstado = endpoint.replace('-', '')
  estadosCarga.value[claveEstado] = true
  referenciaReporte.value.estado = 'cargando'

  // Actualizar progreso
  actualizarProgreso()

  try {
    console.log(`🔄 Cargando ${endpoint}...`)
    const tiempoInicio = Date.now()

    // Usar funciones específicas del API service
    let datos;
    switch (endpoint) {
      case 'master-summary':
        datos = await apiService.getAT2MasterSummary(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'by-resource':
        datos = await apiService.getAT2ByResource(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'by-age-group':
        datos = await apiService.getAT2ByAgeGroup(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'consultation-types':
        datos = await apiService.getAT2ConsultationTypes(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'geographic':
        datos = await apiService.getAT2Geographic(añoSeleccionado.value, mesSeleccionado.value);
        break;
      default:
        throw new Error(`Endpoint no reconocido: ${endpoint}`);
    }

    const tiempoCarga = Date.now() - tiempoInicio
    console.log(`✅ ${endpoint} cargado en ${tiempoCarga}ms`)

    if (datos.status === 'success') {
      const datosReporte = {
        estado: 'exitoso',
        datos: datos.data,
        resumen: datos.summary,
        tiempoCarga
      }

      referenciaReporte.value = datosReporte

      // Guardar en caché
      guardarEnCache(claveCache, datosReporte)

      // Actualizar progreso después del éxito
      actualizarProgreso()

      // Pequeño delay para evitar sobrecarga si es alta prioridad
      if (prioridad === 'alta') {
        await new Promise(resolve => setTimeout(resolve, tiempoEspera))
      }
    } else {
      throw new Error('Error en la respuesta del servidor')
    }
  } catch (error) {
    console.error(`❌ Error cargando ${endpoint}:`, error)

    // Solo marcar como error si no hay reintento o si el reintento también falla
    if (!reintentar) {
      referenciaReporte.value = {
        estado: 'error',
        datos: [],
        resumen: null,
        tiempoCarga: 0
      }

      // Actualizar progreso después del error
      actualizarProgreso()
    }

    // Reintentar una vez si está habilitado
    if (reintentar) {
      console.log(`🔄 Reintentando ${endpoint} en 2 segundos...`)
      setTimeout(() => cargarReporte(endpoint, referenciaReporte, { ...opciones, reintentar: false }), 2000)
    }
  } finally {
    // Solo limpiar el estado de carga si no hay reintento pendiente
    if (!reintentar) {
      estadosCarga.value[claveEstado] = false

      // Actualizar progreso después de limpiar estado
      actualizarProgreso()
    }
  }
}

// Función para cargar todos los reportes con optimización
const cargarTodosReportes = async () => {
  cargando.value = true

  // Inicializar progreso
  progresoCarga.value = {
    total: 5,
    completados: 0,
    porcentaje: 0,
    estado: 'cargando',
    tiempoInicio: Date.now(),
    tiempoEstimado: 0
  }

  try {
    // Todos los reportes en paralelo para mejor performance
    const todosReportes = [
      // Reportes de baja prioridad (pueden ejecutarse sin delay)
      cargarReporte('by-resource', reporteRecursos, { prioridad: 'baja' }),
      cargarReporte('geographic', reporteGeografico, { prioridad: 'baja' }),

      // Reportes de alta prioridad (con delay para evitar sobrecarga)
      new Promise(resolve => setTimeout(() =>
        cargarReporte('master-summary', resumenMaestro, { prioridad: 'alta' }).finally(resolve), 0)),
      new Promise(resolve => setTimeout(() =>
        cargarReporte('consultation-types', reporteConsultas, { prioridad: 'alta' }).finally(resolve), 200)),
      new Promise(resolve => setTimeout(() =>
        cargarReporte('by-age-group', reporteEdades, { prioridad: 'alta' }).finally(resolve), 400))
    ]

    // Ejecutar todos en paralelo (no secuencial)
    await Promise.allSettled(todosReportes)

    // Finalizar progreso
    actualizarProgreso()

    console.log('✅ Todos los reportes procesados (algunos pueden haber fallado individualmente)')
  } catch (error) {
    console.error('❌ Error general en carga de reportes:', error)
    progresoCarga.value.estado = 'inactivo'
  } finally {
    cargando.value = false
  }
}

// Función para actualizar filtros con debounce
const actualizarFiltros = () => {
  console.log('🔄 Filtros cambiados, esperando debounce...')
  debounceFiltros(() => {
    console.log('🔄 Ejecutando actualización de reportes después de debounce...')
    cargarTodosReportes()
  }, 500, 'filtros') // 500ms de debounce
}

// Función para forzar actualización inmediata (sin debounce)
const actualizarFiltrosInmediato = () => {
  console.log('🔄 Actualizando filtros inmediatamente...')
  cargarTodosReportes()
}

// Función para refrescar todos los reportes
const refrescarReportes = () => {
  console.log('🔄 Refrescando todos los reportes...')
  // Limpiar caché antes de recargar
  cacheReportes.clear()
  cargarTodosReportes()
}

// Función para limpiar caché con estadísticas
const limpiarCache = () => {
  const tamañoAnterior = cacheReportes.size
  const memoriaAnterior = cacheStats.value.memoryUsage

  cacheReportes.clear()

  // Resetear estadísticas
  cacheStats.value = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0
  }

  console.log(`🧹 Caché limpiado completamente (${tamañoAnterior} elementos, ${memoriaAnterior} bytes)`)
}

// Función para obtener estadísticas del caché
const obtenerEstadisticasCache = () => {
  const hitRate = cacheStats.value.hits + cacheStats.value.misses > 0
    ? (cacheStats.value.hits / (cacheStats.value.hits + cacheStats.value.misses) * 100).toFixed(1)
    : '0.0'

  return {
    ...cacheStats.value,
    hitRate: `${hitRate}%`,
    memoryUsageMB: (cacheStats.value.memoryUsage / (1024 * 1024)).toFixed(2)
  }
}

// Función para obtener reporte por tipo
const obtenerReportePorTipo = (tipo) => {
  switch (tipo) {
    case 'master-summary': return resumenMaestro
    case 'by-resource': return reporteRecursos
    case 'by-age-group': return reporteEdades
    case 'consultation-types': return reporteConsultas
    case 'geographic': return reporteGeografico
    default: return resumenMaestro
  }
}

// Computed properties
const totalAtenciones = computed(() => {
  const total = resumenMaestro.value.resumen?.total_atenciones || 0
  return total
})

const textoPeriodo = computed(() => {
  if (mesSeleccionado.value) {
    const nombreMes = mesesDisponibles.find(m => m.value === mesSeleccionado.value)?.label
    return `${nombreMes} ${añoSeleccionado.value}`
  }
  return `Año ${añoSeleccionado.value}`
})

// Función para mostrar modal con datos optimizados
const mostrarModalReporte = async (tipoReporte, datosModal) => {
  // Asegurar que el estado sea válido
  datosModal.value.estado = 'cargando'

  // Verificar si ya tenemos los datos del reporte principal
  const reportePrincipal = obtenerReportePorTipo(tipoReporte)

  if (reportePrincipal.value.estado === 'exitoso' && reportePrincipal.value.datos) {
    console.log(`📋 Usando datos del reporte principal para modal ${tipoReporte}`)
    datosModal.value = {
      estado: 'exitoso',
      datos: reportePrincipal.value.datos,
      resumen: reportePrincipal.value.resumen,
      tiempoCarga: reportePrincipal.value.tiempoCarga,
      desdeCache: true
    }
    return
  }

  // Cargar datos específicos del modal
  try {
    console.log(`🔄 Cargando modal ${tipoReporte}...`)
    const tiempoInicio = Date.now()

    // Usar funciones específicas del API service para el modal
    let datos;
    switch (tipoReporte) {
      case 'master-summary':
        datos = await apiService.getAT2MasterSummary(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'by-resource':
        datos = await apiService.getAT2ByResource(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'by-age-group':
        datos = await apiService.getAT2ByAgeGroup(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'consultation-types':
        datos = await apiService.getAT2ConsultationTypes(añoSeleccionado.value, mesSeleccionado.value);
        break;
      case 'geographic':
        datos = await apiService.getAT2Geographic(añoSeleccionado.value, mesSeleccionado.value);
        break;
      default:
        throw new Error(`Tipo de reporte no reconocido: ${tipoReporte}`);
    }

    const tiempoCarga = Date.now() - tiempoInicio

    if (datos.status === 'success') {
      datosModal.value = {
        estado: 'exitoso',
        datos: datos.data,
        resumen: datos.summary,
        tiempoCarga,
        desdeCache: datos.performance?.cached || false
      }
    } else {
      throw new Error('Error en la respuesta')
    }
  } catch (error) {
    console.error(`Error cargando modal ${tipoReporte}:`, error)
    // Asegurar que el estado sea válido
    datosModal.value.estado = 'error'
    datosModal.value.datos = []
    datosModal.value.resumen = undefined
    datosModal.value.tiempoCarga = undefined
    datosModal.value.desdeCache = false
  }
}

/**
 * Composable para gestión de reportes AT2
 * @returns {UseReportesReturn} Objeto con todas las funciones y estados del composable
 */
export function useReportes() {
  return {
    // Estados
    cargando,
    estadosCarga,
    progresoCarga,
    resumenMaestro,
    reporteRecursos,
    reporteEdades,
    reporteConsultas,
    reporteGeografico,

    // Filtros
    añoSeleccionado,
    mesSeleccionado,
    añosDisponibles,
    mesesDisponibles,

    // Computed
    totalAtenciones,
    textoPeriodo,

    // Estadísticas y caché
    cacheStats,
    obtenerEstadisticasCache,

    // Funciones
    formatearNúmero,
    cargarTodosReportes,
    actualizarFiltros,
    actualizarFiltrosInmediato,
    refrescarReportes,
    limpiarCache,
    obtenerReportePorTipo,
    mostrarModalReporte,
    cargarReporte,

    // Cleanup
    cleanup: cleanupDebounce
  }
}
