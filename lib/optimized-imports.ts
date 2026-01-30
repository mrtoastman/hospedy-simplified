// Configuración para importaciones optimizadas
export const lazyImports = {
  // Cargar Supabase solo cuando se necesita
  supabase: () => import('@supabase/supabase-js'),
  
  // Cargar Anthropic solo en páginas que lo usen
  anthropic: () => import('@anthropic-ai/sdk'),
  
  // Componentes pesados con lazy loading
  calendar: () => import('@/components/calendar'),
  aiBot: () => import('@/lib/ai-bot'),
};

// Precargar assets críticos para la demo
export const preloadAssets = [
  '/demo',
  '/api/whatsapp/connect',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
];