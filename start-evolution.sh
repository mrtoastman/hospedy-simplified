#!/bin/bash

echo "🚀 Iniciando Evolution API..."
echo "=============================="

# Verificar Docker
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    echo "💡 Abre Docker Desktop y espera que esté listo"
    echo "   Luego ejecuta este script de nuevo"
    exit 1
fi

echo "✅ Docker está funcionando"

# Detener container anterior
echo "🧹 Limpiando container anterior..."
docker stop evolution-api 2>/dev/null || true
docker rm evolution-api 2>/dev/null || true

# Iniciar Evolution API
echo "📦 Iniciando Evolution API v2.1.1..."
docker run -d \
  --name evolution-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="mypmsapikey123" \
  -e AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true \
  -e QRCODE_LIMIT=30 \
  -e CONFIG_SESSION_PHONE_CLIENT="Hospedy PMS" \
  -e CONFIG_SESSION_PHONE_NAME="Hospedy Bot" \
  atendai/evolution-api:v2.1.1

# Verificar
echo "⏳ Esperando que Evolution API inicie..."
for i in {1..12}; do
    echo "🔍 Verificando ($i/12)..."
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
        echo ""
        echo "✅ ¡EVOLUTION API FUNCIONANDO!"
        echo "================================"
        echo "🌐 URL: http://localhost:8080"
        echo "🔑 API Key: mypmsapikey123"
        echo "📱 Instancia: pms-whatsapp"
        echo ""
        echo "🎯 SIGUIENTE PASO:"
        echo "   Ve a: http://localhost:3001/whatsapp"
        echo "   Haz clic en 'Conectar WhatsApp'"
        echo ""
        echo "📋 Ver logs: docker logs -f evolution-api"
        exit 0
    fi
    sleep 5
done

echo "❌ Evolution API no respondió después de 60 segundos"
echo "📋 Verificar logs: docker logs evolution-api"