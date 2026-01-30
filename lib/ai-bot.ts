import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface GuestContext {
  name: string
  phone: string
  hasActiveReservation: boolean
  reservation?: {
    property_name: string
    check_in: string
    check_out: string
    property_address: string
    wifi_network?: string
    wifi_password?: string
    access_instructions?: string
    house_rules?: string
    maps_url?: string
    amenities?: string[]
    booking_code?: string
  }
  previousStay?: boolean
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// Obtener contexto del huésped basado en su número de teléfono
export async function getGuestContext(organizationId: string, phoneNumber: string): Promise<GuestContext> {
  const context: GuestContext = {
    name: '',
    phone: phoneNumber,
    hasActiveReservation: false
  }

  // Normalizar número de teléfono para búsqueda
  // Puede venir como 573113225050, 3113225050, +573113225050
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const phoneVariants = [
    cleanPhone,
    cleanPhone.startsWith('57') ? cleanPhone.slice(2) : `57${cleanPhone}`,
    `+${cleanPhone}`
  ]

  const today = new Date().toISOString().split('T')[0]

  // Buscar reserva activa - usando la tabla correcta "bookings"
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        name,
        address,
        city,
        wifi_network,
        wifi_password,
        check_in_instructions,
        house_rules,
        maps_url,
        amenities
      ),
      guests (
        full_name,
        phone,
        email
      )
    `)
    .eq('org_id', organizationId)
    .in('status', ['confirmed', 'checked_in'])
    .lte('check_in', today)
    .gte('check_out', today)
    .limit(10)

  if (bookingError) {
    console.error('Error buscando reserva:', bookingError)
  }

  // Buscar reserva que coincida con el teléfono
  const reservation = booking?.find(b => {
    const guestPhone = b.guests?.phone?.replace(/\D/g, '') || ''
    return phoneVariants.some(p => guestPhone.includes(p) || p.includes(guestPhone))
  })

  if (reservation) {
    context.hasActiveReservation = true
    context.name = reservation.guests?.full_name || ''
    context.reservation = {
      property_name: reservation.properties?.name || 'Tu alojamiento',
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      property_address: reservation.properties?.address || '',
      wifi_network: reservation.properties?.wifi_network,
      wifi_password: reservation.properties?.wifi_password,
      access_instructions: reservation.properties?.check_in_instructions,
      house_rules: reservation.properties?.house_rules,
      maps_url: reservation.properties?.maps_url,
      amenities: reservation.properties?.amenities,
      booking_code: reservation.booking_code
    }
    // Active reservation found
  } else {
    // Buscar si fue huésped anteriormente
    const { data: guests } = await supabase
      .from('guests')
      .select('full_name, id, phone')
      .eq('org_id', organizationId)

    const pastGuest = guests?.find(g => {
      const gPhone = g.phone?.replace(/\D/g, '') || ''
      return phoneVariants.some(p => gPhone.includes(p) || p.includes(gPhone))
    })

    if (pastGuest) {
      context.previousStay = true
      context.name = pastGuest.full_name || ''
    }
  }

  return context
}

// Obtener historial de conversación reciente
export async function getConversationHistory(
  organizationId: string,
  phoneNumber: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('direction, message_text, created_at')
    .eq('organization_id', organizationId)
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!messages) return []

  // Convertir a formato de conversación y revertir orden (más antiguo primero)
  return messages.reverse().map(msg => ({
    role: msg.direction === 'incoming' ? 'user' as const : 'assistant' as const,
    content: msg.message_text
  }))
}

// Obtener información turística para el contexto
export async function getTouristContext(organizationId: string): Promise<string> {
  const { data: touristInfo } = await supabase
    .from('tourist_info')
    .select('name, category, description, address, phone')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .limit(20)

  if (!touristInfo || touristInfo.length === 0) {
    return 'No hay información turística disponible.'
  }

  const grouped: Record<string, string[]> = {}
  touristInfo.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(`- ${item.name}: ${item.description || ''}${item.address ? ` (${item.address})` : ''}${item.phone ? ` Tel: ${item.phone}` : ''}`)
  })

  let context = ''
  for (const [category, items] of Object.entries(grouped)) {
    const categoryName = {
      restaurant: 'Restaurantes',
      attraction: 'Lugares turísticos',
      transport: 'Transporte',
      emergency: 'Emergencias',
      tip: 'Tips locales'
    }[category] || category

    context += `\n${categoryName}:\n${items.join('\n')}\n`
  }

  return context
}

// Generar respuesta con IA
export async function generateAIResponse(
  organizationId: string,
  phoneNumber: string,
  userMessage: string,
  senderName: string
): Promise<string> {
  try {
    // Obtener contextos
    const [guestContext, conversationHistory, touristContext] = await Promise.all([
      getGuestContext(organizationId, phoneNumber),
      getConversationHistory(organizationId, phoneNumber),
      getTouristContext(organizationId)
    ])

    // Construir el prompt del sistema
    const systemPrompt = buildSystemPrompt(guestContext, touristContext, senderName)

    // Preparar mensajes para Claude
    const messages: { role: 'user' | 'assistant', content: string }[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    // Llamar a Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Modelo rápido y económico para chat
      max_tokens: 500,
      system: systemPrompt,
      messages: messages
    })

    // Extraer texto de la respuesta
    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.text || 'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo.'

  } catch (error) {
    console.error('Error generando respuesta IA:', error)
    // Fallback a respuesta básica si falla la IA
    return getFallbackResponse(userMessage)
  }
}

function buildSystemPrompt(guest: GuestContext, touristInfo: string, senderName: string): string {
  const guestName = guest.name || senderName || 'huésped'

  let prompt = `Eres un asistente virtual amigable para un alojamiento de corta estancia en Cartago, Valle del Cauca, Colombia.
Tu objetivo es ayudar a los huéspedes con información sobre su estadía, recomendaciones locales y resolver sus dudas.

REGLAS IMPORTANTES:
- Responde siempre en español de manera amigable y concisa
- Usa un tono cálido pero profesional
- Las respuestas deben ser cortas (máximo 3-4 oraciones) a menos que el huésped pida más detalle
- Si no tienes información específica, ofrece alternativas o sugiere contactar al anfitrión
- Puedes usar emojis moderadamente para hacer la conversación más amigable
- Si preguntan algo que no sabes, sé honesto y ofrece ayuda alternativa

INFORMACIÓN DEL HUÉSPED:
- Nombre: ${guestName}
- Teléfono: ${guest.phone}
`

  if (guest.hasActiveReservation && guest.reservation) {
    prompt += `
RESERVA ACTIVA:
- Propiedad: ${guest.reservation.property_name}
- Check-in: ${guest.reservation.check_in}
- Check-out: ${guest.reservation.check_out}
- Dirección: ${guest.reservation.property_address || 'Consultar con anfitrión'}
${guest.reservation.wifi_password ? `- WiFi: ${guest.reservation.wifi_password}` : ''}
${guest.reservation.access_instructions ? `- Instrucciones de acceso: ${guest.reservation.access_instructions}` : ''}

El huésped está actualmente hospedado. Personaliza las respuestas con esta información.
`
  } else if (guest.previousStay) {
    prompt += `
Este es un huésped que se ha hospedado anteriormente. Trátalo con familiaridad y agradece su preferencia.
`
  } else {
    prompt += `
Este parece ser un nuevo contacto. Dale la bienvenida y ofrece información general.
`
  }

  prompt += `
INFORMACIÓN TURÍSTICA DE CARTAGO:
${touristInfo}

Usa esta información para hacer recomendaciones personalizadas cuando sea relevante.
`

  return prompt
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
    return '¡Hola! 👋 Soy el asistente de tu alojamiento. ¿En qué puedo ayudarte hoy?'
  }

  if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
    return 'Para la contraseña del WiFi, por favor contacta directamente al anfitrión. 📶'
  }

  if (lowerMessage.includes('check') || lowerMessage.includes('salida') || lowerMessage.includes('entrada')) {
    return 'El check-in es a las 3:00 PM y el check-out a las 12:00 PM. ¿Necesitas algún ajuste?'
  }

  return `¡Hola! Soy el asistente virtual de tu alojamiento en Cartago.

¿En qué puedo ayudarte?
1. Información del alojamiento
2. Restaurantes cercanos
3. Lugares turísticos
4. Transporte
5. Emergencias
6. Tips y consejos

Escribe tu pregunta o el número de la opción 😊`
}
