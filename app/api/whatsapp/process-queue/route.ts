import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'your-api-key-here'
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || 'pms-whatsapp'

// Enviar mensaje via Evolution API
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Formatear número para Evolution API
    let formattedNumber = phoneNumber.replace(/\D/g, '')
    if (!formattedNumber.startsWith('57')) {
      formattedNumber = '57' + formattedNumber
    }

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: message
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error enviando WhatsApp:', errorText)
      return false
    }

    // Message sent successfully
    return true
  } catch (error) {
    console.error('Error en sendWhatsAppMessage:', error)
    return false
  }
}

// GET - Procesar cola de mensajes pendientes
export async function GET(request: NextRequest) {
  try {
    // Obtener mensajes pendientes programados para ahora o antes
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('whatsapp_message_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Error obteniendo cola:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      return NextResponse.json({
        message: 'No hay mensajes pendientes',
        processed: 0
      })
    }

    // Processing pending messages

    let sent = 0
    let failed = 0

    for (const msg of pendingMessages) {
      const success = await sendWhatsAppMessage(msg.phone_number, msg.message_text)

      if (success) {
        // Marcar como enviado
        await supabase
          .from('whatsapp_message_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', msg.id)

        sent++
      } else {
        // Marcar como fallido
        await supabase
          .from('whatsapp_message_queue')
          .update({
            status: 'failed',
            error_message: 'Error al enviar mensaje via Evolution API'
          })
          .eq('id', msg.id)

        failed++
      }

      // Pequeña pausa entre mensajes para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      message: `Procesados ${pendingMessages.length} mensajes`,
      sent,
      failed
    })

  } catch (error) {
    console.error('Error procesando cola:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Agregar mensaje a la cola manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, message_text, booking_id, scheduled_for } = body

    if (!phone_number || !message_text) {
      return NextResponse.json(
        { error: 'phone_number y message_text son requeridos' },
        { status: 400 }
      )
    }

    // Obtener org_id por defecto
    const DEFAULT_ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

    const { data, error } = await supabase
      .from('whatsapp_message_queue')
      .insert({
        org_id: DEFAULT_ORG_ID,
        phone_number,
        message_text,
        booking_id: booking_id || null,
        scheduled_for: scheduled_for || new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error insertando en cola:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Mensaje agregado a la cola',
      queue_id: data.id
    })

  } catch (error) {
    console.error('Error en POST:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
