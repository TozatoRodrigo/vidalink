#!/bin/bash

echo "🎯 VIDALINK - SEM PROBLEMAS DE TYPESCRIPT"
echo "=========================================="

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

echo "🔧 Instalando @types/react para evitar erro..."
npm install @types/react@~19.0.10 --legacy-peer-deps --no-save 2>/dev/null || true

echo "🚀 Iniciando servidor SEM problemas de TypeScript..."
echo "📱 Aguarde o simulador abrir automaticamente"

# Configurar variáveis para simulador
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export EXPO_NO_TYPESCRIPT_SETUP=1

# Iniciar servidor com flags específicas
npx expo start --clear --localhost --port 8081 --ios --no-dev

echo "✅ Servidor iniciado!" 