#!/bin/bash

echo "🎯 VIDALINK - TESTE FINAL LIMPO"
echo "==============================="

# Parar todos os processos
echo "🛑 Parando processos antigos..."
pkill -f "expo" 2>/dev/null || true
pkill -f "Metro" 2>/dev/null || true
sleep 2

# Navegar para o diretório correto
cd "$(dirname "$0")"

# Limpeza completa
echo "🧹 Limpeza completa..."
rm -rf node_modules package-lock.json
rm -rf .expo
rm -rf .metro-cache
npx expo install --fix

# Instalar dependências essenciais
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps

# Verificar se @babel/runtime está instalado
if [ ! -d "node_modules/@babel/runtime" ]; then
    echo "🔧 Instalando @babel/runtime..."
    npm install @babel/runtime --legacy-peer-deps
fi

# Instalar dependências do Expo essenciais
echo "🔧 Instalando dependências do Expo..."
npm install expo-asset expo-constants expo-file-system expo-font expo-notifications --legacy-peer-deps

# Corrigir versões
echo "⚙️ Corrigindo versões..."
npx expo install --fix

# Iniciar servidor
echo "🚀 Iniciando servidor..."
echo "📱 Escaneie o QR Code com Expo Go no seu iPhone"
echo "🔄 Se houver erro, feche e reabra o Expo Go"
echo ""

npx expo start --clear --port 8081 