#!/bin/bash

echo "🎯 VIDALINK - BABEL RUNTIME RESOLVIDO"
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

echo "✅ @babel/runtime instalado corretamente!"
echo "🔍 Verificando instalação..."
if [ -f "node_modules/@babel/runtime/helpers/interopRequireDefault.js" ]; then
    echo "✅ interopRequireDefault.js encontrado!"
else
    echo "❌ Erro: interopRequireDefault.js não encontrado"
    exit 1
fi

echo "🚀 Iniciando servidor para simulador iOS..."
echo "📱 Aguarde o simulador abrir automaticamente"

# Configurar variáveis para simulador
export EXPO_PROJECT_ROOT="$(pwd)"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"

# Iniciar servidor
npx expo start --clear --localhost --port 8081 --ios

echo "✅ Servidor iniciado!" 