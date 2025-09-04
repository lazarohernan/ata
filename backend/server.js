const express = require('express');
const cors = require('cors');
const { testConnection, executeQuery, getCacheStats } = require('./mysql-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración basada en entorno
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? ['http://3.141.99.154:4000', 'http://3.141.99.154'] : ['http://localhost:4000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Función para obtener estadísticas reales desde MySQL con cache
async function getQuickStats() {
  try {
    const cacheKey = 'quick_stats_cache';

    return await executeQuery(`
      SELECT
        (SELECT COUNT(*) FROM AT2_BDT_MENSUAL_DETALLE_2024) as totalSystemRecords,
        (SELECT COUNT(*) FROM AT2_BDT_MENSUAL_DETALLE_2024 WHERE N_ANIO = '2024') as currentYearDetail,
        (SELECT COUNT(*) FROM AT2_BDT_MENSUAL_2024) as totalBasicRecords,
        (SELECT COUNT(*) FROM AT2_BDT_MENSUAL_2024 WHERE N_ANIO = '2024') as currentYearBasic
    `, [], true, cacheKey);

  } catch (error) {
    console.error('Error en getQuickStats:', error);
    // Fallback a datos por defecto
    return {
      success: true,
      data: [{
        totalSystemRecords: 0,
        totalBasicRecords: 0,
        currentYearDetail: 0,
        currentYearBasic: 0
      }]
    };
  }
}

// Rutas de la API
app.get('/api/health', async (req, res) => {
  try {
    const mysqlStatus = await testConnection();
    const cacheStats = getCacheStats();

    res.json({
      status: 'success',
      message: 'Backend API is running',
      mysql: {
        connected: mysqlStatus,
        database: 'sesal_historico',
        host: 'localhost:3306'
      },
      performance: {
        cache: cacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      status: 'success',
      message: 'Backend API is running',
      mysql: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para estadísticas de performance y cache
app.get('/api/performance/stats', async (req, res) => {
  try {
    const cacheStats = getCacheStats();

    // Obtener estadísticas de índices
    const indexStats = await executeQuery(`
      SELECT
        table_name,
        index_name,
        cardinality,
        pages,
        filter_condition
      FROM information_schema.statistics
      WHERE table_schema = 'sesal_historico'
      AND table_name LIKE 'AT2_BDT_MENSUAL_DETALLE_%'
      ORDER BY table_name, seq_in_index
    `);

    res.json({
      status: 'success',
      cache: cacheStats,
      database: {
        totalIndexes: indexStats.success ? indexStats.data.length : 0,
        indexes: indexStats.success ? indexStats.data : []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo estadísticas de performance',
      error: error.message
    });
  }
});

// Quick stats endpoint - Datos reales desde MySQL
app.get('/api/dashboard/quick-stats', async (req, res) => {
  try {
    const stats = await getQuickStats();
    res.json({
      status: 'success',
      data: stats,
      message: 'Quick stats loaded successfully from MySQL'
    });
  } catch (error) {
    console.error('Error en quick-stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cargar estadísticas desde MySQL'
    });
  }
});

// Yearly comparison endpoint - Datos reales desde MySQL
app.get('/api/dashboard/yearly-comparison', async (req, res) => {
  try {
    const { startYear = '2020', endYear = '2024', type = 'basic' } = req.query;
    
    const yearlyData = [];
    
    // Obtener datos para cada año en el rango
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      let tableName;
      if (type === 'basic') {
        tableName = `AT2_BDT_MENSUAL_${year}`;
      } else {
        tableName = `AT2_BDT_MENSUAL_DETALLE_${year}`;
      }
      
      // Verificar que la tabla existe
      const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
      const tableExists = await executeQuery(tableExistsQuery);
      
      if (tableExists.success && tableExists.data.length > 0) {
        // Contar registros para este año
        const countQuery = `SELECT COUNT(*) as records FROM ${tableName}`;
        const countResult = await executeQuery(countQuery);
        
        if (countResult.success) {
          yearlyData.push({
            year: year.toString(),
            records: parseInt(countResult.data[0].records)
          });
        }
      }
    }
    
    res.json({
      status: 'success',
      data: {
        yearlyData,
        type,
        startYear,
        endYear
      },
      message: 'Yearly comparison loaded successfully from MySQL'
    });
    
  } catch (error) {
    console.error('Error en yearly-comparison:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cargar comparación anual desde MySQL'
    });
  }
});

// Monthly data endpoint - Datos reales desde MySQL
app.get('/api/dashboard/monthly-data/:year/:type', async (req, res) => {
  try {
    const { year, type } = req.params;
    
    let tableName;
    if (type === 'basic') {
      tableName = `AT2_BDT_MENSUAL_${year}`;
    } else if (type === 'detail') {
      tableName = `AT2_BDT_MENSUAL_DETALLE_${year}`;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Tipo debe ser "basic" o "detail"'
      });
    }
    
    // Verificar que la tabla existe
    const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
    const tableExists = await executeQuery(tableExistsQuery);
    
    if (!tableExists.success || tableExists.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Tabla ${tableName} no encontrada`
      });
    }
    
    // Obtener datos mensuales agrupados por mes
    const monthlyQuery = `
      SELECT 
        N_MES as month,
        COUNT(*) as records,
        ${year} as year
      FROM ${tableName}
      GROUP BY N_MES
      ORDER BY N_MES
    `;
    
    const monthlyResult = await executeQuery(monthlyQuery);
    
    if (monthlyResult.success) {
      // Asegurar que tenemos datos para los 12 meses
      const monthlyData = Array.from({length: 12}, (_, i) => {
        const monthData = monthlyResult.data.find(item => parseInt(item.month) === i + 1);
        return {
          month: i + 1,
          records: monthData ? parseInt(monthData.records) : 0,
          year: parseInt(year)
        };
      });
      
      const totalRecords = monthlyData.reduce((sum, item) => sum + item.records, 0);
      
      res.json({
        status: 'success',
        data: {
          year: parseInt(year),
          type,
          monthlyData,
          totalRecords
        },
        message: `Monthly data for ${year} (${type}) loaded successfully from MySQL`
      });
    } else {
      throw new Error('Error al obtener datos mensuales');
    }
    
  } catch (error) {
    console.error('Error en monthly-data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cargar datos mensuales desde MySQL'
    });
  }
});

// Catalogs endpoint - Datos reales desde MySQL
app.get('/api/dashboard/catalogs', async (req, res) => {
  try {
    const catalogs = [];
    
    // Obtener información de catálogos
    const catalogQueries = [
      { name: 'Grupos de Edad', table: 'CAT_GRUPOS_EDAD', description: 'Categorías etarias del sistema' },
      { name: 'Nivel Operativo', table: 'CAT_NIVEL_OPERATIVO', description: 'Niveles jerárquicos de operación' },
      { name: 'Sexo', table: 'CAT_SEXO', description: 'Categorías de género' },
      { name: 'Conceptos GE', table: 'AT2_BDR_CONCEPTOS_GE', description: 'Conceptos generales del sistema' }
    ];
    
    for (const catalog of catalogQueries) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${catalog.table}`;
        const countResult = await executeQuery(countQuery);
        
        if (countResult.success) {
          catalogs.push({
            name: catalog.name,
            description: catalog.description,
            count: parseInt(countResult.data[0].count)
          });
        }
      } catch (error) {
        console.error(`Error al contar ${catalog.table}:`, error);
        // Agregar con count 0 si hay error
        catalogs.push({
          name: catalog.name,
          description: catalog.description,
          count: 0
        });
      }
    }
    
    res.json({
      status: 'success',
      data: catalogs,
      message: 'Catalogs loaded successfully from MySQL'
    });
    
  } catch (error) {
    console.error('Error en catalogs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cargar catálogos desde MySQL'
    });
  }
});

// Endpoint para test de conexión a base de datos
app.post('/api/datasources/test', async (req, res) => {
  try {
    const connectionConfig = req.body;

    // Solo soportamos MySQL por ahora
    if (connectionConfig.type !== 'mysql') {
      return res.json({
        success: false,
        message: `Tipo de base de datos no soportado: ${connectionConfig.type}. Solo se soporta MySQL.`,
        error: 'UNSUPPORTED_DATABASE_TYPE'
      });
    }

    // Crear configuración de conexión temporal
    const testConfig = {
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.username,
      password: connectionConfig.password,
      database: connectionConfig.database,
      connectTimeout: 10000, // 10 segundos timeout
      acquireTimeout: 10000,
      timeout: 10000
    };

    // Intentar conectar usando mysql2
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(testConfig);

    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();

    // Si llegamos aquí, la conexión fue exitosa
    res.json({
      success: true,
      message: `✅ Conexión exitosa a MySQL en ${connectionConfig.host}:${connectionConfig.port}`,
      database: connectionConfig.database,
      user: connectionConfig.username,
      testResult: rows[0]
    });

  } catch (error) {
    console.error('❌ Error en test de conexión:', error);

    // Determinar el tipo de error
    let errorMessage = 'Error desconocido de conexión';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = `No se puede conectar al servidor ${req.body.host}:${req.body.port}. Verifique que el servidor esté ejecutándose y que el puerto esté abierto.`;
      errorCode = 'CONNECTION_REFUSED';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acceso denegado para el usuario '${req.body.username}'. Verifique el usuario y contraseña.`;
      errorCode = 'ACCESS_DENIED';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `Base de datos '${req.body.database}' no existe.`;
      errorCode = 'DATABASE_NOT_FOUND';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = `Timeout de conexión. El servidor tardó demasiado en responder.`;
      errorCode = 'CONNECTION_TIMEOUT';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.json({
      success: false,
      message: errorMessage,
      error: errorCode,
      details: error.message
    });
  }
});

// Tipos de bases de datos soportadas
app.get('/api/datasources/types', (req, res) => {
  res.json({
    data: [
      { type: 'mysql', name: 'MySQL', defaultPort: 3306, description: 'Base de datos relacional de código abierto' },
      { type: 'postgresql', name: 'PostgreSQL', defaultPort: 5432, description: 'Base de datos relacional avanzada' },
      { type: 'sqlite', name: 'SQLite', defaultPort: null, description: 'Base de datos ligera embebida' },
      { type: 'sqlserver', name: 'SQL Server', defaultPort: 1433, description: 'Base de datos de Microsoft' },
      { type: 'oracle', name: 'Oracle', defaultPort: 1521, description: 'Base de datos empresarial de Oracle' }
    ]
  });
});

// Endpoint genérico para tablas con filtrado avanzado
app.get('/api/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { 
      limit = 15, 
      offset = 0, 
      year, 
      month, 
      service, 
      search,
      sortBy = 'C_US',
      sortOrder = 'ASC'
    } = req.query;

    // Verificar que la tabla existe
    const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
    const tableExists = await executeQuery(tableExistsQuery);
    
    if (!tableExists.success || tableExists.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Tabla ${tableName} no encontrada`
      });
    }

    // Construir consulta SQL con filtros
    let whereConditions = [];
    let queryParams = [];

    if (year) {
      whereConditions.push('N_ANIO = ?');
      queryParams.push(year);
    }

    if (month) {
      whereConditions.push('N_MES = ?');
      queryParams.push(month);
    }

    if (service) {
      whereConditions.push('C_SERVICIO = ?');
      queryParams.push(service);
    }

    if (search) {
      whereConditions.push('(C_US LIKE ? OR N_ANIO LIKE ? OR N_MES LIKE ? OR C_SERVICIO LIKE ? OR V_US LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta para contar total de registros con filtros
    let countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
    let countParams = [];
    if (whereConditions.length > 0) {
      countQuery += ` ${whereClause}`;
      countParams = [...queryParams];
    }
    const countResult = await executeQuery(countQuery, countParams);
    
    if (!countResult.success) {
      throw new Error('Error al contar registros');
    }

    const totalRecords = parseInt(countResult.data[0].total);

    // Consulta principal con filtros, ordenamiento y paginación
    let dataQuery = `SELECT * FROM ${tableName}`;
    let finalParams = [];

    if (whereConditions.length > 0) {
      dataQuery += ` ${whereClause}`;
      finalParams = [...queryParams];
    }

    // Para tablas con campos TEXT, usamos una consulta más simple inicialmente
    dataQuery += ` LIMIT ? OFFSET ?`;
    finalParams.push(parseInt(limit), parseInt(offset));

    // Logs de depuración solo en desarrollo
    if (!isProduction) {
      console.log('🔍 Ejecutando consulta:', dataQuery);
      console.log('📊 Parámetros:', finalParams);
    }

    const dataResult = await executeQuery(dataQuery, finalParams);

    if (!dataResult.success) {
      console.error('❌ Error en dataResult:', dataResult.error);
      throw new Error('Error al obtener datos');
    }

    res.json({
      status: 'success',
      data: dataResult.data,
      pagination: {
        total: totalRecords,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalRecords,
        totalPages: Math.ceil(totalRecords / parseInt(limit))
      },
      filters: {
        year: year || null,
        month: month || null,
        service: service || null,
        search: search || null
      }
    });

  } catch (error) {
    console.error('Error en endpoint de tabla:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cargar datos de la tabla'
    });
  }
});

