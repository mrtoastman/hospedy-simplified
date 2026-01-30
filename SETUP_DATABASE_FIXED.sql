-- ============================================
-- HOSPEDY WHATSAPP - DATABASE SETUP CORREGIDO
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Verificar si tenemos organizaciones
SELECT id, name FROM organizations LIMIT 5;

-- 2. Crear las tablas de WhatsApp si no existen
-- (Copiando desde sql/005_whatsapp_bot.sql)

-- Tabla para configuración de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Configuración de Evolution API / Baileys
    instance_name VARCHAR(100) NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT,
    phone_number VARCHAR(20),

    -- Estado  
    status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, connecting
    last_connected_at TIMESTAMPTZ,

    -- Configuración del bot
    bot_enabled BOOLEAN DEFAULT true,
    welcome_message TEXT DEFAULT 'Hola! Soy el asistente virtual. ¿En qué puedo ayudarte?',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id)
);

-- Tabla para información turística  
CREATE TABLE IF NOT EXISTS tourist_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Ubicación
    city VARCHAR(100) NOT NULL DEFAULT 'Cartago',
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',

    -- Categoría
    category VARCHAR(50) NOT NULL, -- restaurant, attraction, transport, emergency, tip

    -- Contenido
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    website TEXT,

    -- Estado
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna priority si no existe (para tablas existentes)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tourist_info' AND column_name='priority') THEN
        ALTER TABLE tourist_info ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;
END $$;

-- Tabla para mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Identificación
    phone_number VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100),

    -- Mensaje
    direction VARCHAR(10) NOT NULL, -- 'incoming', 'outgoing'
    message_text TEXT,

    -- Estado
    is_bot_response BOOLEAN DEFAULT false,
    whatsapp_message_id VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para respuestas automáticas del bot
