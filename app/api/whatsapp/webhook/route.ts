import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai-bot'
import * as crypto from 'crypto'

// Cliente de Supabase con service role para webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Flag para usar IA (requiere ANTHROPIC_API_KEY)
const USE_AI_BOT = !!process.env.ANTHROPIC_API_KEY

// =============================================================================
// SECURITY: Verificación del webhook de WhatsApp/Evolution API
// =============================================================================
function verifyWebhookSecret(request: NextRequest, body: string): boolean {
  const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET
  
  // Si no hay secret configurado, denegar acceso (fail secure)
  if (!WEBHOOK_SECRET) {
    console.error('SECURITY: WHATSAPP_WEBHOOK_SECRET not configured')
    return false
  }
  
  // Método 1: Verificar token en query params (Evolution API style)
  const { searchParams } = new URL(request.url)
  const tokenParam = searchParams.get('token') || searchParams.get('verify_token')
  if (tokenParam === WEBHOOK_SECRET) {
    return true
  }
  
  // Método 2: Verificar header x-webhook-secret
  const headerSecret = request.headers.get('x-webhook-secret')
  if (headerSecret === WEBHOOK_SECRET) {
    return true
  }
  
  // Método 3: Verificar HMAC signature (si Evolution API lo envía)
  const signature = request.headers.get('x-signature') || 
                    request.headers.get('x-hub-signature-256')
  if (signature && body) {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    // Comparación segura contra timing attacks
    const sigBuffer = Buffer.from(signature.replace('sha256=', ''))
    const expectedBuffer = Buffer.from(expectedSignature)
    
    if (sigBuffer.length === expectedBuffer.length && 
        crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return true
    }
  }
  
  return false
}

// Webhook para recibir mensajes de Evolution API v1.7.5
export async function POST(request: NextRequest) {
  // Leer el body como texto para verificación de firma
  const bodyText = await request.text()
  
  // SECURITY: Verificar webhook secret
  if (!verifyWebhookSecret(request, bodyText)) {
    console.warn('SECURITY: Unauthorized POST to /api/whatsapp/webhook', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    })
    return NextResponse.json(
      { error: 'Forbidden', message: 'Invalid or missing webhook secret' },
      { status: 403 }
    )
  }
  
  try {
    const payload = JSON.parse(bodyText)

    // Evolution API v1.7.5 envía el evento en diferentes formatos
    const event = payload.event || payload.type || 'unknown'

    // Manejar diferentes eventos
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      await handleIncomingMessage(payload)
    } else if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      await handleConnectionUpdate(payload)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function handleIncomingMessage(payload: any) {
  // Evolution API v1.7.5 envía el mensaje directamente en payload.data
  let messages: any[] = []

  // Estructura de v1.7.5: payload.data contiene el mensaje directamente
  if (payload.data && payload.data.key) {
    messages = [payload.data]
  }
  // Alternativa: array de mensajes
  else if (payload.data?.messages) {
    messages = payload.data.messages
  }
  // Alternativa: mensaje directo en payload
  else if (payload.key) {
    messages = [payload]
  }

  for (const msg of messages) {
    // Ignorar mensajes propios
    const fromMe = msg.key?.fromMe || msg.fromMe
    if (fromMe) {
      continue
    }

    // Obtener número de teléfono - SOLUCIÓN PARA LID FORMAT
    // Evolution API v1.7.5 tiene un problema conocido donde envía LID en lugar del número real
    // Ver: https://github.com/EvolutionAPI/evolution-api/issues/1916
    let phoneNumber = ''
    const remoteJid = msg.key?.remoteJid || msg.remoteJid || ''
    const isLidFormat = remoteJid.endsWith('@lid')

    // 1. Verificar senderPn en el key (número real del remitente) - Solo en Evolution API 2.x+
    if (msg.key?.senderPn) {
      phoneNumber = msg.key.senderPn.replace(/\D/g, '')
    }
    // 2. Verificar remoteJidAlt (formato alternativo con número real) - Solo en Evolution API 2.x+
    else if (msg.key?.remoteJidAlt) {
      phoneNumber = msg.key.remoteJidAlt.replace('@s.whatsapp.net', '').replace('@g.us', '')
    }
    // 3. Si remoteJid NO es LID, usarlo directamente
    else if (!isLidFormat && remoteJid) {
      phoneNumber = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '')
    }
    // 4. Si es LID, buscar el mapeo en la base de datos
    else if (isLidFormat) {
      const lid = remoteJid.replace('@lid', '')

      // Buscar si ya tenemos este LID mapeado a un número real
      const { data: lidMapping } = await supabase
        .from('whatsapp_lid_mappings')
        .select('phone_number')
        .eq('lid', lid)
        .single()

      if (lidMapping?.phone_number) {
        phoneNumber = lidMapping.phone_number
      } else {
        console.error('LID mapping not found for:', lid)

        // Guardar LID para referencia
        try {
          await supabase.from('whatsapp_lid_mappings').upsert({
            lid: lid,
            push_name: msg.pushName || 'Desconocido',
            last_seen: new Date().toISOString()
          }, { onConflict: 'lid' })
        } catch (e) {
          // Ignorar
        }
        continue // No podemos responder sin número real
      }
    }

    if (!phoneNumber) {
      console.error('Unable to extract valid phone number from message')
      continue
    }

    // Obtener texto del mensaje (varios formatos posibles)
    const messageText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.body ||
      msg.text ||
      ''

    if (!messageText) {
      continue
    }

    // Obtener nombre del remitente
    const senderName = msg.pushName || msg.verifiedBizName || 'Desconocido'

    // Obtener instancia
    const instanceName = payload.instance || payload.instanceName || 'pms-bot'

    // Buscar config de la instancia
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('instance_name', instanceName)
      .single()

    if (configError) {
      console.error('Failed to fetch WhatsApp config for instance:', instanceName)
    }

    if (!config) {
      // Intentar con organización por defecto
      const { data: defaultOrg } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (defaultOrg) {
        // Crear config temporal
        const tempConfig = {
          organization_id: defaultOrg.id,
          instance_name: instanceName,
          api_url: 'http://localhost:8080',
          api_key: 'mypmsapikey123',
          bot_enabled: true
        }
        await processMessage(tempConfig, phoneNumber, messageText, senderName, msg.key?.id)
      }
      return
    }
    await processMessage(config, phoneNumber, messageText, senderName, msg.key?.id)
  }
}