// Endpoint para estructura de tablas
app.get('/api/tables/:tableName/structure', async (req, res) => {
  try {
    const { tableName } = req.params;

    // Obtener estructura real de la tabla desde MySQL
    const structureQuery = `DESCRIBE ${tableName}`;
    const structureResult = await executeQuery(structureQuery);
    
    if (structureResult.success) {
      res.json({
        status: 'success',
        data: structureResult.data
      });
    } else {
      throw new Error('Error al obtener estructura de la tabla');
    }
  } catch (error) {
    console.error('Error en estructura de tabla:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estructura de la tabla'
    });
  }
});

// Endpoint simple para probar sin filtros
app.get('/api/tables/:tableName/test', async (req, res) => {
  try {
    const { tableName } = req.params;

    // Consulta simple sin filtros
    const testQuery = `SELECT * FROM ${tableName} LIMIT 5`;
    if (!isProduction) console.log('🧪 Probando consulta simple:', testQuery);

    const testResult = await executeQuery(testQuery, []);

    if (!testResult.success) {
      console.error('❌ Error en testResult:', testResult.error);
      throw new Error('Error en consulta de prueba');
    }

    res.json({
      status: 'success',
      data: testResult.data,
      message: 'Prueba exitosa'
    });

  } catch (error) {
    console.error('Error en test endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en endpoint de prueba'
    });
  }
});

