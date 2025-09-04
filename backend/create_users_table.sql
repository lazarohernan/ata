-- Crear tabla de usuarios para el sistema AT2
-- Ejecutar este script en la base de datos sesal_historico

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100),
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices para optimización
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuarios de prueba
-- NOTA: En producción, las contraseñas deben ser hasheadas correctamente
-- Estas son solo para desarrollo/pruebas

INSERT INTO `users` (`username`, `password_hash`, `name`, `email`, `role`, `is_active`) VALUES
('admin', '$2b$10$rOzHhXH7kP4JQlUQw.7GseJcXyF8K9Nz8mQcZJG1J8y9GdQZ1Q7q', 'Administrador del Sistema', 'admin@sesal.hn', 'admin', 1),
('usuario', '$2b$10$Z7X8Y9W0V1U2T3S4R5Q6P7O8N9M0L1K2J3I4H5G6F7E8D9C0B1A2', 'Usuario Regular', 'usuario@sesal.hn', 'user', 1),
('analista', '$2b$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', 'Analista de Datos', 'analista@sesal.hn', 'user', 1);

-- Verificar que los usuarios se insertaron correctamente
SELECT id, username, name, role, is_active, created_at FROM users;
