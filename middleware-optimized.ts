import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware optimizado para performance en 3G
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Headers de cache agresivos para assets estáticos
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }
  
  // Cache moderado para páginas
  if (request.nextUrl.pathname.startsWith('/demo') || 
      request.nextUrl.pathname.startsWith('/properties')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400'
    )
  }
  
  // Headers de seguridad y performance
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Compression hints
  response.headers.set('Accept-Encoding', 'gzip, deflate, br')
  
  // Preconnect a servicios externos
  if (request.nextUrl.pathname === '/') {
    response.headers.append(
      'Link',
      '<https://your-supabase-url.supabase.co>; rel=preconnect'
    )
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)',
  ],
}