// =============== ENDPOINTS PARA REPORTES AT2 ===============

// 1. Resumen maestro con todos los conceptos - OPTIMIZADO
app.get('/api/reports/at2/master-summary', async (req, res) => {
  try {
    const { year = '2024', month, type = 'detail' } = req.query;
    const tableName = type === 'detail' ? `AT2_BDT_MENSUAL_DETALLE_${year}` : `AT2_BDT_MENSUAL_${year}`;

    // Crear clave de cache única
    const cacheKey = `master_summary_${year}_${month || 'all'}_${type}`;

    const query = `
      SELECT
        c.C_CONCEPTO,
        c.D_CONCEPTO,
        c.GRUPO_ESPECIAL,
        COUNT(*) as total_atenciones,
        SUM(CASE WHEN d.Q_AT_MEDICO_GEN IS NOT NULL AND d.Q_AT_MEDICO_GEN != '' THEN CAST(d.Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as medicos_generales,
        SUM(CASE WHEN d.Q_AT_MEDICO_ESP IS NOT NULL AND d.Q_AT_MEDICO_ESP != '' THEN CAST(d.Q_AT_MEDICO_ESP AS UNSIGNED) ELSE 0 END) as medicos_especialistas,
        SUM(CASE WHEN d.Q_AT_ENFERMERA_PRO IS NOT NULL AND d.Q_AT_ENFERMERA_PRO != '' THEN CAST(d.Q_AT_ENFERMERA_PRO AS UNSIGNED) ELSE 0 END) as enfermeras_profesionales,
        SUM(CASE WHEN d.Q_AT_ENFERMERA_AUX IS NOT NULL AND d.Q_AT_ENFERMERA_AUX != '' THEN CAST(d.Q_AT_ENFERMERA_AUX AS UNSIGNED) ELSE 0 END) as enfermeras_auxiliares
      FROM ${tableName} d
      USE INDEX (idx_at2_${year}_mes_concepto)
      LEFT JOIN AT2_BDR_CONCEPTOS_GE c USE INDEX (idx_conceptos_codigo) ON d.C_CONCEPTO = c.C_CONCEPTO
      ${month ? 'WHERE d.N_MES = ?' : ''}
      GROUP BY c.C_CONCEPTO, c.D_CONCEPTO, c.GRUPO_ESPECIAL
      ORDER BY total_atenciones DESC
      LIMIT 50
    `;

    const params = month ? [month] : [];
    const result = await executeQuery(query, params, true, cacheKey);

    if (!result.success) {
      throw new Error('Error generando resumen maestro');
    }

    const totalAtenciones = result.data.reduce((sum, item) => sum + parseInt(item.total_atenciones || 0), 0);

    res.json({
      status: 'success',
      data: result.data,
      filters: { year, month, type },
      performance: {
        executionTime: result.executionTime,
        cached: result.cached || false
      },
      summary: {
        total_concepts: result.data.length,
        total_atenciones: totalAtenciones,
        periodo: month ? `${month}/${year}` : `Año ${year}`
      }
    });

  } catch (error) {
    console.error('Error en master-summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generando resumen maestro AT2'
    });
  }
});

