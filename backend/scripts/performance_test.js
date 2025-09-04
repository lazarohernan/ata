import mysql from 'mysql2/promise';

// Configuración de conexión
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'sesal_historico',
  connectionLimit: 15,
  acquireTimeout: 60000,
  timeout: 60000
};

// Función para medir tiempo de ejecución
async function measureQueryTime(query, params = [], description = '') {
  const startTime = Date.now();
  const pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(query, params);
    const executionTime = Date.now() - startTime;

    console.log(`\n${description}`);
    console.log(`⏱️  Tiempo de ejecución: ${executionTime}ms`);
    console.log(`📊 Resultados: ${rows.length} filas`);

    return { executionTime, rowsCount: rows.length };
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    return { executionTime: -1, rowsCount: 0 };
  } finally {
    connection.release();
    await pool.end();
  }
}

// Función principal para pruebas de performance
async function runPerformanceTests() {
  console.log('🚀 INICIANDO PRUEBAS DE PERFORMANCE - SISTEMA AT2 OPTIMIZADO\n');
  console.log('=' .repeat(80));

  // Prueba 1: Consulta simple de estadísticas
  await measureQueryTime(
    'SELECT COUNT(*) as total FROM AT2_BDT_MENSUAL_DETALLE_2024',
    [],
    '📊 1. Conteo total de registros (sin índice)'
  );

  // Prueba 2: Consulta con filtro de mes (con índice)
  await measureQueryTime(
    'SELECT COUNT(*) as total FROM AT2_BDT_MENSUAL_DETALLE_2024 USE INDEX (idx_at2_2024_mes) WHERE N_MES = ?',
    ['1'],
    '📅 2. Filtro por mes (con índice optimizado)'
  );

  // Prueba 3: Consulta de resumen por concepto (con índice compuesto)
  await measureQueryTime(
    `SELECT C_CONCEPTO, COUNT(*) as total
     FROM AT2_BDT_MENSUAL_DETALLE_2024 USE INDEX (idx_at2_2024_concepto)
     GROUP BY C_CONCEPTO
     ORDER BY total DESC LIMIT 10`,
    [],
    '📋 3. Agrupación por concepto (con índice)'
  );

  // Prueba 4: Consulta geográfica (con índice de ubicación)
  await measureQueryTime(
    `SELECT LEFT(C_US, 2) as dept, COUNT(*) as total
     FROM AT2_BDT_MENSUAL_DETALLE_2024 USE INDEX (idx_at2_2024_cus)
     GROUP BY LEFT(C_US, 2)
     ORDER BY total DESC LIMIT 10`,
    [],
    '🗺️  4. Distribución geográfica (con índice de ubicación)'
  );

  // Prueba 5: Consulta compleja de resumen maestro
  await measureQueryTime(
    `SELECT
       c.C_CONCEPTO,
       COUNT(*) as total_atenciones,
       SUM(CASE WHEN d.Q_AT_MEDICO_GEN IS NOT NULL AND d.Q_AT_MEDICO_GEN != '' THEN CAST(d.Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as medicos_generales
     FROM AT2_BDT_MENSUAL_DETALLE_2024 d USE INDEX (idx_at2_2024_concepto)
     LEFT JOIN AT2_BDR_CONCEPTOS_GE c USE INDEX (idx_conceptos_codigo) ON d.C_CONCEPTO = c.C_CONCEPTO
     GROUP BY c.C_CONCEPTO
     ORDER BY total_atenciones DESC LIMIT 20`,
    [],
    '🎯 5. Consulta compleja de resumen maestro (índices optimizados)'
  );

  // Prueba 6: Estadísticas de índices
  const pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();

  try {
    const [indexStats] = await connection.query(`
      SELECT table_name, COUNT(*) as total_indexes
      FROM information_schema.statistics
      WHERE table_schema = 'sesal_historico'
      AND table_name LIKE 'AT2_BDT_MENSUAL_DETALLE_%'
      GROUP BY table_name
      ORDER BY table_name
    `);

    console.log('\n📈 6. ESTADÍSTICAS DE ÍNDICES:');
    console.log('=' .repeat(50));
    indexStats.forEach(stat => {
      console.log(`📊 ${stat.table_name}: ${stat.total_indexes} índices`);
    });

    const [cacheStats] = await connection.query(`
      SELECT table_rows, data_length/1024/1024 as size_mb
      FROM information_schema.tables
      WHERE table_schema = 'sesal_historico'
      AND table_name = 'AT2_BDT_MENSUAL_DETALLE_2024'
    `);

    console.log('\n💾 7. ESTADÍSTICAS DE ALMACENAMIENTO:');
    console.log('=' .repeat(50));
    console.log(`📊 Registros en AT2_BDT_MENSUAL_DETALLE_2024: ${cacheStats[0].table_rows.toLocaleString()}`);
    console.log(`💾 Tamaño de datos: ${cacheStats[0].size_mb.toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }

  console.log('\n🎉 PRUEBAS DE PERFORMANCE COMPLETADAS');
  console.log('=' .repeat(80));
  console.log('💡 RECOMENDACIONES:');
  console.log('   • Las consultas ahora usan índices optimizados');
  console.log('   • El sistema de cache reduce consultas repetidas');
  console.log('   • El pool de conexiones maneja mejor la concurrencia');
  console.log('   • Los tiempos de respuesta deberían ser significativamente menores');
}

// Ejecutar pruebas
runPerformanceTests().catch(console.error);
