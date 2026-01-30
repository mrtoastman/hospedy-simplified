'use client'

import { useState } from 'react'

interface Booking {
  id: string
  check_in: string
  check_out: string
  status: string
  property: { id: string; name: string; short_code: string }
  guest: { full_name: string; phone: string }
}

interface Property {
  id: string
  name: string
  short_code: string
}

export default function Calendar({ 
  properties, 
  bookings 
}: { 
  properties: Property[]
  bookings: Booking[] 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  
  // Navegar meses
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }
  
  // Obtener reservas para un día específico y propiedad
  const getBookingsForDay = (propertyId: string, day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    
    return bookings.filter(booking => {
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      return booking.property.id === propertyId && 
             date >= checkIn && date < checkOut
    })
  }
  
  // Color por status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'checked_in': return 'bg-blue-500'
      case 'completed': return 'bg-gray-400'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header del calendario */}
      <div className="bg-gray-50 p-4 flex justify-between items-center">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded">←</button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded">→</button>
      </div>

      {/* Tabla del calendario */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-sm font-medium w-32">Propiedad</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="p-1 text-center text-xs">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map(property => (
              <tr key={property.id} className="border-t">
                <td className="p-2 font-medium text-sm sticky left-0 bg-white">
                  {property.short_code || property.name}
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayBookings = getBookingsForDay(property.id, i + 1)
                  return (
                    <td key={i} className="p-1 relative h-8">
                      {dayBookings.map((booking, idx) => (
                        <div
                          key={booking.id}
                          className={`absolute inset-0 ${getStatusColor(booking.status)} opacity-70 hover:opacity-100 cursor-pointer`}
                          title={`${booking.guest.full_name} - ${booking.status}`}
                          style={{ 
                            top: `${idx * 2}px`,
                            zIndex: idx 
                          }}
                        />
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen del mes */}
      <div className="bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          Total reservas: {bookings.length} | 
          Confirmadas: {bookings.filter(b => b.status === 'confirmed').length} | 
          Pendientes: {bookings.filter(b => b.status === 'pending').length}
        </div>
      </div>
    </div>
  )
}