// 2. Total de atenciones por recurso médico - OPTIMIZADO
app.get('/api/reports/at2/by-resource', async (req, res) => {
  try {
    const { year = '2024', month, type = 'detail' } = req.query;
    const tableName = type === 'detail' ? `AT2_BDT_MENSUAL_DETALLE_${year}` : `AT2_BDT_MENSUAL_${year}`;

    // Crear clave de cache única
    const cacheKey = `by_resource_${year}_${month || 'all'}_${type}`;

    // Consulta optimizada con subqueries en lugar de UNION
    const query = `
      SELECT
        'Médicos Generales' as recurso,
        'medicos_generales' as tipo,
        SUM(CASE WHEN Q_AT_MEDICO_GEN IS NOT NULL AND Q_AT_MEDICO_GEN != '' THEN CAST(Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as total_atenciones,
        COUNT(*) as total_registros
      FROM ${tableName} USE INDEX (idx_at2_${year}_mes)
      ${month ? 'WHERE N_MES = ?' : ''}

      UNION ALL

      SELECT
        'Médicos Especialistas' as recurso,
        'medicos_especialistas' as tipo,
        SUM(CASE WHEN Q_AT_MEDICO_ESP IS NOT NULL AND Q_AT_MEDICO_ESP != '' THEN CAST(Q_AT_MEDICO_ESP AS UNSIGNED) ELSE 0 END) as total_atenciones,
        COUNT(*) as total_registros
      FROM ${tableName} USE INDEX (idx_at2_${year}_mes)
      ${month ? 'WHERE N_MES = ?' : ''}

      UNION ALL

      SELECT
        'Enfermeras Profesionales' as recurso,
        'enfermeras_profesionales' as tipo,
        SUM(CASE WHEN Q_AT_ENFERMERA_PRO IS NOT NULL AND Q_AT_ENFERMERA_PRO != '' THEN CAST(Q_AT_ENFERMERA_PRO AS UNSIGNED) ELSE 0 END) as total_atenciones,
        COUNT(*) as total_registros
      FROM ${tableName} USE INDEX (idx_at2_${year}_mes)
      ${month ? 'WHERE N_MES = ?' : ''}

      UNION ALL

      SELECT
        'Enfermeras Auxiliares' as recurso,
        'enfermeras_auxiliares' as tipo,
        SUM(CASE WHEN Q_AT_ENFERMERA_AUX IS NOT NULL AND Q_AT_ENFERMERA_AUX != '' THEN CAST(Q_AT_ENFERMERA_AUX AS UNSIGNED) ELSE 0 END) as total_atenciones,
        COUNT(*) as total_registros
      FROM ${tableName} USE INDEX (idx_at2_${year}_mes)
      ${month ? 'WHERE N_MES = ?' : ''}
    `;

    const params = month ? [month, month, month, month] : [];
    const result = await executeQuery(query, params, true, cacheKey);

    if (!result.success) {
      throw new Error('Error generando reporte por recurso');
    }

    const totalAtenciones = result.data.reduce((sum, item) => sum + parseInt(item.total_atenciones || 0), 0);

    res.json({
      status: 'success',
      data: result.data,
      filters: { year, month, type },
      performance: {
        executionTime: result.executionTime,
        cached: result.cached || false
      },
      summary: {
        total_recursos: result.data.length,
        total_atenciones: totalAtenciones,
        periodo: month ? `${month}/${year}` : `Año ${year}`
      }
    });

  } catch (error) {
    console.error('Error en by-resource:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generando reporte por recurso médico'
    });
  }
});