async function processMessage(config: any, phoneNumber: string, messageText: string, senderName: string, messageId: string) {
  
  // 🛡️ FILTRO DE SEGURIDAD - Solo responder en casos específicos
  const shouldRespond = await shouldBotRespond(phoneNumber, messageText, config.organization_id)
  
  // Guardar mensaje entrante (ignorar errores si la tabla no existe)
  try {
    await supabase.from('whatsapp_messages').insert({
      organization_id: config.organization_id,
      phone_number: phoneNumber,
      direction: 'incoming',
      message_text: messageText,
      guest_name: senderName,
      whatsapp_message_id: messageId,
      is_bot_response: false
    })
  } catch (e) {
    // Tabla puede no existir en desarrollo
  }

  // Generar respuesta del bot SOLO si el filtro lo permite
  if (config.bot_enabled !== false && shouldRespond) {
    let response: string

    // Usar IA si está configurada, sino usar respuestas básicas
    if (USE_AI_BOT) {
      response = await generateAIResponse(config.organization_id, phoneNumber, messageText, senderName)
    } else {
      response = await generateBotResponse(config.organization_id, messageText)
    }

    if (response) {
      // Enviar respuesta
      await sendWhatsAppMessage(config, phoneNumber, response)

      // Guardar respuesta
      try {
        await supabase.from('whatsapp_messages').insert({
          organization_id: config.organization_id,
          phone_number: phoneNumber,
          direction: 'outgoing',
          message_text: response,
          is_bot_response: true
        })
      } catch (e) {
        // Tabla puede no existir en desarrollo
      }
    }
  }
}

