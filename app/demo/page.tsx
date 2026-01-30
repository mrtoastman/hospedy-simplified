'use client'

import { useState, useEffect } from 'react'

export default function DemoPage() {
  const [botStatus, setBotStatus] = useState('disconnected')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [messages, setMessages] = useState([
    { time: '2:45 PM', from: '+57 310 123 4567', message: 'Hola, info turística por favor' },
    { time: '2:45 PM', from: 'Bot', message: '¡Hola! 👋 Soy tu asistente virtual en Cartago\n\n¿En qué te puedo ayudar hoy?\n\n🍽️ 2️⃣ Dónde comer\n🎯 3️⃣ Qué visitar\n🚕 4️⃣ Transporte' }
  ])

  useEffect(() => {
    // Simular conexión del bot
    const timer = setTimeout(() => {
      setBotStatus('connected')
      setPhoneNumber('+57 318 555 0123')
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🇨🇴 Hospedy - Demo WhatsApp Bot
          </h1>
          <p className="text-gray-600">
            Asistente Virtual Inteligente para Rentas Cortas en Colombia
          </p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${
          botStatus === 'connected' 
            ? 'bg-green-100 border border-green-300' 
            : 'bg-yellow-100 border border-yellow-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              botStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}></div>
            <div>
              <h3 className="font-semibold">
                {botStatus === 'connected' ? '✅ Bot Conectado y Funcionando' : '⏳ Conectando Bot...'}
              </h3>
              {botStatus === 'connected' && (
                <p className="text-sm text-gray-600">
                  📱 Número: {phoneNumber} • 🤖 IA Activa • 📍 Cartago, Valle del Cauca
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Interface */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel de Control Propietario */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            🎛️ Panel de Control - Súper Simple
          </h2>
          
          {/* Stats Rápidas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-sm text-gray-600">Mensajes hoy</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Satisfacción</div>
            </div>
          </div>

          {/* Configuración Fácil */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">⚙️ Configuración (3 pasos)</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <span className="text-sm">1. Conectar WhatsApp (1 min)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <span className="text-sm">2. Configurar propiedad (2 min)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
                <span className="text-sm">3. ¡Bot funcionando! (0 min)</span>
              </div>
            </div>
          </div>

          {/* Info de la Propiedad */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">🏠 Tu Propiedad</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>📍 Casa Colonial Centro, Cartago</div>
              <div>📶 WiFi: CasaColonial_2024</div>
              <div>🔑 Check-in: 3:00 PM</div>
              <div>🎯 50+ lugares recomendados</div>
            </div>
          </div>
        </div>

        {/* Simulador de Conversación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            📱 Conversación en Vivo
          </h2>
          
          {/* Chat Simulation */}
          <div className="bg-green-50 rounded-lg p-4 h-80 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                msg.from === 'Bot' 
                  ? 'bg-white border border-green-200 ml-4' 
                  : 'bg-green-600 text-white mr-4'
              }`}>
                <div className="text-xs text-gray-500 mb-1">
                  {msg.time} - {msg.from}
                </div>
                <div className="text-sm whitespace-pre-line">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Demo Actions */}
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => {
                setMessages(prev => [...prev, 
                  { time: '2:46 PM', from: '+57 310 123 4567', message: 'restaurantes' },
                  { time: '2:46 PM', from: 'Bot', message: '🍽️ Restaurantes en Cartago\n\n1. Restaurante El Rancherito\nComida típica vallecaucana. Sancocho $18,000\n📍 Carrera 5 #10-45, Centro\n\n2. Asadero El Portal\nCarnes a la brasa. Churrasco $28,000\n📍 Avenida Principal #25-30' }
                ])
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700"
            >
              🧪 Demo: Huésped pregunta "restaurantes"
            </button>
            
            <button 
              onClick={() => {
                setMessages(prev => [...prev, 
                  { time: '2:47 PM', from: '+57 311 987 6543', message: 'wifi contraseña' },
                  { time: '2:47 PM', from: 'Bot', message: '¡Hola María! 👋\n\n📶 Tu WiFi:\nRed: CasaColonial_2024\nContraseña: cartago123\n\n¿Necesitas algo más para tu estadía?' }
                ])
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700"
            >
              🧪 Demo: Huésped con reserva pregunta WiFi
            </button>
          </div>
        </div>
      </div>

      {/* Features Colombian-Focused */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
            🇨🇴 ¿Por qué Hospedy es Perfecto para Colombia?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">WhatsApp Nativo</h3>
              <p className="text-sm text-gray-600">
                La herramienta que ya conocen y usan todos los colombianos
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold mb-2">Inteligencia Local</h3>
              <p className="text-sm text-gray-600">
                Conoce cada ciudad: Cartago, Medellín, Cali, Cartagena...
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Precios Colombianos</h3>
              <p className="text-sm text-gray-600">
                Desde $50,000/mes. Sin costos ocultos ni planes enterprise
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-gray-600">
        <p className="text-sm">
          🚀 Demo en vivo • Domingo 31 Enero 2026 • 
          <span className="font-semibold"> Hospedy - Hecho para Colombia</span>
        </p>
      </div>
    </div>
  )
}