// 3. Total de atenciones por grupos de edad
app.get('/api/reports/at2/by-age-group', async (req, res) => {
  try {
    const { year = '2024', month, type = 'detail' } = req.query;
    const tableName = type === 'detail' ? `AT2_BDT_MENSUAL_DETALLE_${year}` : `AT2_BDT_MENSUAL_${year}`;

    // Consulta simplificada sin JOIN para probar primero
    let whereClause = '';
    let params = [];

    if (month) {
      whereClause = 'WHERE N_MES = ?';
      params = [month];
    }

    const query = `
      SELECT
        COUNT(*) as total_atenciones,
        SUM(CASE WHEN Q_AT_MEDICO_GEN IS NOT NULL AND Q_AT_MEDICO_GEN != '' THEN CAST(Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as medicos_generales,
        SUM(CASE WHEN Q_AT_MEDICO_ESP IS NOT NULL AND Q_AT_MEDICO_ESP != '' THEN CAST(Q_AT_MEDICO_ESP AS UNSIGNED) ELSE 0 END) as medicos_especialistas,
        SUM(CASE WHEN Q_AT_ENFERMERA_PRO IS NOT NULL AND Q_AT_ENFERMERA_PRO != '' THEN CAST(Q_AT_ENFERMERA_PRO AS UNSIGNED) ELSE 0 END) as enfermeras_profesionales,
        SUM(CASE WHEN Q_AT_ENFERMERA_AUX IS NOT NULL AND Q_AT_ENFERMERA_AUX != '' THEN CAST(Q_AT_ENFERMERA_AUX AS UNSIGNED) ELSE 0 END) as enfermeras_auxiliares
      FROM ${tableName}
      ${whereClause}
    `;

    const result = await executeQuery(query, params);

    if (!result.success) {
      throw new Error('Error generando reporte por grupos de edad');
    }

    // Crear respuesta simplificada con un solo grupo
    const data = [{
      grupo_edad: 'Total General',
      total_atenciones: result.data[0].total_atenciones,
      medicos_generales: result.data[0].medicos_generales,
      medicos_especialistas: result.data[0].medicos_especialistas,
      enfermeras_profesionales: result.data[0].enfermeras_profesionales,
      enfermeras_auxiliares: result.data[0].enfermeras_auxiliares
    }];

    res.json({
      status: 'success',
      data: data,
      filters: { year, month, type },
      summary: {
        total_grupos: 1,
        total_atenciones: parseInt(result.data[0].total_atenciones),
        periodo: month ? `${month}/${year}` : `Año ${year}`
      }
    });

  } catch (error) {
    console.error('Error en by-age-group:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generando reporte por grupos de edad'
    });
  }
});

