const { executeQuery } = require('./mysql-config');
const fs = require('fs');
const path = require('path');

async function setupAuthTables() {
  try {
    console.log('🔧 Configurando tabla de usuarios...');

    // Crear tabla primero
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100),
        \`role\` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`last_login\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const tableResult = await executeQuery(createTableSQL);

    if (!tableResult.success) {
      console.error('❌ Error al crear tabla:', tableResult.error);
      return;
    }

    console.log('✅ Tabla de usuarios creada exitosamente');

    // Insertar usuarios de prueba con contraseñas simples para desarrollo
    const insertUsersSQL = `
      INSERT IGNORE INTO \`users\` (\`username\`, \`password_hash\`, \`name\`, \`email\`, \`role\`, \`is_active\`) VALUES
      ('admin', 'admin123', 'Administrador del Sistema', 'admin@sesal.hn', 'admin', 1),
      ('usuario', 'user123', 'Usuario Regular', 'usuario@sesal.hn', 'user', 1),
      ('analista', 'analista123', 'Analista de Datos', 'analista@sesal.hn', 'user', 1);
    `;

    const insertResult = await executeQuery(insertUsersSQL);

    if (!insertResult.success) {
      console.error('❌ Error al insertar usuarios:', insertResult.error);
      return;
    }

    console.log('✅ Usuarios insertados exitosamente');

    // Verificar que los usuarios se crearon
    const usersResult = await executeQuery('SELECT id, username, name, role, is_active FROM users');

    if (usersResult.success) {
      console.log('👥 Usuarios en la base de datos:');
      usersResult.data.forEach(user => {
        console.log(`  - ${user.username} (${user.name}) - ${user.role}`);
      });
    }

    console.log('\n🔐 Credenciales de prueba:');
    console.log('  Admin: admin / admin123');
    console.log('  Usuario: usuario / user123');
    console.log('  Analista: analista / analista123');

  } catch (error) {
    console.error('❌ Error en setup:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupAuthTables();
}

module.exports = { setupAuthTables };
