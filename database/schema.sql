-- =====================================================================
-- EcoFood MVP - Esquema de Base de Datos PostgreSQL con PostGIS
-- Fase 1: Arquitectura y Modelado Relacional Geoespacial
-- =====================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumeraciones para integridad de dominio
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('BODEGA', 'COMEDOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('DNI', 'RUC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_category AS ENUM (
        'PANADERIA',
        'FRUTAS_VERDURAS',
        'ABARROTES',
        'LACTEOS',
        'COMIDA_PREPARADA',
        'OTROS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM (
        'AVAILABLE',      -- Disponible para ser reservada
        'RESERVED',       -- Reservada por un comedor
        'DELIVERED',      -- Entregada y cerrada con QR/PIN
        'EXPIRED',        -- Pasó el horario límite de recojo
        'CANCELLED'       -- Cancelada por la bodega
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'PENDING_PICKUP', -- En espera de recojo
        'COMPLETED',      -- Handshake exitoso (QR escaneado o PIN validado)
        'NO_SHOW',        -- Comedor no asistió dentro del horario
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla: USERS (Bodegas y Comedores Populares)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    doc_type document_type NOT NULL,
    doc_number VARCHAR(20) NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,          -- "Bodega Doña Rosa" o "Comedor Santa Rosa"
    representative_name VARCHAR(120) NOT NULL,    -- Nombre completo del responsable
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    district VARCHAR(80) NOT NULL,                -- Ej. "San Juan de Lurigancho", "Comas", "Surquillo"
    city VARCHAR(80) NOT NULL DEFAULT 'Lima',
    facade_photo_url TEXT,                        -- Foto de fachada para validación antifraude
    is_verified BOOLEAN DEFAULT FALSE,           -- Aprobación de identidad
    -- PostGIS: Coordenadas geoespaciales (Longitud, Latitud) en WGS 84
    location GEOGRAPHY(Point, 4326) NOT NULL,
    fcm_push_token TEXT,                          -- Token para alertas push en móviles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices geoespaciales y de consulta rápida
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_district ON users (district);

-- 4. Tabla: DONATIONS (Publicadas por Bodegas)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,                  -- Ej: "Caja de panes frescos y plátanos maduros"
    category donation_category NOT NULL,
    description TEXT,
    quantity_value NUMERIC(8, 2) NOT NULL,        -- Ej: 15.5
    unit_measure VARCHAR(20) NOT NULL,            -- "kg", "raciones", "paquetes", "cajas"
    pickup_start_at TIMESTAMPTZ NOT NULL,         -- Horario inicio recojo
    pickup_end_at TIMESTAMPTZ NOT NULL,           -- Horario fin recojo (máximo)
    status donation_status DEFAULT 'AVAILABLE',
    photo_url TEXT,                               -- Foto referencial del alimento
    -- Snapshot de ubicación para evitar JOINs innecesarios en búsquedas espaciales masivas
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_pickup_window CHECK (pickup_end_at > pickup_start_at)
);

CREATE INDEX IF NOT EXISTS idx_donations_location ON donations USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations (status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations (donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_pickup_end ON donations (pickup_end_at);

-- 5. Tabla: DELIVERIES (Handshake y ciclo de vida de la reserva/entrega)
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL UNIQUE REFERENCES donations(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pickup_pin VARCHAR(6) NOT NULL,               -- PIN de 6 dígitos para validación sin cámara
    qr_hash_token VARCHAR(255) NOT NULL UNIQUE,   -- Hash firmado que contiene el código QR
    status delivery_status DEFAULT 'PENDING_PICKUP',
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    validation_method VARCHAR(20),                -- 'QR_SCAN' o 'PIN_INPUT'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_receiver_id ON deliveries (receiver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_donation_id ON deliveries (donation_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_pickup_pin ON deliveries (pickup_pin);

-- 6. Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_donations_updated_at ON donations;
CREATE TRIGGER trigger_donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_deliveries_updated_at ON deliveries;
CREATE TRIGGER trigger_deliveries_updated_at
BEFORE UPDATE ON deliveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 7. Función Geoespacial PostGIS: Buscar donaciones activas por proximidad
-- Calcula la distancia en metros y devuelve donaciones disponibles
-- =====================================================================
CREATE OR REPLACE FUNCTION get_nearby_donations(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION DEFAULT 5000 -- 5 km por defecto
)
RETURNS TABLE (
    donation_id UUID,
    title VARCHAR,
    category donation_category,
    quantity_value NUMERIC,
    unit_measure VARCHAR,
    pickup_start_at TIMESTAMPTZ,
    pickup_end_at TIMESTAMPTZ,
    donor_business_name VARCHAR,
    donor_phone VARCHAR,
    donor_address VARCHAR,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id AS donation_id,
        d.title,
        d.category,
        d.quantity_value,
        d.unit_measure,
        d.pickup_start_at,
        d.pickup_end_at,
        u.business_name AS donor_business_name,
        u.phone AS donor_phone,
        u.address_line AS donor_address,
        ROUND(ST_Distance(d.location, ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography)::numeric, 1)::DOUBLE PRECISION AS distance_meters
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    WHERE d.status = 'AVAILABLE'
      AND d.pickup_end_at > NOW()
      AND ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography, p_radius_meters)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
