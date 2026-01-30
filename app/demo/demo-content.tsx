'use client'

import { useState } from 'react'

// Componente de demo con datos mock
export default function DemoContent() {
  const [activeTab, setActiveTab] = useState('reservas')

  const mockReservations = [
    {
      id: 1,
      property: 'Finca El Paraíso',
      guest: 'Carlos Rodríguez',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      status: 'confirmada',
      total: 1200000
    },
    {
      id: 2,
      property: 'Casa Campestre La Colina',
      guest: 'María López',
      checkIn: '2025-02-07',
      checkOut: '2025-02-10',
      status: 'pendiente',
      total: 900000
    }
  ]

  const mockProperties = [
    {
      id: 1,
      name: 'Finca El Paraíso',
      location: 'Quindío',
      capacity: 8,
      price: 300000,
      occupancy: 75
    },
    {
      id: 2,
      name: 'Casa Campestre La Colina',
      location: 'Cundinamarca',
      capacity: 6,
      price: 250000,
      occupancy: 60
    }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['reservas', 'propiedades', 'finanzas'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm capitalize
                ${activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div>
        {activeTab === 'reservas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Reservas Activas</h2>
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Huésped
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.property}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.guest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.checkIn} - {reservation.checkOut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === 'confirmada' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${reservation.total.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'propiedades' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mis Propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProperties.map((property) => (
                <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {property.name}
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>📍 {property.location}</p>
                      <p>👥 Capacidad: {property.capacity} personas</p>
                      <p>💰 Precio por noche: ${property.price.toLocaleString('es-CO')}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${property.occupancy}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-500">
                          {property.occupancy}% ocupación
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resumen Financiero</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos este mes
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    $4,200,000
                  </dd>
                  <p className="mt-2 text-sm text-green-600">
                    +12% vs mes anterior
                  </p>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gastos operativos
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    $1,100,000
                  </dd>
                  <p className="mt-2 text-sm text-gray-500">
                    26% de los ingresos
                  </p>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ganancia neta
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    $3,100,000
                  </dd>
                  <p className="mt-2 text-sm text-green-600">
                    74% margen
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}