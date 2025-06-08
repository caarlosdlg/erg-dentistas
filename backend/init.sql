-- Archivo de inicialización para PostgreSQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuraciones adicionales para la base de datos
ALTER DATABASE dental_erp_db SET timezone TO 'America/Mexico_City';

-- Mensaje de confirmación
\echo 'Base de datos dental_erp_db inicializada correctamente';