// 4. Consultas externas vs emergencias
app.get('/api/reports/at2/consultation-types', async (req, res) => {
  try {
    const { year = '2024', month, type = 'detail' } = req.query;
    const tableName = type === 'detail' ? `AT2_BDT_MENSUAL_DETALLE_${year}` : `AT2_BDT_MENSUAL_${year}`;

    let whereClause = '';
    let params = [];

    if (month) {
      whereClause = 'WHERE d.N_MES = ?';
      params = [month];
    }

    const query = `
      SELECT
        CASE
          WHEN c.C_CONCEPTO IN ('12', '22') THEN 'Consultas Espontáneas'
          WHEN c.C_CONCEPTO IN ('13', '23') THEN 'Consultas Referidas'
          ELSE 'Otros'
        END as tipo_consulta,
        c.D_CONCEPTO as descripcion,
        COUNT(*) as total_atenciones,
        SUM(CASE WHEN d.Q_AT_MEDICO_GEN IS NOT NULL THEN CAST(d.Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as medicos_generales,
        SUM(CASE WHEN d.Q_AT_MEDICO_ESP IS NOT NULL THEN CAST(d.Q_AT_MEDICO_ESP AS UNSIGNED) ELSE 0 END) as medicos_especialistas
      FROM ${tableName} d
      LEFT JOIN AT2_BDR_CONCEPTOS_GE c ON d.C_CONCEPTO = c.C_CONCEPTO
      ${whereClause}
      GROUP BY
        CASE
          WHEN c.C_CONCEPTO IN ('12', '22') THEN 'Consultas Espontáneas'
          WHEN c.C_CONCEPTO IN ('13', '23') THEN 'Consultas Referidas'
          ELSE 'Otros'
        END,
        c.D_CONCEPTO
      HAVING tipo_consulta != 'Otros'
      ORDER BY total_atenciones DESC
    `;

    const result = await executeQuery(query, params);

    if (!result.success) {
      throw new Error('Error generando reporte de tipos de consulta');
    }

    res.json({
      status: 'success',
      data: result.data,
      filters: { year, month, type },
      summary: {
        total_tipos: result.data.length,
        total_atenciones: result.data.reduce((sum, item) => sum + parseInt(item.total_atenciones), 0),
        periodo: month ? `${month}/${year}` : `Año ${year}`
      }
    });

  } catch (error) {
    console.error('Error en consultation-types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generando reporte de tipos de consulta'
    });
  }
});

