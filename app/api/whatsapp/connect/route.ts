import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Conectar con Evolution API y obtener QR
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // For simplified version, use default org ID or create one
    // TODO: Replace with proper authentication when ready
    let orgId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Default org
    
    // Try to get the first organization from database
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single()
    
    if (org?.id) {
      orgId = org.id
    }

    const body = await request.json()
    const { instance_name, api_url, api_key } = body

    // Guardar configuración
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .upsert({
        organization_id: orgId,
        instance_name,
        api_url,
        api_key,
        phone_number: null,
        is_connected: false,
      }, {
        onConflict: 'organization_id'
      })
      .select()
      .single()

    if (configError) {
      console.error('Error saving config:', configError)
      return NextResponse.json({ error: 'Error saving configuration' }, { status: 500 })
    }

    // Crear instancia en Evolution API
    try {
      const createResponse = await fetch(`${api_url}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': api_key || ''
        },
        body: JSON.stringify({
          instanceName: instance_name,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      })

      if (!createResponse.ok) {
        // Si ya existe, intentar conectar
        const connectResponse = await fetch(`${api_url}/instance/connect/${instance_name}`, {
          method: 'GET',
          headers: {
            'apikey': api_key || ''
          }
        })

        if (connectResponse.ok) {
          const qrData = await connectResponse.json()
          return NextResponse.json({
            success: true,
            qrcode: qrData.base64 || qrData.qrcode?.base64,
            status: 'waiting_qr'
          })
        }
      }

      const createData = await createResponse.json()

      return NextResponse.json({
        success: true,
        qrcode: createData.qrcode?.base64,
        status: 'waiting_qr'
      })

    } catch (apiError) {
      console.error('Evolution API error:', apiError)
      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar con Evolution API. Verifica que esté corriendo.',
        status: 'error'
      })
    }

  } catch (error) {
    console.error('Error in WhatsApp connect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Verificar estado de conexión
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // For simplified version, use default org ID
    let orgId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Default org
    
    // Try to get the first organization from database
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single()
    
    if (org?.id) {
      orgId = org.id
    }

    const { data: config } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('organization_id', orgId)
      .single()

    if (!config) {
      return NextResponse.json({
        connected: false,
        status: 'not_configured'
      })
    }

    // Verificar estado en Evolution API
    try {
      const stateResponse = await fetch(
        `${config.api_url}/instance/connectionState/${config.instance_name}`,
        {
          headers: {
            'apikey': config.api_key || ''
          }
        }
      )

      if (stateResponse.ok) {
        const stateData = await stateResponse.json()
        const isConnected = stateData.instance?.state === 'open'

        // Actualizar estado en BD si cambió
        if ((isConnected && !config.is_connected) ||
            (!isConnected && config.is_connected)) {
          await supabase
            .from('whatsapp_config')
            .update({
              is_connected: isConnected,
              updated_at: new Date().toISOString()
            })
            .eq('organization_id', orgId)
        }

        return NextResponse.json({
          connected: isConnected,
          status: isConnected ? 'connected' : 'disconnected',
          phone_number: config.phone_number,
          instance_name: config.instance_name
        })
      }
    } catch {
      // API no disponible
    }

    return NextResponse.json({
      connected: config.is_connected || false,
      status: config.is_connected ? 'connected' : 'disconnected',
      instance_name: config.instance_name
    })

  } catch (error) {
    console.error('Error checking WhatsApp status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
