// Sincronizar estado WhatsApp
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ttcmqfpcijugnxcylhix.supabase.co',
  'sb_secret_iQP55vtcCRcRLY-GW0Wwtw_y2XbkVAq'
)

async function syncWhatsAppStatus() {
  console.log('🔄 Sincronizando estado de WhatsApp...')
  
  try {
    // 1. Obtener estado de Evolution API
    console.log('📡 Verificando Evolution API...')
    const evolutionResponse = await fetch('http://localhost:8080/instance/connect/pms-whatsapp', {
      headers: { 'apikey': 'mypmsapikey123' }
    })
    
    const evolutionData = await evolutionResponse.json()
    const isConnected = evolutionData?.instance?.state === 'open'
    
    console.log(`Evolution API estado: ${evolutionData?.instance?.state}`)
    console.log(`¿Conectado?: ${isConnected}`)
    
    // 2. Obtener organización
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (!orgs || orgs.length === 0) {
      console.error('❌ No hay organizaciones')
      return
    }
    
    const orgId = orgs[0].id
    console.log(`✅ Organización: ${orgId}`)
    
    // 3. Actualizar estado en base de datos
    console.log('💾 Actualizando base de datos...')
    
    if (isConnected) {
      // Si está conectado, obtener info del teléfono
      try {
        const instanceInfo = await fetch(`http://localhost:8080/instance/fetchInstances?instanceName=pms-whatsapp`, {
          headers: { 'apikey': 'mypmsapikey123' }
        })
        const instanceData = await instanceInfo.json()
        const phoneNumber = instanceData?.data?.[0]?.instance?.wuid?.split('@')?.[0] || null
        
        console.log(`📱 Número detectado: ${phoneNumber}`)
        
        const { error: updateError } = await supabase
          .from('whatsapp_config')
          .upsert({
            organization_id: orgId,
            instance_name: 'pms-whatsapp',
            api_url: 'http://localhost:8080',
            api_key: 'mypmsapikey123',
            phone_number: phoneNumber,
            is_connected: true,
            last_connected_at: new Date().toISOString(),
            bot_enabled: true
          }, {
            onConflict: 'organization_id'
          })
        
        if (updateError) {
          console.error('❌ Error actualizando:', updateError)
        } else {
          console.log('✅ ¡Estado actualizado! WhatsApp está CONECTADO')
          console.log(`📱 Teléfono: ${phoneNumber || 'No detectado'}`)
        }
      } catch (e) {
        console.log('⚠️  Error obteniendo número, pero actualizando estado...')
        await supabase
          .from('whatsapp_config')
          .upsert({
            organization_id: orgId,
            instance_name: 'pms-whatsapp',
            api_url: 'http://localhost:8080', 
            api_key: 'mypmsapikey123',
            is_connected: true,
            last_connected_at: new Date().toISOString(),
            bot_enabled: true
          }, {
            onConflict: 'organization_id'
          })
        console.log('✅ Estado actualizado (sin número)')
      }
    } else {
      console.log('⚠️  WhatsApp NO está conectado en Evolution API')
    }
    
    // 4. Verificar estado final
    const { data: finalConfig } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('organization_id', orgId)
      .single()
    
    console.log('\n📊 ESTADO FINAL:')
    console.log(`   Conectado: ${finalConfig?.is_connected ? '✅' : '❌'}`)
    console.log(`   Instancia: ${finalConfig?.instance_name}`)
    console.log(`   Teléfono: ${finalConfig?.phone_number || 'No disponible'}`)
    console.log(`   Bot habilitado: ${finalConfig?.bot_enabled ? '✅' : '❌'}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

syncWhatsAppStatus()