async function generateBotResponse(organizationId: string, message: string): Promise<string> {
  const lowerMessage = message.toLowerCase().trim()

  // RESPUESTAS INTELIGENTES OPTIMIZADAS
  
  // 1. INFORMACIÓN DE ALOJAMIENTO
  if (lowerMessage === '1' || 
      lowerMessage.includes('alojamiento') || 
      lowerMessage.includes('hotel') || 
      lowerMessage.includes('wifi') || 
      lowerMessage.includes('contraseña') ||
      lowerMessage.includes('acceso')) {
    return getPropertyInfo()
  }

  // 2. RESTAURANTES Y COMIDA (expandido)
  if (lowerMessage === '2' || 
      lowerMessage.includes('restaurante') || 
      lowerMessage.includes('comer') ||
      lowerMessage.includes('comida') ||
      lowerMessage.includes('almorzar') ||
      lowerMessage.includes('cenar') ||
      lowerMessage.includes('desayunar') ||
      lowerMessage.includes('hambre') ||
      lowerMessage.includes('donde comer') ||
      lowerMessage.includes('típica') ||
      lowerMessage.includes('tipica')) {
    return await getTouristInfo(organizationId, 'restaurant')
  }

  // 3. TURISMO Y LUGARES (expandido)
  if (lowerMessage === '3' || 
      lowerMessage.includes('turismo') || 
      lowerMessage.includes('visitar') || 
      lowerMessage.includes('turistico') ||
      lowerMessage.includes('lugares') ||
      lowerMessage.includes('que hacer') ||
      lowerMessage.includes('qué hacer') ||
      lowerMessage.includes('actividades') ||
      lowerMessage.includes('pasear') ||
      lowerMessage.includes('conocer') ||
      lowerMessage.includes('museo') ||
      lowerMessage.includes('iglesia') ||
      lowerMessage.includes('parque')) {
    return await getTouristInfo(organizationId, 'attraction')
  }

  // 4. TRANSPORTE (expandido)
  if (lowerMessage === '4' || 
      lowerMessage.includes('transporte') || 
      lowerMessage.includes('taxi') || 
      lowerMessage.includes('uber') ||
      lowerMessage.includes('bus') ||
      lowerMessage.includes('terminal') ||
      lowerMessage.includes('como llegar') ||
      lowerMessage.includes('cómo llegar') ||
      lowerMessage.includes('moverme') ||
      lowerMessage.includes('movilizar')) {
    return await getTouristInfo(organizationId, 'transport')
  }

  // 5. EMERGENCIAS (expandido)
  if (lowerMessage === '5' || 
      lowerMessage.includes('emergencia') || 
      lowerMessage.includes('hospital') || 
      lowerMessage.includes('policia') ||
      lowerMessage.includes('policía') ||
      lowerMessage.includes('farmacia') ||
      lowerMessage.includes('medicina') ||
      lowerMessage.includes('doctor') ||
      lowerMessage.includes('urgencias') ||
      lowerMessage.includes('bomberos') ||
      lowerMessage.includes('ayuda')) {
    return await getTouristInfo(organizationId, 'emergency')
  }

  // 6. TIPS LOCALES (expandido)
  if (lowerMessage === '6' || 
      lowerMessage.includes('tip') || 
      lowerMessage.includes('consejo') ||
      lowerMessage.includes('clima') ||
      lowerMessage.includes('dinero') ||
      lowerMessage.includes('pagar') ||
      lowerMessage.includes('horario') ||
      lowerMessage.includes('seguridad') ||
      lowerMessage.includes('recomendacion') ||
      lowerMessage.includes('recomendación')) {
    return await getTouristInfo(organizationId, 'tip')
  }

  // Buscar en respuestas predefinidas del bot
  const { data: botResponses } = await supabase
    .from('bot_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  if (botResponses && botResponses.length > 0) {
    for (const resp of botResponses) {
      // Usar trigger_value (separado por comas)
      const keywords = (resp.trigger_value || '').split(',').map((k: string) => k.trim().toLowerCase())
      if (keywords.some((kw: string) => kw && lowerMessage.includes(kw))) {
        return resp.response_text
      }
    }
  }

  // Respuesta por defecto - menú optimizado colombiano
  return `¡Hola! 👋 Soy tu asistente virtual en Cartago

*¿En qué te puedo ayudar hoy?*

🏠 1️⃣ Info del alojamiento (WiFi, acceso)
🍽️ 2️⃣ Dónde comer (típica, internacional)  
🎯 3️⃣ Qué visitar (museos, parques)
🚕 4️⃣ Transporte (taxis, buses)
🆘 5️⃣ Emergencias (hospital, policía)
💡 6️⃣ Tips locales (clima, dinero)

Escribe el *número* o pregunta directo
Ej: "restaurantes", "qué visitar", "wifi"`
}

function getPropertyInfo(): string {
  return `🏠 *Tu Alojamiento en Cartago*

*Incluido en tu estadía:*
📶 WiFi alta velocidad (gratis)
🍳 Cocina completa equipada  
❄️ Aire acondicionado
📺 Smart TV con Netflix
🧴 Artículos de aseo completos
🏊 Piscina (si aplica)
🅿️ Parqueadero privado

*Horarios importantes:*
🕒 Check-in: 3:00 PM en adelante
🕐 Check-out: Hasta 12:00 PM
🔑 Recepción: 8:00 AM - 8:00 PM

*¿Necesitas algo específico?*
• Escribe "wifi" para contraseña
• Escribe "acceso" para llegar
• Escribe "reglas" para normas
• Escribe "contacto" para emergencias

💬 ¿En qué más te ayudo?`
}

