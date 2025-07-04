#!/bin/bash

echo "🎯 VIDALINK - TESTE FINAL FUNCIONANDO"
echo "===================================="

# Verificar se está na pasta correta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🛑 Parando processos antigos..."
killall node 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
sleep 2

echo "🧹 Limpando cache..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "✅ Verificando @babel/runtime..."
if [ -f "node_modules/@babel/runtime/helpers/interopRequireDefault.js" ]; then
    echo "✅ @babel/runtime OK!"
else
    echo "❌ @babel/runtime não encontrado"
    exit 1
fi

echo "✅ Verificando @types/react..."
if [ -d "node_modules/@types/react" ]; then
    echo "✅ @types/react OK!"
else
    echo "❌ @types/react não encontrado"
    exit 1
fi

echo "🚀 Iniciando servidor para simulador iOS..."
echo "📱 Aguarde o simulador abrir automaticamente"
echo "⚠️  Se não abrir, pressione 'i' no terminal"

# Configurar variáveis para simulador iOS
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export RCT_METRO_PORT=8081

# Iniciar servidor
npx expo start --clear --localhost --port 8081 --ios

echo "✅ Servidor iniciado!" 