'use client'

import { useState, useEffect } from 'react'

export default function WhatsApp() {
  const [connected, setConnected] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [status, setStatus] = useState<string>('not_configured')
  const [stats, setStats] = useState({
    messagesTotal: 0,
    messagesWeek: 0,
    responseTime: '< 30s',
    satisfaction: '95%'
  })

  // Check connection status
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/connect')
      const data = await response.json()
      
      setConnected(data.connected)
      setStatus(data.status)
      setPhoneNumber(data.phone_number || '')
      
      if (!data.connected) {
        setQrCode(null)
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  // Check status on mount and every 10 seconds if showing QR
  useEffect(() => {
    checkStatus()
    
    const interval = setInterval(() => {
      if (qrCode || !connected) {
        checkStatus()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [qrCode, connected])

  const connectWhatsApp = async () => {
    setLoading(true)
    try {
      // Send Evolution API connection configuration
      const response = await fetch('/api/whatsapp/connect', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instance_name: 'pms-whatsapp',
          api_url: 'http://localhost:8080',
          api_key: 'mypmsapikey123'
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.qrcode) {
        setQrCode(data.qrcode)
      } else if (data.error) {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error)
      alert('Error de conexión: Verifica que Evolution API esté corriendo en puerto 8080')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <a href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Volver
        </a>
        <h1 className="text-2xl font-bold">WhatsApp Automático</h1>
      </div>

      {/* Estado de conexión */}
      <div className={`rounded-lg shadow p-6 mb-6 ${connected ? 'bg-green-50' : 'bg-gray-50'}`}>
        {connected ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold">WhatsApp Conectado</h2>
            </div>
            <p className="text-gray-600">{phoneNumber || 'Número no disponible'}</p>
            <button className="mt-4 text-red-600 hover:underline">
              Desconectar
            </button>
          </div>
        ) : (
          <div className="text-center">
            {qrCode ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Escanea el código QR</h2>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                    alt="WhatsApp QR" 
                    className="w-64 h-64 object-contain" 
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Abre WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  El código QR se actualiza automáticamente cada 10 segundos
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-2">WhatsApp no conectado</h2>
                <p className="text-gray-600 mb-4">
                  Conecta tu WhatsApp para respuestas automáticas 24/7
                </p>
                <button
                  onClick={connectWhatsApp}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Conectando...' : 'Conectar WhatsApp'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas simples */}
      {connected && (
        <div>
          <h3 className="font-semibold mb-4">Estadísticas de la semana</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats.messagesTotal}</div>
              <div className="text-sm text-gray-600">Mensajes totales</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats.messagesWeek}</div>
              <div className="text-sm text-gray-600">Esta semana</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats.responseTime}</div>
              <div className="text-sm text-gray-600">Tiempo respuesta</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold">{stats.satisfaction}</div>
              <div className="text-sm text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      )}

      {/* Configuración básica */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Respuestas automáticas</h3>
        <div className="space-y-3">
          <label className="block">
            <input type="checkbox" className="mr-2" defaultChecked />
            Información del alojamiento
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" defaultChecked />
            Ubicación y cómo llegar
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" defaultChecked />
            Horarios check-in/out
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" />
            Recomendaciones turísticas
          </label>
        </div>
      </div>
    </div>
  )
}