async function getTouristInfo(organizationId: string, category: string): Promise<string> {
  const { data: items, error } = await supabase
    .from('tourist_info')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('category', category)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(8) // Aumentado para mostrar más opciones

  if (error) {
    console.error('Failed to fetch tourist info:', error)
  }

  if (!items || items.length === 0) {
    return `Lo siento, no tengo información de ${getCategoryName(category)} disponible en este momento.`
  }

  const emoji = getCategoryEmoji(category)
  const title = getCategoryName(category)

  // RESPUESTA INTELIGENTE OPTIMIZADA
  let response = `${emoji} *${title} en Cartago*\n\n`

  items.forEach((item, index) => {
    response += `*${index + 1}. ${item.name}*\n`
    
    // Descripción completa (no truncada)
    if (item.description) {
      response += `${item.description}\n`
    }
    
    // Información de contacto organizada
    if (item.address) response += `📍 ${item.address}\n`
    if (item.phone) response += `📞 ${item.phone}\n`
    
    response += '\n'
  })

  // FOOTER CONTEXTUAL POR CATEGORÍA
  switch (category) {
    case 'restaurant':
      response += '💡 *Tip:* Pregunta por el menú del día para opciones económicas\n'
      response += '🕐 La mayoría abre 11am-9pm\n'
      response += '💳 Llevar efectivo y tarjeta'
      break
    case 'attraction':
      response += '📸 *Tip:* Mejor hora para fotos: mañanas y atardeceres\n'
      response += '🎒 Llevar agua e identificación\n'
      response += '🚶 Centro histórico es caminable'
      break
    case 'transport':
      response += '💡 *Tip:* Apps como Uber funcionan 6am-10pm\n'
      response += '💰 Tarifa taxi centro: $5,000-8,000\n'
      response += '🕐 Buses cada 15-30 minutos'
      break
    case 'emergency':
      response += '🆘 *Números de emergencia nacionales:*\n'
      response += '• Policía: 123\n'
      response += '• Bomberos: 119\n'
      response += '• Cruz Roja: 132'
      break
    case 'tip':
      response += '📱 *Más info:* Escribe "restaurantes" o "lugares turísticos"\n'
      response += '🗺️ Centro de Cartago es muy caminable'
      break
  }

  return response.trim()
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    restaurant: '🍽️',
    attraction: '🏛️',
    transport: '🚕',
    emergency: '🚨',
    tip: '💡'
  }
  return emojis[category] || '📍'
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    restaurant: 'Restaurantes',
    attraction: 'Lugares turísticos',
    transport: 'Transporte',
    emergency: 'Emergencias',
    tip: 'Tips locales'
  }
  return names[category] || category
}

async function sendWhatsAppMessage(config: any, phoneNumber: string, message: string) {
  const apiUrl = config.api_url || 'http://localhost:8080'
  const apiKey = config.api_key || 'mypmsapikey123'
  const instanceName = config.instance_name || 'pms-whatsapp'

  const url = `${apiUrl}/message/sendText/${instanceName}`
  
  // Limpiar número (solo dígitos)
  const cleanNumber = phoneNumber.replace(/\D/g, '')

  // Payload para Evolution API v1.7.5
  const payload = {
    number: cleanNumber,
    textMessage: {
      text: message
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { raw: responseText }
    }

    // Si falla, intentar formato alternativo con options
    if (response.status >= 400 || result.error) {
      const altPayload = {
        number: cleanNumber,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false
        },
        textMessage: {
          text: message
        }
      }

      const altResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify(altPayload)
      })

      const altText = await altResponse.text()
      
      try {
        result = JSON.parse(altText)
      } catch {
        result = { raw: altText }
      }
    }

    return result
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return { error: String(error) }
  }
}

async function handleConnectionUpdate(payload: any) {
  const state = payload.data?.state || payload.state
  const instanceName = payload.instance || payload.instanceName

  if (!instanceName) return

  const status = state === 'open' ? 'connected' : 'disconnected'

  await supabase
    .from('whatsapp_config')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('instance_name', instanceName)

  // Status updated silently
}

