import Link from 'next/link'

export default function OptimizedHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section - Optimizado para carga rápida */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Su finca turística,<br />
            <span className="text-green-600">organizada y rentable</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La herramienta pensada para anfitriones de fincas y casas rurales en Colombia. 
            Organice reservas, controle gastos y haga crecer su negocio.
          </p>
          
          {/* Beneficio clave */}
          <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full inline-block mb-8 font-medium">
            ✅ FUNCIONA SIN INTERNET
          </div>
          
          {/* CTAs */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/demo"
              className="block sm:inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              🌾 PROBAR 14 DÍAS GRATIS
            </Link>
            
            <Link
              href="#pricing"
              className="block sm:inline-block bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-colors"
            >
              Ver precios
            </Link>
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            Sin tarjeta • Instala en 5 minutos
          </p>
        </div>
      </div>

      {/* Features Section - Beneficios clave */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Todo lo que necesita para administrar su propiedad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calendario unificado</h3>
              <p className="text-gray-600">
                Todas sus reservas de Airbnb y Booking en un solo lugar. 
                Sin dobles reservas.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp automático</h3>
              <p className="text-gray-600">
                Responda a sus huéspedes automáticamente. 
                Check-in digital sin complicaciones.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Control de gastos</h3>
              <p className="text-gray-600">
                Sepa exactamente cuánto gana. 
                Controle limpieza, mantenimiento y más.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Precios simples y transparentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Básico */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">🌾 FINCA PEQUEÑA</h3>
                <p className="text-gray-600 mt-2">Para 1-2 propiedades</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">$79,900</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  $2,650 pesos diarios<br />
                  (Un almuerzo en el pueblo)
                </p>
                
                <ul className="mt-8 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Organiza reservas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Controla gastos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Funciona sin internet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>WhatsApp automático</span>
                  </li>
                </ul>
                
                <Link
                  href="/demo"
                  className="block mt-8 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  PROBAR EN MI FINCA
                </Link>
              </div>
            </div>
            
            {/* Plan Pro */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-600">
              <div className="text-center">
                <div className="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  ⭐ RECOMENDADO
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">🏘️ VARIAS FINCAS</h3>
                <p className="text-gray-600 mt-2">Para 3-6 propiedades</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">$129,900</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  $4,330 pesos diarios<br />
                  (Desayuno + almuerzo)
                </p>
                
                <ul className="mt-8 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Todo lo anterior +</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Análisis de ganancia</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Precios sugeridos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Equipo colaborativo</span>
                  </li>
                </ul>
                
                <Link
                  href="/demo"
                  className="block mt-8 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  EMPEZAR PRUEBA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Lo que dicen nuestros anfitriones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                "Antes llevaba todo en cuadernos y se me perdían las cuentas. 
                Con Hospedy tengo todo claro y ordenado, hasta cuando no hay señal en la finca."
              </p>
              <p className="font-semibold">Don Carlos</p>
              <p className="text-sm text-gray-600">Finca cafetera - Quindío</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                "El WhatsApp automático me ahorra horas. 
                Los huéspedes reciben toda la información y yo puedo dedicarme a mejorar la propiedad."
              </p>
              <p className="font-semibold">Familia Rodríguez</p>
              <p className="text-sm text-gray-600">Casa campestre - Cundinamarca</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                "Por fin sé cuánto gano realmente. 
                Antes no sabía si me convenía o no. Ahora tomo mejores decisiones."
              </p>
              <p className="font-semibold">Doña María</p>
              <p className="text-sm text-gray-600">Cabaña turística - Boyacá</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2025 Hospedy. Hecho con ❤️ para anfitriones colombianos.
          </p>
          <div className="mt-4 space-x-4">
            <Link href="/login" className="text-green-400 hover:text-green-300">
              Ingresar
            </Link>
            <Link href="/demo" className="text-green-400 hover:text-green-300">
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}