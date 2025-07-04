#!/bin/bash

echo "🚀 Iniciando VidaLink App..."

# Limpar cache e processos
echo "🧹 Limpando cache..."
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Verificar se está na pasta correta
if [ ! -f "app.json" ]; then
    echo "❌ Erro: Execute este script na pasta apps/mobile"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "🔧 Corrigindo versões das dependências..."
npx expo install --fix

echo "🌐 Iniciando servidor Expo..."
echo "📱 Abra o Expo Go no seu iPhone e escaneie o QR Code"
echo "🔄 Se houver erro, tente fechar e reabrir o Expo Go"

# Iniciar com configurações otimizadas
npx expo start --clear --reset-cache --lan

echo "✅ Servidor iniciado com sucesso!" 