// Verificación de webhook (GET) - Evolution API usa esto para verificar el webhook
export async function GET(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET
  const { searchParams } = new URL(request.url)
  
  // Evolution API verificación challenge
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token') || searchParams.get('token')
  const challenge = searchParams.get('hub.challenge')
  
  // Si es una verificación de webhook (Meta/Evolution style)
  if (mode === 'subscribe' && token && challenge) {
    if (token === WEBHOOK_SECRET) {
      return new NextResponse(challenge, { status: 200 })
    }
    console.warn('SECURITY: Webhook verification failed - invalid token')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Health check simple (requiere token)
  if (token === WEBHOOK_SECRET) {
    return NextResponse.json({ status: 'WhatsApp webhook active' })
  }
  
  // Sin token válido, no revelar información
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// 🛡️ FILTRO DE SEGURIDAD - Determinar si el bot debe responder
async function shouldBotRespond(phoneNumber: string, messageText: string, organizationId: string): Promise<boolean> {
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const lowerMessage = messageText.toLowerCase().trim()
  
  // 1. 🔑 PALABRAS CLAVE DE ACTIVACIÓN EXPANDIDAS - Si dice esto, SÍ responder
  const activationKeywords = [
    // Palabras de activación directa
    'info turistica', 'info turística', 'bot hospedy', 'hospedy bot',
    'asistente virtual', 'informacion cartago', 'información cartago',
    'help', 'ayuda', 'bot', 'menu', 'menú', 'opciones',
    
    // Consultas turísticas
    'restaurantes cartago', 'lugares turisticos', 'donde comer', 'que comer',
    'que visitar', 'qué visitar', 'que hacer', 'qué hacer',
    'transporte', 'emergencia', 'taxi', 'hospital',
    
    // Consultas de alojamiento
    'wifi', 'contraseña', 'acceso', 'como llegar', 'cómo llegar',
    'check in', 'check out', 'checkin', 'checkout',
    'reglas', 'normas', 'contacto', 'recepcion', 'recepción',
    
    // Consultas de información local
    'clima', 'tiempo', 'lluvia', 'dinero', 'pesos', 'cambio',
    'farmacia', 'medicina', 'doctor', 'policia', 'policía',
    'seguro', 'seguridad', 'tips', 'consejos', 'recomendaciones',
    
    // Consultas gastronómicas específicas
    'comida tipica', 'comida típica', 'sancocho', 'bandeja paisa',
    'almorzar', 'cenar', 'desayunar', 'hambre',
    
    // Consultas de movilidad
    'uber', 'bus', 'terminal', 'moverme', 'movilizar',
    'pereira', 'cali', 'armenia', 'bogota', 'bogotá',
    
    // Frases de contexto hotelero
    'huesped', 'huésped', 'hospedaje', 'alojamiento', 'hotel',
    'habitacion', 'habitación', 'servicios', 'amenidades'
  ]
  
  const hasActivationKeyword = activationKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  )
  
  if (hasActivationKeyword) {
    console.log(`🔓 Bot activado por palabra clave en: ${cleanPhone}`)
    return true
  }
  
  // 2. 📋 HUÉSPEDES CONOCIDOS - Si tiene reserva activa, SÍ responder
  try {
    const today = new Date().toISOString().split('T')[0]
    const phoneVariants = [
      cleanPhone,
      cleanPhone.startsWith('57') ? cleanPhone.slice(2) : `57${cleanPhone}`,
      `+${cleanPhone}`
    ]
    
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        id,
        guests (phone)
      `)
      .eq('org_id', organizationId)
      .in('status', ['confirmed', 'checked_in'])
      .lte('check_in', today)
      .gte('check_out', today)
      .limit(5)
    
    const hasActiveReservation = booking?.some(b => {
      // guests es un array de objetos con phone
      if (Array.isArray(b.guests)) {
        return b.guests.some(guest => {
          const guestPhone = guest?.phone?.replace(/\D/g, '') || ''
          return phoneVariants.some(p => guestPhone.includes(p) || p.includes(guestPhone))
        })
      }
      return false
    })
    
    if (hasActiveReservation) {
      console.log(`🏨 Huésped activo detectado: ${cleanPhone}`)
      return true
    }
  } catch (e) {
    // Error en consulta, continuar con otros filtros
  }
  
  // 3. ✅ LISTA BLANCA - Números autorizados para testing
  const whitelistNumbers = [
    '573113225050', // Tu número principal (para pruebas)
    '3113225050'    // Variante corta
  ]
  
  const isWhitelisted = whitelistNumbers.some(allowed => 
    cleanPhone.includes(allowed) || allowed.includes(cleanPhone)
  )
  
  if (isWhitelisted && (lowerMessage.includes('test') || lowerMessage.includes('prueba'))) {
    console.log(`🧪 Test autorizado desde número en lista blanca: ${cleanPhone}`)
    return true
  }
  
  // 4. 🔒 POR DEFECTO - NO responder a mensajes aleatorios
  console.log(`🔒 Bot NO responderá a: "${messageText}" desde ${cleanPhone}`)
  console.log(`💡 Para activar, envía: "info turística" o "bot hospedy"`)
  return false
}
