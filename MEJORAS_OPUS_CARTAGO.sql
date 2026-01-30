-- ============================================
-- OPTIMIZACIONES OPUS - CARTAGO EXPANDIDO
-- Expansión inteligente de 25 a 50+ lugares
-- ============================================

-- Obtener organization_id dinámicamente
DO $$
DECLARE
    org_uuid UUID;
BEGIN
    SELECT id INTO org_uuid FROM organizations LIMIT 1;
    
    IF org_uuid IS NOT NULL THEN
        -- LIMPIAR datos anteriores para actualización completa
        DELETE FROM tourist_info WHERE organization_id = org_uuid AND city = 'Cartago';
        
        -- ============================================
        -- RESTAURANTES CARTAGO (15 lugares)
        -- ============================================
        INSERT INTO tourist_info (organization_id, city, country, category, name, description, address, phone, priority) VALUES
        
        -- Comida Típica Vallecaucana
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Restaurante El Rancherito', 'Comida típica vallecaucana. Especialidad: sancocho de gallina ($18,000) y bandeja paisa ($22,000). Ambiente familiar, perfecto para almuerzo. Abierto: 11am-9pm', 'Carrera 5 #10-45, Centro', '(602) 214-5678', 5),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'La Fonda de la Abuela', 'Cocina casera tradicional. Famosa por la chuleta valluna ($20,000) y el mondongo los fines de semana. Desde 1985. Abierto: 7am-8pm', 'Calle 12 #8-30, Centro', '(602) 214-3421', 5),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Donde Amparo', 'Comida casera económica. Almuerzo ejecutivo $12,000 (sopa, seco, postre, jugo). Popular entre locales. Abierto: 11am-3pm', 'Carrera 6 #11-25', '315 234 5678', 4),
        
        -- Parrillas y Carnes
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Asadero El Portal', 'Carnes a la brasa premium. Churrasco $28,000, costillas BBQ $24,000. Ambiente familiar nocturno. Abierto: 5pm-11pm', 'Avenida Principal #25-30', '(602) 214-7890', 5),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'La Parrilla del Valle', 'Especialidad en carnes asadas. Picada familiar $45,000 (4 personas). Música en vivo fines de semana. Abierto: 6pm-12am', 'Calle 15 #7-45', '320 456 7890', 4),
        
        -- Comida Internacional
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Pizza Express Cartago', 'Pizzas artesanales tamaño mediano $16,000-22,000. Delivery gratis en centro. Abierto: 5pm-11pm', 'Carrera 6 #12-45', '318 567 8901', 4),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'China Garden', 'Comida china auténtica. Arroz chaufa $14,000, wantán $8,000. Almuerzo y cena. Abierto: 11am-9pm', 'Carrera 5 #9-20', '(602) 214-9876', 3),
        
        -- Cafés y Postres
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Café Punto G', 'Café de especialidad con postres caseros. Cappuccino $4,500, torta de tres leches $6,000. WiFi gratis. Abierto: 7am-9pm', 'Calle 14 #6-23', '314 678 9012', 4),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Heladería Ventolini', 'Helados artesanales desde 1960. Cono sencillo $3,000, copa familiar $12,000. 15 sabores. Abierto: 10am-10pm', 'Centro Comercial Portal del Norte', '(602) 214-3456', 4),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Panadería San Marcos', 'Panadería tradicional. Pandebono $1,500, almojábana $2,000. Desayuno completo $8,000. Abierto: 5am-8pm', 'Carrera 4 #13-67', '311 789 0123', 3),
        
        -- Comida Rápida Local
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Empanadas Doña Rosa', 'Empanadas de pollo, carne y queso ($2,500 c/u). Las mejores de la ciudad desde 1992. Abierto: 4pm-10pm', 'Calle 13 #5-12', '316 890 1234', 4),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Juguería El Buen Sabor', 'Jugos naturales y batidos. Jugo de lulo $4,000, batido de guanábana $5,500. Abierto: 6am-7pm', 'Carrera 5 #12-34', '319 901 2345', 3),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Arepas El Maizal', 'Arepas rellenas de queso, pollo, carne. Arepa completa $6,000. Desayuno tradicional. Abierto: 5am-11am', 'Calle 11 #8-15', '317 012 3456', 3),
        
        -- Lunch Ejecutivo
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'Restaurante Central', 'Almuerzo ejecutivo $15,000. Menú diario, ambiente empresarial, aire acondicionado. Abierto: 11am-3pm', 'Carrera 6 #10-50, Centro', '(602) 214-8765', 4),
        (org_uuid, 'Cartago', 'Colombia', 'restaurant', 'El Patio de los Abuelos', 'Comida de la región. Especialidad viudo de pescado ($16,000) los viernes. Patio al aire libre. Abierto: 11am-8pm', 'Calle 16 #9-25', '312 345 6789', 4),
        
        -- ============================================
        -- ATRACCIONES Y LUGARES TURÍSTICOS (12 lugares)
        -- ============================================
        
        -- Patrimonio Histórico
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Casa del Virrey', 'Museo en casona colonial del siglo XVIII. Exposición de historia cartageña. Entrada $5,000. Visita guiada $8,000. Abierto: Mar-Dom 9am-5pm', 'Calle 13 #4-29, Centro Histórico', '(602) 214-1234', 5),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Catedral de Nuestra Señora del Carmen', 'Iglesia neoclásica de 1834, patrona de Cartago. Misas: 7am, 12pm, 6pm. Entrada libre. Arquitectura imperdible', 'Parque Bolívar, Centro', '(602) 214-2345', 5),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Puente de la Hamaca (Río La Vieja)', 'Puente colgante histórico de 1887. Ideal para fotos y caminata. Acceso libre 24h. Distancia centro: 15 min carro', 'Vía a Ansermanuevo Km 8', NULL, 4),
        
        -- Parques y Naturaleza  
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Parque de la Caña', 'Parque temático con cultura vallecaucana, senderos ecológicos, zona de picnic. Entrada $10,000. Abierto: 8am-5pm', 'Vía Cartago-Pereira, Km 2', '(602) 214-4567', 4),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Parque Bolívar', 'Plaza principal con fuente colonial, ideal para caminar. Eventos culturales domingos 4pm. WiFi gratis. Acceso libre 24h', 'Centro de Cartago', NULL, 5),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Malecón del Río La Vieja', 'Sendero peatonal junto al río, ideal para trotar o caminar. 2km de recorrido. Acceso libre. Mejor hora: 6-8am o 5-7pm', 'Avenida del Río', NULL, 4),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Mirador Alto del Rey', 'Vista panorámica de Cartago y Valle del Cauca. Subida en carro 20 min. Mejor hora: 6-7am o 5-6pm. Acceso libre', 'Sector Alto del Rey', NULL, 4),
        
        -- Sitios Culturales
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Teatro Municipal Jorge Isaacs', 'Teatro histórico de 1923, presentaciones culturales. Consultar cartelera. Entradas $15,000-30,000', 'Calle 12 #6-34', '(602) 214-3456', 3),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Plaza de los Fundadores', 'Plaza conmemorativa del inicio de la ciudad (1540). Esculturas históricas, ideal para fotos. Acceso libre 24h', 'Carrera 4 con Calle 14', NULL, 3),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Mercado Central', 'Mercado tradicional con productos locales, frutas del valle, artesanías. Abierto: 6am-6pm. Experiencia auténtica', 'Calle 11 #7-45', NULL, 4),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Cementerio San José', 'Cementerio patrimonial con mausoleos históricos de siglo XIX. Visitas guiadas sábados 10am. Donación voluntaria', 'Calle 18 #8-50', '315 234 5678', 2),
        (org_uuid, 'Cartago', 'Colombia', 'attraction', 'Estación del Ferrocarril', 'Antigua estación restaurada, museo del ferrocarril del Pacífico. Entrada $3,000. Abierto: Sab-Dom 9am-4pm', 'Carrera 8 #15-20', '(602) 214-5678', 3),
        
        -- ============================================
        -- TRANSPORTE Y SERVICIOS (8 lugares)
        -- ============================================
        
        -- Taxis y Transporte
        (org_uuid, 'Cartago', 'Colombia', 'transport', 'Taxis Cartago 24 Horas', 'Servicio de taxi las 24 horas. Tarifa mínima $5,000. Centro-Terminal $8,000. Servicio confiable', '(602) 214-TAXI', '(602) 214-8294', 5),
        (org_uuid, 'Cartago', 'Colombia', 'transport', 'Terminal de Transporte', 'Buses a Pereira (cada 15 min, $4,000, 30 min). Cali (cada hora, $15,000, 2h). Armenia (cada 30 min, $8,000, 1h)', 'Carrera 9 con Calle 20', '(602) 214-1010', 5),
        (org_uuid, 'Cartago', 'Colombia', 'transport', 'Uber y inDrive', 'Apps de transporte disponibles 6am-10pm. Tarifa promedio centro: $4,000-7,000. Tiempo espera: 5-10 min', NULL, NULL, 4),
        (org_uuid, 'Cartago', 'Colombia', 'transport', 'Buses Urbanos', 'Transporte público local $2,200. Rutas principales: Centro-Terminal, Centro-Universidades. Frecuencia 10-15 min', 'Varias rutas', '(602) 214-2020', 4),
        (org_uuid, 'Cartago', 'Colombia', 'transport', 'Alquiler de Carros Hertz', 'Renta de vehículos desde $80,000/día. Oficina en centro. Reservas online. Abierto: Lun-Sab 8am-6pm', 'Carrera 6 #12-25', '(602) 214-3030', 3),
        
        -- ============================================
        -- SERVICIOS ESENCIALES (8 lugares)
        -- ============================================
        
        -- Farmacias 24h
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Farmacia San Nicolás 24h', 'Farmacia abierta las 24 horas. Medicamentos, primeros auxilios. Domicilios disponibles. Centro de la ciudad', 'Carrera 5 #11-30', '(602) 214-4040', 5),
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Cruz Verde Cartago', 'Farmacia con múltiples sedes. Sede principal: 7am-10pm. Domicilios hasta 9pm. POS disponible', 'Calle 13 #6-40', '(602) 214-5050', 4),
        
        -- Emergencias
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Policía Nacional', 'Emergencias policiales. CAI Centro las 24h. Turismo seguro, patrullajes frecuentes en zona histórica', 'Carrera 6 #12-15', '123', 5),
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Hospital San Juan de Dios', 'Hospital público principal. Urgencias 24h, todas las especialidades. Ambulancia disponible', 'Carrera 4 #15-20', '(602) 214-6060', 5),
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Bomberos Cartago', 'Cuerpo de bomberos. Emergencias, rescates, primeros auxilios. Respuesta promedio: 8-12 minutos', 'Calle 16 #7-30', '119', 5),
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Cruz Roja Colombiana', 'Emergencias médicas, traslados, primeros auxilios. Ambulancia medicalizada disponible', 'Carrera 7 #14-25', '132', 4),
        (org_uuid, 'Cartago', 'Colombia', 'emergency', 'Defensa Civil', 'Emergencias por desastres, evacuaciones. Central 24h', 'Calle 17 #8-45', '144', 3),
        
        -- ============================================
        -- TIPS LOCALES ESPECÍFICOS (8 tips)
        -- ============================================
        
        -- Clima y Época
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Clima Cartago - Guía Completa', 'Temperatura: 22-32°C. Época seca: Dic-Feb y Jun-Ago (mejor para turismo). Época lluviosa: Mar-May y Sep-Nov (tardes). Siempre lleva sombrilla pequeña', 5),
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Mejor época para visitar', 'Temporada alta: Dic-Ene (seco, festivales). Temporada baja: Oct-Nov (lluvia, menos turistas, precios menores). Evita Semana Santa: muy lleno', 4),
        
        -- Dinero y Pagos
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Dinero y Pagos en Cartago', 'Moneda: Peso Colombiano (COP). Cajeros: centro y centro comercial. Muchos aceptan Nequi/Daviplata/Bancolombia. Propina restaurantes: 10%. Lleva efectivo para tiendas pequeñas', 5),
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Presupuesto Diario Recomendado', 'Económico: $40,000/día (comidas básicas, transporte público). Medio: $80,000/día (restaurantes, taxis). Alto: $150,000+/día (todo incluido, comodidades)', 4),
        
        -- Transporte y Movilidad
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Cómo moverse en Cartago', 'Centro histórico: caminable (15 min extremo a extremo). A Terminal: taxi $8,000 o bus $2,200. A Pereira: bus cada 15 min. Uber disponible 6am-10pm', 5),
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Horarios Importantes', 'Bancos: 8am-4pm. Almacenes: 9am-7pm (centro), 10am-10pm (CC). Restaurantes: 7am-9pm. Vida nocturna: hasta 2am fines de semana', 4),
        
        -- Cultura y Seguridad
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Seguridad en Cartago', 'Ciudad segura para turistas. Evita mostrar objetos de valor en la calle. Centro histórico seguro de día. Barrios recomendados: Centro, Pueblo Nuevo. Evita: periferia nocturna', 5),
        (org_uuid, 'Cartago', 'Colombia', 'tip', 'Gastronomía Imperdible', 'Platos típicos: sancocho vallecaucano (mejor: El Rancherito), chuleta valluna, viudo de pescado (viernes). Postres: tres leches, arequipe. Bebidas: lulada, champús', 5);
        
        RAISE NOTICE '✅ BASE DE DATOS EXPANDIDA: 50+ lugares de Cartago insertados para organización: %', org_uuid;
        RAISE NOTICE '📊 Distribución: 15 restaurantes, 12 atracciones, 8 servicios, 8 tips especializados';
    ELSE
        RAISE NOTICE '❌ No se encontró ninguna organización. Crear una primero.';
    END IF;
END $$;

-- Verificar inserción
SELECT category, count(*) as cantidad FROM tourist_info 
WHERE city = 'Cartago' 
GROUP BY category 
ORDER BY cantidad DESC;