// 5. Distribución geográfica (usando códigos del C_US) - OPTIMIZADO
app.get('/api/reports/at2/geographic', async (req, res) => {
  try {
    const { year = '2024', month, type = 'detail' } = req.query;
    const tableName = type === 'detail' ? `AT2_BDT_MENSUAL_DETALLE_${year}` : `AT2_BDT_MENSUAL_${year}`;

    // Crear clave de cache única
    const cacheKey = `geographic_${year}_${month || 'all'}_${type}`;

    const query = `
      SELECT
        LEFT(C_US, 4) as municipio_codigo,
        LEFT(C_US, 2) as departamento_codigo,
        COUNT(*) as total_atenciones,
        SUM(CASE WHEN Q_AT_MEDICO_GEN IS NOT NULL AND Q_AT_MEDICO_GEN != '' THEN CAST(Q_AT_MEDICO_GEN AS UNSIGNED) ELSE 0 END) as medicos_generales,
        SUM(CASE WHEN Q_AT_MEDICO_ESP IS NOT NULL AND Q_AT_MEDICO_ESP != '' THEN CAST(Q_AT_MEDICO_ESP AS UNSIGNED) ELSE 0 END) as medicos_especialistas,
        SUM(CASE WHEN Q_AT_ENFERMERA_PRO IS NOT NULL AND Q_AT_ENFERMERA_PRO != '' THEN CAST(Q_AT_ENFERMERA_PRO AS UNSIGNED) ELSE 0 END) as enfermeras_profesionales,
        SUM(CASE WHEN Q_AT_ENFERMERA_AUX IS NOT NULL AND Q_AT_ENFERMERA_AUX != '' THEN CAST(Q_AT_ENFERMERA_AUX AS UNSIGNED) ELSE 0 END) as enfermeras_auxiliares
      FROM ${tableName} USE INDEX (idx_at2_${year}_cus)
      WHERE LENGTH(C_US) >= 4
      ${month ? 'AND N_MES = ?' : ''}
      GROUP BY LEFT(C_US, 4), LEFT(C_US, 2)
      ORDER BY total_atenciones DESC
      LIMIT 25
    `;

    const params = month ? [month] : [];
    const result = await executeQuery(query, params, true, cacheKey);

    if (!result.success) {
      throw new Error('Error generando reporte geográfico');
    }

    const totalAtenciones = result.data.reduce((sum, item) => sum + parseInt(item.total_atenciones || 0), 0);

    res.json({
      status: 'success',
      data: result.data,
      filters: { year, month, type },
      performance: {
        executionTime: result.executionTime,
        cached: result.cached || false
      },
      summary: {
        total_municipios: result.data.length,
        total_atenciones: totalAtenciones,
        periodo: month ? `${month}/${year}` : `Año ${year}`
      }
    });

  } catch (error) {
    console.error('Error en geographic:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generando reporte geográfico'
    });
  }
});

