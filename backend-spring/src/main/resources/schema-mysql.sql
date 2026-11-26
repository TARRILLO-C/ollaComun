-- ====================================================================================
-- ECOFOOD MVP - MIGRACIÓN DE BASE DE DATOS MYSQL 8+
-- Esquema relacional optimizado para Bodegas, Comedores Populares y Donaciones
-- ====================================================================================

-- 1. Tabla de Usuarios (Bodegas y Comedores Populares)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_uuid` VARCHAR(64) NOT NULL UNIQUE,
    `role` VARCHAR(20) NOT NULL COMMENT 'BODEGA | COMEDOR',
    `doc_type` VARCHAR(10) NOT NULL COMMENT 'DNI | RUC',
    `doc_number` VARCHAR(20) NOT NULL UNIQUE,
    `pin_hash` VARCHAR(255) NOT NULL,
    `business_name` VARCHAR(150) NOT NULL,
    `representative_name` VARCHAR(150),
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100),
    `address_line` VARCHAR(255) NOT NULL,
    `district` VARCHAR(100),
    `facade_photo_url` VARCHAR(500),
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `location` POINT SRID 4326 COMMENT 'Coordenada espacial WGS84 para cálculos GIS',
    `is_verified` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para búsqueda rápida y georreferenciación
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_lat_lng` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Donaciones
CREATE TABLE IF NOT EXISTS `donations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `donation_uuid` VARCHAR(64) NOT NULL UNIQUE,
    `idempotency_key` VARCHAR(64),
    `donor_id` VARCHAR(64) NOT NULL COMMENT 'UUID del bodeguero donante',
    `reserved_by_comedor_id` VARCHAR(64) NULL COMMENT 'UUID del comedor popular que apartó',
    `title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL COMMENT 'FRUTAS_VERDURAS | PANADERIA | ABARROTES | PREPARADOS',
    `quantity_value` DECIMAL(8, 2) NOT NULL DEFAULT 5.00,
    `unit_measure` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `location` POINT SRID 4326 NOT NULL COMMENT 'Punto geoespacial Point(lon, lat) SRID 4326',
    `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' 
        COMMENT 'AVAILABLE | RESERVED | DELIVERED | EXPIRED | CANCELLED | UNCOLLECTED',
    `intentos_fallidos_pin` INT NOT NULL DEFAULT 0,
    `pin_bloqueado` BOOLEAN NOT NULL DEFAULT FALSE,
    `pickup_start_at` TIMESTAMP NOT NULL,
    `pickup_end_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Claves foráneas o referencias lógicas
    INDEX `idx_donations_donor` (`donor_id`),
    INDEX `idx_donations_reserved_comedor` (`reserved_by_comedor_id`),
    INDEX `idx_donations_idempotency` (`idempotency_key`, `created_at`),
    
    -- ÍNDICES COMPUESTOS CLAVE:
    -- 1) Filtro rápido de ciclo de vida y vigencia
    INDEX `idx_donations_status_pickup_end` (`status`, `pickup_end_at`),
    
    -- 2) Filtro compuesto de Bounding Box + Estado para consultas de radar
    INDEX `idx_donations_radar_bbox` (`status`, `latitude`, `longitude`, `pickup_end_at`),
    
    -- 3) Índice espacial SPATIAL para ST_Distance_Sphere / ST_Within
    SPATIAL INDEX `idx_donations_spatial_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Entregas (Validación de PIN / QR)
CREATE TABLE IF NOT EXISTS `deliveries` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `delivery_uuid` VARCHAR(64) NOT NULL UNIQUE,
    `donation_id` VARCHAR(64) NOT NULL,
    `beneficiary_id` VARCHAR(64) NOT NULL COMMENT 'UUID del comedor popular',
    `pickup_pin` VARCHAR(10) NOT NULL,
    `qr_auth_token` VARCHAR(255) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING_PICKUP' COMMENT 'PENDING_PICKUP | COMPLETED | CANCELLED',
    `reserved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `delivered_at` TIMESTAMP NULL,

    INDEX `idx_deliveries_donation` (`donation_id`),
    INDEX `idx_deliveries_beneficiary` (`beneficiary_id`),
    INDEX `idx_deliveries_pin_status` (`pickup_pin`, `status`),
    INDEX `idx_deliveries_qr_status` (`qr_auth_token`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Trigger opcional para sincronizar la columna POINT automáticamente desde latitude y longitude si se inserta mediante JPA clásico
DELIMITER $$
CREATE TRIGGER `trg_donations_before_insert_location`
BEFORE INSERT ON `donations`
FOR EACH ROW
BEGIN
    IF NEW.location IS NULL AND NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326);
    END IF;
END$$

CREATE TRIGGER `trg_donations_before_update_location`
BEFORE UPDATE ON `donations`
FOR EACH ROW
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326);
    END IF;
END$$
DELIMITER ;
