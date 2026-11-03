-- =====================================================================
-- EcoFood MVP - Script de Inicialización de Base de Datos para MySQL 8+
-- =====================================================================

-- 1. Crear la base de datos con soporte UTF-8 completo para tildes y caracteres peruanos
CREATE DATABASE IF NOT EXISTS ecofood_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. Seleccionar la base de datos
USE ecofood_db;

-- Nota:
-- Gracias a la configuración 'spring.jpa.hibernate.ddl-auto=update' en application.properties,
-- Hibernate se encargará de crear automáticamente todas las tablas relacionales
-- (users, donations, deliveries) con sus respectivos campos espaciales (POINT / GEOMETRY)
-- al ejecutar la aplicación Spring Boot.