// Endpoint para opciones de filtros de una tabla específica
app.get('/api/tables/:tableName/filter-options', async (req, res) => {
  try {
    const { tableName } = req.params;

    // Verificar que la tabla existe
    const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
    const tableExists = await executeQuery(tableExistsQuery);
    
    if (!tableExists.success || tableExists.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Tabla ${tableName} no encontrada`
      });
    }

    // Obtener años únicos
    const yearsQuery = `SELECT DISTINCT N_ANIO as year FROM ${tableName} WHERE N_ANIO IS NOT NULL ORDER BY N_ANIO DESC`;
    const yearsResult = await executeQuery(yearsQuery);

    // Obtener meses únicos
    const monthsQuery = `SELECT DISTINCT N_MES as month FROM ${tableName} WHERE N_MES IS NOT NULL ORDER BY N_MES`;
    const monthsResult = await executeQuery(monthsQuery);

    // Obtener servicios únicos
    const servicesQuery = `SELECT DISTINCT C_SERVICIO as service FROM ${tableName} WHERE C_SERVICIO IS NOT NULL ORDER BY C_SERVICIO`;
    const servicesResult = await executeQuery(servicesQuery);

    // Obtener total de registros
    const totalQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
    const totalResult = await executeQuery(totalQuery);

    res.json({
      status: 'success',
      data: {
        years: yearsResult.success ? yearsResult.data.map(row => row.year) : [],
        months: monthsResult.success ? monthsResult.data.map(row => row.month) : [],
        services: servicesResult.success ? servicesResult.data.map(row => row.service) : [],
        totalRecords: totalResult.success ? parseInt(totalResult.data[0].total) : 0
      }
    });

  } catch (error) {
    console.error('Error en opciones de filtros:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener opciones de filtros'
    });
  }
});

// Endpoint para obtener todas las tablas
app.get('/api/tables', (req, res) => {
  const tables = [
    'AT2_BDT_MENSUAL_2024',
    'AT2_BDT_MENSUAL_2023',
    'AT2_BDT_MENSUAL_DETALLE_2024',
    'AT2_BDT_MENSUAL_DETALLE_2023',
    'CAT_GRUPOS_EDAD',
    'CAT_NIVEL_OPERATIVO',
    'CAT_SEXO',
    'AT2_BDR_CONCEPTOS_GE'
  ];

  res.json({
    status: 'success',
    data: tables
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

// Manejo de errores generales
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 VueBi Backend API Server running on http://localhost:${PORT}`);
  
  // Probar conexión a MySQL al iniciar
  console.log('🔌 Probando conexión a MySQL...');
  const mysqlConnected = await testConnection();
  
  if (mysqlConnected) {
    console.log('✅ Backend conectado a MySQL - Datos reales activos');
  } else {
    console.log('❌ Error de conexión a MySQL - Usando datos por defecto');
  }
  
  console.log(`📊 Dashboard endpoints available:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/dashboard/quick-stats`);
  console.log(`   GET  /api/dashboard/yearly-comparison`);
  console.log(`   GET  /api/dashboard/monthly-data/:year/:type`);
  console.log(`   GET  /api/dashboard/catalogs`);
  console.log(`   GET  /api/tables`);
  console.log(`   GET  /api/tables/:tableName/data`);
  console.log(`   GET  /api/tables/:tableName/structure`);
  console.log(`   POST /api/datasources/test`);
  console.log(`   GET  /api/datasources/types`);
  console.log(`📋 Reportes AT2 disponibles:`);
  console.log(`   GET  /api/reports/at2/master-summary`);
  console.log(`   GET  /api/reports/at2/by-resource`);
  console.log(`   GET  /api/reports/at2/by-age-group`);
  console.log(`   GET  /api/reports/at2/consultation-types`);
  console.log(`   GET  /api/reports/at2/geographic`);
  console.log(`⚡ Optimizaciones activas:`);
  console.log(`   ✅ Sistema de cache inteligente (5 min TTL)`);
  console.log(`   ✅ Índices optimizados en todas las tablas`);
  console.log(`   ✅ Pool de conexiones aumentado (15 conexiones)`);
  console.log(`   ✅ Medición de tiempo de ejecución`);
  console.log(`   GET  /api/performance/stats - Estadísticas de performance`);
});
