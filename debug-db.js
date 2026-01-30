// Test rápido de conexión a base de datos
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ttcmqfpcijugnxcylhix.supabase.co',
  'sb_secret_iQP55vtcCRcRLY-GW0Wwtw_y2XbkVAq'
)

async function testDB() {
  console.log('🔍 Testing database connection...')
  
  try {
    // 1. Test básico de conexión
    console.log('\n1. Testing organizations...')
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
    
    if (orgError) {
      console.error('❌ Error getting organizations:', orgError)
      return
    }
    
    if (!orgs || orgs.length === 0) {
      console.error('❌ No organizations found!')
      return
    }
    
    const orgId = orgs[0].id
    console.log('✅ Organization found:', orgs[0].name, orgId)
    
    // 2. Test tabla whatsapp_config
    console.log('\n2. Testing whatsapp_config table...')
    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1)
    
    if (configError) {
      console.error('❌ Error accessing whatsapp_config:', configError)
      return
    }
    
    console.log('✅ whatsapp_config table accessible')
    
    // 3. Test insert en whatsapp_config
    console.log('\n3. Testing INSERT into whatsapp_config...')
    const { data: newConfig, error: insertError } = await supabase
      .from('whatsapp_config')
      .upsert({
        organization_id: orgId,
        instance_name: 'test-instance',
        api_url: 'http://localhost:8080',
        api_key: 'test-key',
        phone_number: null,
        status: 'connecting'
      }, {
        onConflict: 'organization_id'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting config:', insertError)
      console.error('   Error details:', JSON.stringify(insertError, null, 2))
      return
    }
    
    console.log('✅ INSERT successful:', newConfig)
    
    // 4. Test de limpieza
    console.log('\n4. Cleaning up test data...')
    await supabase
      .from('whatsapp_config')
      .delete()
      .eq('instance_name', 'test-instance')
    
    console.log('✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testDB()