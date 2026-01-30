#!/bin/bash

echo "🚀 Configurando Evolution API para WhatsApp..."
echo "=============================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde: https://docker.com/get-started"
    exit 1
fi

# Verificar si el puerto 8080 está libre
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  El puerto 8080 ya está en uso. Deteniendo servicios existentes..."
    sudo lsof -ti:8080 | xargs sudo kill -9
    sleep 2
fi

# Detener container anterior si existe
echo "🔄 Deteniendo Evolution API anterior..."
docker stop evolution-api 2>/dev/null || true
docker rm evolution-api 2>/dev/null || true

# Limpiar volúmenes anteriores si existen
echo "🧹 Limpiando datos anteriores..."
docker volume rm evolution_instances 2>/dev/null || true

echo "📦 Descargando y iniciando Evolution API..."

# Iniciar Evolution API v2.1.1 (versión estable)
docker run -d \
  --name evolution-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="mypmsapikey123" \
  -e AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true \
  -e QRCODE_LIMIT=30 \
  -e WEBSOCKET_ENABLED=false \
  -e CONFIG_SESSION_PHONE_CLIENT="Hospedy PMS" \
  -e CONFIG_SESSION_PHONE_NAME="Hospedy Bot" \
  -v evolution_instances:/evolution/instances \
  atendai/evolution-api:v2.1.1

# Esperar a que inicie
echo "⏳ Esperando que Evolution API inicie (30 segundos)..."
sleep 10

# Verificar estado
for i in {1..6}; do
    echo "🔍 Intento $i/6 - Verificando conexión..."
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
        echo "✅ Evolution API está funcionando!"
        echo ""
        echo "📱 CONFIGURACIÓN COMPLETADA"
        echo "=========================="
        echo "• URL API: http://localhost:8080"  
        echo "• API Key: mypmsapikey123"
        echo "• Instancia: pms-whatsapp"
        echo ""
        echo "🌐 Ahora ve a: http://localhost:3000/whatsapp"
        echo "   y haz clic en 'Conectar WhatsApp'"
        echo ""
        echo "📋 Logs del contenedor:"
        echo "   docker logs -f evolution-api"
        exit 0
    fi
    sleep 5
done

echo "❌ Evolution API no respondió después de 30 segundos"
echo "📋 Verificar logs: docker logs evolution-api"
echo "🔧 Verificar puertos: netstat -tulpn | grep :8080"
exit 1