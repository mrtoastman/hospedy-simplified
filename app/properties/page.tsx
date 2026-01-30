'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newProperty, setNewProperty] = useState({ name: '', short_code: '', address: '' })
  
  const supabase = createClient()

  // Cargar propiedades
  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) {
      setProperties(data || [])
    }
    setLoading(false)
  }

  // Crear propiedad
  const createProperty = async () => {
    if (!newProperty.name) return
    
    const { error } = await supabase
      .from('properties')
      .insert([newProperty])
    
    if (!error) {
      setNewProperty({ name: '', short_code: '', address: '' })
      loadProperties()
    }
  }

  // Actualizar propiedad
  const updateProperty = async (id: string, updates: any) => {
    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      setEditingId(null)
      loadProperties()
    }
  }

  // Eliminar propiedad
  const deleteProperty = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta propiedad?')) return
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (!error) {
      loadProperties()
    }
  }

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <a href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Volver
        </a>
        <h1 className="text-2xl font-bold">Propiedades</h1>
      </div>

      {/* Crear nueva - Inline */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Nueva Propiedad</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={newProperty.name}
            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
            className="flex-1 px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Código"
            value={newProperty.short_code}
            onChange={(e) => setNewProperty({ ...newProperty, short_code: e.target.value })}
            className="w-24 px-3 py-2 border rounded"
          />
          <button
            onClick={createProperty}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Crear
          </button>
        </div>
      </div>

      {/* Lista de propiedades */}
      <div className="space-y-2">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow p-4">
            {editingId === property.id ? (
              // Modo edición inline
              <div className="flex gap-2">
                <input
                  type="text"
                  value={property.name}
                  onChange={(e) => updateProperty(property.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              // Modo vista
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{property.name}</h3>
                  <p className="text-sm text-gray-600">
                    Código: {property.short_code || 'Sin código'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(property.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProperty(property.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay propiedades. Crea la primera arriba.
        </div>
      )}
    </div>
  )
}