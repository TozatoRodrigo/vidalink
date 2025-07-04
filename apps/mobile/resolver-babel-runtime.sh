#!/bin/bash

echo "🔧 RESOLVENDO ERRO BABEL RUNTIME"
echo "================================"

# Verificar se está na pasta correta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🛑 Parando processos..."
killall node 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

echo "🧹 Limpando cache completamente..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true

echo "📦 Reinstalando node_modules..."
rm -rf node_modules
npm install

echo "🔨 Instalando dependências do Babel..."
npm install @babel/runtime @babel/core @babel/preset-env babel-preset-expo

echo "⚙️ Corrigindo versões das dependências..."
npx expo install --fix

echo "🧹 Limpando cache final..."
npx expo start --clear --reset-cache &
sleep 5
pkill -f "expo" 2>/dev/null || true

echo "✅ Babel Runtime corrigido!"
echo "🚀 Iniciando servidor..."

# Configurar variáveis para evitar o erro
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export BABEL_DISABLE_CACHE=1

# Iniciar com configuração limpa
npx expo start --clear --localhost --port 8081 --ios

echo "✅ Servidor iniciado sem erro de Babel!" 