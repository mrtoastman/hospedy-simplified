// Constantes compartidas para reducir duplicación
export const APP_CONFIG = {
  name: 'Hospedy',
  tagline: 'Tu negocio de alquiler organizado',
  support: {
    whatsapp: '+573001234567',
    email: 'soporte@hospedy.co'
  }
};

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  properties: '/properties',
  demo: '/demo',
  calendar: '/calendar'
};

export const MESSAGES = {
  errors: {
    offline: 'Sin conexión - Trabajando en modo offline',
    auth: 'Email o contraseña incorrectos',
    generic: 'Algo salió mal. Por favor intente de nuevo.'
  },
  success: {
    saved: 'Cambios guardados',
    synced: 'Datos sincronizados'
  }
};

// Datos de demo minificados
export const DEMO_DATA = {
  properties: [
    { id: 1, name: 'Finca El Paraíso', location: 'Quindío', price: 300000 },
    { id: 2, name: 'Casa La Colina', location: 'Cundinamarca', price: 250000 }
  ],
  reservations: [
    { id: 1, property: 1, guest: 'Carlos R.', dates: '01-05 Feb', status: 'confirmed' },
    { id: 2, property: 2, guest: 'María L.', dates: '07-10 Feb', status: 'pending' }
  ]
};