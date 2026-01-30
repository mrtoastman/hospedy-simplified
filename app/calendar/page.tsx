import { createClient } from '@/lib/supabase'
import Calendar from '@/components/calendar'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Obtener propiedades y reservas del mes actual
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const endOfMonth = new Date()
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)
  endOfMonth.setHours(23, 59, 59, 999)
  
  const [
    { data: properties },
    { data: bookings }
  ] = await Promise.all([
    supabase.from('properties').select('id, name, short_code').eq('org_id', user?.id),
    supabase.from('bookings')
      .select('*, property:properties(name, short_code), guest:guests(full_name, phone)')
      .eq('org_id', user?.id)
      .gte('check_out', startOfMonth.toISOString())
      .lte('check_in', endOfMonth.toISOString())
      .not('status', 'in', '("cancelled","no_show")')
  ])

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header con navegación simple */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <a href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Volver
          </a>
          <h1 className="text-2xl font-bold">Calendario de Reservas</h1>
        </div>
        
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          + Nueva Reserva
        </button>
      </div>

      {/* Calendario Component */}
      <Calendar 
        properties={properties || []}
        bookings={bookings || []}
      />

      {/* Leyenda simple */}
      <div className="mt-6 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Completada</span>
        </div>
      </div>
    </div>
  )
}