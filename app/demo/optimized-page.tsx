'use client'

import { Suspense, lazy, useState, useEffect } from 'react'
import Link from 'next/link'

// Lazy load componentes pesados
const DemoContent = lazy(() => import('./demo-content'))

// Skeleton loader para mejor UX mientras carga
function DemoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-full"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-5/6"></div>
      <div className="h-6 bg-gray-200 rounded mb-4 w-4/6"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export default function OptimizedDemoPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header crítico - se carga inmediatamente */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Demo - Panel de Control
          </h1>
          <p className="text-gray-600 mt-2">
            Explore las funcionalidades principales de Hospedy
          </p>
        </div>

        {/* Contenido lazy loaded */}
        {mounted && (
          <Suspense fallback={<DemoSkeleton />}>
            <DemoContent />
          </Suspense>
        )}

        {/* Mensaje offline */}
        <noscript>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4">
            <p>
              JavaScript está deshabilitado. La demo requiere JavaScript para funcionar correctamente.
            </p>
          </div>
        </noscript>
      </div>
    </div>
  )
}