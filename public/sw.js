// Service Worker para Hospedy - Funcionalidad Offline
const CACHE_NAME = 'hospedy-v1';
const STATIC_CACHE = 'hospedy-static-v1';
const DATA_CACHE = 'hospedy-data-v1';

// Assets críticos para funcionamiento offline
const CRITICAL_ASSETS = [
  '/',
  '/dashboard',
  '/properties',
  '/calendar',
  '/demo',
  '/globals.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
];

// Instalar Service Worker y cachear assets críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS.map(url => {
        // Intenta cachear, pero no falles si alguno no está disponible
        return cache.add(url).catch(() => console.log(`Failed to cache: ${url}`));
      }));
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de fetch con offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar en cache para offline
          const responseToCache = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde cache
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Retornar respuesta offline genérica
            return new Response(JSON.stringify({ 
              error: 'Offline', 
              message: 'Datos guardados localmente, se sincronizarán cuando regrese la conexión' 
            }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Static assets - Cache first
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Actualizar cache en background
          const fetchPromise = fetch(request).then((networkResponse) => {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
            return networkResponse;
          });
          return cached;
        }

        // No está en cache, fetch desde red
        return fetch(request).then((networkResponse) => {
          // Solo cachear respuestas exitosas
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Página offline fallback
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html').catch(() => {
              return new Response(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión - Hospedy</title>
                  <style>
                    body {
                      font-family: -apple-system, system-ui, sans-serif;
                      text-align: center;
                      padding: 50px 20px;
                      background: #f5f5f5;
                    }
                    .container {
                      max-width: 500px;
                      margin: 0 auto;
                      background: white;
                      padding: 40px;
                      border-radius: 12px;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    h1 { color: #333; margin-bottom: 20px; }
                    p { color: #666; line-height: 1.6; }
                    .emoji { font-size: 48px; margin-bottom: 20px; }
                    .btn {
                      background: #228B22;
                      color: white;
                      padding: 12px 24px;
                      border: none;
                      border-radius: 6px;
                      font-size: 16px;
                      cursor: pointer;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="emoji">📶</div>
                    <h1>Sin conexión a internet</h1>
                    <p>Está trabajando en modo sin conexión. Sus cambios se guardan localmente y se sincronizarán cuando regrese la conexión.</p>
                    <button class="btn" onclick="location.reload()">Reintentar</button>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' },
                status: 200
              });
            });
          }
        });
      })
    );
  }
});

// Background sync para enviar datos cuando regrese conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

// Función para sincronizar datos pendientes
async function syncPendingData() {
  // Obtener datos pendientes del IndexedDB
  const pendingData = await getPendingData();
  
  for (const data of pendingData) {
    try {
      const response = await fetch(data.url, {
        method: data.method,
        headers: data.headers,
        body: data.body
      });
      
      if (response.ok) {
        // Eliminar de pendientes si fue exitoso
        await removePendingData(data.id);
      }
    } catch (error) {
      console.error('Error syncing:', error);
    }
  }
}

// Funciones auxiliares para IndexedDB (simplificadas)
async function getPendingData() {
  // Implementar lectura de IndexedDB
  return [];
}

async function removePendingData(id) {
  // Implementar eliminación de IndexedDB
}