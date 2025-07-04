#!/bin/bash

echo "🎯 VIDALINK - TESTE FINAL"
echo "========================="

# Parar processos
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Verificar pasta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🔧 Corrigindo bundle path..."

# Limpar cache
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "🚀 Iniciando servidor com configuração correta..."
echo "📱 Escaneie o QR Code com Expo Go"
echo "⚠️  Aguarde o download do bundle (primeira vez pode demorar)"

# Configurar variáveis de ambiente para corrigir o path
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.19"

# Iniciar com configuração específica
npx expo start --clear --port 8081 --no-dev --minify

echo "✅ Servidor iniciado com bundle path correto!" 