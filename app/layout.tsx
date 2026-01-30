import './globals.css'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  }
}

export const metadata = {
  title: 'Hospedy - Tu negocio de alquiler organizado',
  description: 'Plataforma todo-en-uno para administrar propiedades de alquiler corto en Colombia',
  manifest: '/manifest.json',
  themeColor: '#228B22',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#228B22" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  )
}