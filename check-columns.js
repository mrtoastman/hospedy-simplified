// Verificar columnas de whatsapp_config
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ttcmqfpcijugnxcylhix.supabase.co',
  'sb_secret_iQP55vtcCRcRLY-GW0Wwtw_y2XbkVAq'
)

async function checkColumns() {
  console.log('🔍 Checking whatsapp_config columns...')
  
  try {
    // Obtener estructura de la tabla
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'whatsapp_config' })
      .single()
    
    if (error) {
      // Usar método alternativo
      console.log('Using alternative method...')
      const { data: sample, error: sampleError } = await supabase
        .from('whatsapp_config')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.error('❌ Error:', sampleError)
        return
      }
      
      console.log('✅ Sample row from whatsapp_config:')
      if (sample && sample.length > 0) {
        console.log('Columns found:', Object.keys(sample[0]))
      } else {
        console.log('Table is empty, but exists')
      }
      
      // Test insert mínimo
      console.log('\n🧪 Testing minimal insert...')
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
      const orgId = orgs[0].id
      
      const { data: result, error: insertError } = await supabase
        .from('whatsapp_config')
        .insert({
          organization_id: orgId,
          instance_name: 'test-minimal',
          api_url: 'http://localhost:8080'
        })
        .select()
      
      if (insertError) {
        console.error('❌ Minimal insert error:', insertError)
      } else {
        console.log('✅ Minimal insert works:', result)
        
        // Limpiar
        await supabase
          .from('whatsapp_config')
          .delete()
          .eq('instance_name', 'test-minimal')
        console.log('🧹 Cleaned up')
      }
      
    } else {
      console.log('✅ Table structure:', data)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkColumns()