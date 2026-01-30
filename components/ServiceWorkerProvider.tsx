'use client'

import { useEffect, useState } from 'react'

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setIsUpdating(true)
                  }
                })
              }
            })
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }

    // Detectar estado online/offline
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar estado inicial
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      {/* Indicador de estado offline */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white text-center py-2 z-50">
          <p className="text-sm font-medium">
            📶 Sin conexión - Trabajando en modo offline
          </p>
        </div>
      )}

      {/* Indicador de actualización disponible */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium mb-2">
            Nueva versión disponible
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-green-600 px-4 py-2 rounded font-medium text-sm"
          >
            Actualizar ahora
          </button>
        </div>
      )}

      {children}
    </>
  )
}