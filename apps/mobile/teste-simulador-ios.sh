#!/bin/bash

echo "🎯 VIDALINK - SIMULADOR iOS"
echo "==========================="

# Verificar se está na pasta correta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🛑 Parando processos antigos..."
killall node 2>/dev/null || true
killall -9 node 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

echo "🧹 Limpando cache..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true

echo "🔧 Configurando para simulador iOS..."

# Configurar variáveis para simulador
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export RCT_METRO_PORT=8081

echo "🚀 Iniciando Metro Bundler..."
echo "📱 Aguarde o simulador abrir automaticamente"
echo "⚠️  Se não abrir, pressione 'i' no terminal"

# Iniciar com configuração específica para simulador
npx expo start --clear --localhost --port 8081 --ios

echo "✅ Configuração para simulador iOS aplicada!" 