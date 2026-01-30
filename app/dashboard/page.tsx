import { createClient } from '@/lib/supabase'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Queries simples y directas
  const today = new Date().toISOString().split('T')[0]
  
  const [
    { data: properties },
    { data: todayBookings },
    { data: monthStats }
  ] = await Promise.all([
    supabase.from('properties').select('id, name').eq('org_id', user?.id),
    supabase.from('bookings')
      .select('*, property:properties(name), guest:guests(full_name)')
      .or(`check_in.eq.${today},check_out.eq.${today}`),
    supabase.rpc('get_month_stats', { org: user?.id })
  ])

  const checkIns = todayBookings?.filter(b => b.check_in === today) || []
  const checkOuts = todayBookings?.filter(b => b.check_out === today) || []

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header simple */}
      <h1 className="text-2xl font-bold mb-6">
        Hola {user?.email?.split('@')[0]} 👋
      </h1>

      {/* Hoy - Lo más importante */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">📅 Hoy</h2>
        
        {checkIns.length === 0 && checkOuts.length === 0 ? (
          <p className="text-gray-500">Día tranquilo - sin llegadas ni salidas</p>
        ) : (
          <div className="space-y-3">
            {checkIns.map(b => (
              <div key={b.id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <div>
                  <span className="text-green-700 font-medium">🟢 LLEGA:</span>
                  <span className="ml-2">{b.guest?.full_name}</span>
                  <span className="ml-2 text-sm text-gray-600">({b.property?.name})</span>
                </div>
                <a href={`https://wa.me/${b.guest?.phone}`} className="text-green-600 hover:underline">
                  WhatsApp →
                </a>
              </div>
            ))}
            
            {checkOuts.map(b => (
              <div key={b.id} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                <div>
                  <span className="text-orange-700 font-medium">🔴 SALE:</span>
                  <span className="ml-2">{b.guest?.full_name}</span>
                  <span className="ml-2 text-sm text-gray-600">({b.property?.name})</span>
                </div>
                <span className="text-orange-600">${b.total_amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats del mes - Simple */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold">{properties?.length || 0}</div>
          <div className="text-sm text-gray-600">Propiedades</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold">{monthStats?.bookings || 0}</div>
          <div className="text-sm text-gray-600">Reservas mes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold">${monthStats?.revenue || 0}</div>
          <div className="text-sm text-gray-600">Ingresos mes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold">{monthStats?.occupancy || 0}%</div>
          <div className="text-sm text-gray-600">Ocupación</div>
        </div>
      </div>

      {/* Quick Links - Navigation simple */}
      <div className="grid grid-cols-3 gap-4">
        <a href="/calendar" className="bg-blue-500 text-white rounded-lg p-6 text-center hover:bg-blue-600">
          <div className="text-3xl mb-2">📅</div>
          <div>Calendario</div>
        </a>
        <a href="/properties" className="bg-green-500 text-white rounded-lg p-6 text-center hover:bg-green-600">
          <div className="text-3xl mb-2">🏠</div>
          <div>Propiedades</div>
        </a>
        <a href="/whatsapp" className="bg-purple-500 text-white rounded-lg p-6 text-center hover:bg-purple-600">
          <div className="text-3xl mb-2">💬</div>
          <div>WhatsApp</div>
        </a>
      </div>
    </div>
  )
}