CREATE TABLE IF NOT EXISTS bot_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Trigger
    trigger_value TEXT NOT NULL,
    response_text TEXT NOT NULL,

    -- Estado
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para mapeo de LIDs (WhatsApp Business)
CREATE TABLE IF NOT EXISTS whatsapp_lid_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lid VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    push_name VARCHAR(100),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar mapeo conocido (tu número) - usando UPSERT para evitar duplicados
INSERT INTO whatsapp_lid_mappings (lid, phone_number, push_name)
VALUES ('124803210051722', '573113225050', 'Juan David')
ON CONFLICT (lid) DO UPDATE SET
  phone_number = EXCLUDED.phone_number,
  push_name = EXCLUDED.push_name,
  updated_at = NOW();

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tourist_info_category ON tourist_info(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lid_mappings_lid ON whatsapp_lid_mappings(lid);

-- 3. Limpiar datos anteriores e insertar datos frescos de Cartago
-- Obtener el primer organization_id disponible
DO $$
DECLARE
    org_uuid UUID;
BEGIN
    SELECT id INTO org_uuid FROM organizations LIMIT 1;
    
    IF org_uuid IS NOT NULL THEN
        -- Limpiar datos anteriores para evitar duplicados
        DELETE FROM tourist_info WHERE organization_id = org_uuid;
        
        -- Restaurantes de Cartago
        INSERT INTO tourist_info (organization_id, category, name, description, address, priority) VALUES
        (org_uuid, 'restaurant', 'Restaurante El Rancherito', 'Comida típica vallecaucana, famoso por su sancocho y bandeja paisa', 'Carrera 5 #10-45, Centro', 5),
        (org_uuid, 'restaurant', 'Asadero El Portal', 'Carnes a la brasa, chorizos y costillas', 'Avenida Principal #25-30', 4),
        (org_uuid, 'restaurant', 'Heladería Ventolini', 'Helados artesanales y postres', 'Centro Comercial', 3),
        (org_uuid, 'restaurant', 'Café Punto G', 'Café especializado y postres caseros', 'Calle 14 #6-23', 3),
        (org_uuid, 'restaurant', 'Pizza Express Cartago', 'Pizzas artesanales y comida italiana', 'Carrera 6 #12-45', 3);
        
        -- Atracciones
        INSERT INTO tourist_info (organization_id, category, name, description, address, priority) VALUES
        (org_uuid, 'attraction', 'Casa del Virrey', 'Museo histórico en una casona colonial del siglo XVIII', 'Calle 13 #4-29, Centro Histórico', 5),
        (org_uuid, 'attraction', 'Catedral de Nuestra Señora del Carmen', 'Iglesia principal de Cartago, arquitectura neoclásica', 'Parque Bolívar, Centro', 4),
        (org_uuid, 'attraction', 'Parque de la Caña', 'Parque temático con réplicas de la cultura vallecaucana', 'Vía Cartago-Pereira, Km 2', 3),
        (org_uuid, 'attraction', 'Parque Bolívar', 'Plaza principal de Cartago, ideal para caminar', 'Centro de Cartago', 4),
        (org_uuid, 'attraction', 'Mirador Alto del Rey', 'Vista panorámica de Cartago y el Valle del Cauca', 'Sector Alto del Rey', 3);
        
        -- Transporte
        INSERT INTO tourist_info (organization_id, category, name, description, phone, priority) VALUES
        (org_uuid, 'transport', 'Taxis Cartago', 'Servicio de taxi 24 horas', '310 555 1234', 5),
        (org_uuid, 'transport', 'Terminal de Transporte', 'Terminal de buses interdepartamentales', '(602) 123-4567', 4),
        (org_uuid, 'transport', 'Uber y inDrive', 'Apps de transporte disponibles en la ciudad', NULL, 4),
        (org_uuid, 'transport', 'Buses Urbanos', 'Transporte público local', '(602) 456-7890', 3);
        
        -- Emergencias
        INSERT INTO tourist_info (organization_id, category, name, description, phone, priority) VALUES
        (org_uuid, 'emergency', 'Policía Nacional', 'Emergencias policiales', '123', 5),
        (org_uuid, 'emergency', 'Hospital San Juan de Dios', 'Hospital público principal', '(602) 123-4567', 4),
        (org_uuid, 'emergency', 'Bomberos', 'Cuerpo de bomberos', '119', 3),
        (org_uuid, 'emergency', 'Cruz Roja', 'Emergencias médicas', '132', 4),
        (org_uuid, 'emergency', 'Defensa Civil', 'Emergencias y desastres', '144', 3);
        
        -- Tips locales
        INSERT INTO tourist_info (organization_id, category, name, description, priority) VALUES
        (org_uuid, 'tip', 'Clima en Cartago', 'Temperatura promedio 24-30°C. Época seca: Dic-Feb, Jun-Ago. Lleva siempre sombrilla', 5),
        (org_uuid, 'tip', 'Dinero y Pagos', 'Moneda: Peso Colombiano (COP). Muchos locales aceptan Nequi/Daviplata. Lleva efectivo para tiendas pequeñas', 4),
        (org_uuid, 'tip', 'Mejor época para visitar', 'Todo el año es bueno, pero evita Oct-Nov (lluvias fuertes). Dic-Ene ideal', 3),
        (org_uuid, 'tip', 'Transporte local', 'Centro es caminable. Para Pereira: 30 min en bus. Para Manizales: 1 hora', 3),
        (org_uuid, 'tip', 'Gastronomía típica', 'Prueba: sancocho vallecaucano, empanadas, chuleta valluna, y café local', 4);
        
        RAISE NOTICE 'Datos de Cartago insertados para organización: %', org_uuid;
        RAISE NOTICE 'Total registros insertados: %', (SELECT count(*) FROM tourist_info WHERE organization_id = org_uuid);
    ELSE
        RAISE NOTICE 'No se encontró ninguna organización. Crear una primero.';
    END IF;
END $$;

-- 4. Verificar que todo está creado
SELECT 'whatsapp_config' as tabla, count(*) as registros FROM whatsapp_config
UNION ALL
SELECT 'tourist_info' as tabla, count(*) as registros FROM tourist_info
UNION ALL  
SELECT 'whatsapp_messages' as tabla, count(*) as registros FROM whatsapp_messages
UNION ALL
SELECT 'whatsapp_lid_mappings' as tabla, count(*) as registros FROM whatsapp_lid_mappings
ORDER BY tabla;

-- 5. Mostrar información turística insertada por categoría
SELECT category, count(*) as cantidad FROM tourist_info GROUP BY category ORDER BY category;

-- 6. Verificar que la columna priority existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tourist_info' 
ORDER BY ordinal_position;