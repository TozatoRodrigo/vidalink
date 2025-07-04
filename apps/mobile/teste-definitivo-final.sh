#!/bin/bash

echo "🎯 VIDALINK - TESTE DEFINITIVO FINAL"
echo "==================================="

# Verificar pasta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🛑 Parando processos..."
killall node 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
sleep 2

echo "🧹 Limpando cache..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "✅ Dependências já instaladas com --legacy-peer-deps"
echo "🚀 Iniciando servidor para simulador iOS..."

# Configurar variáveis
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"

# Iniciar servidor
npx expo start --clear --localhost --port 8081 --ios

echo "✅ Servidor iniciado!" 