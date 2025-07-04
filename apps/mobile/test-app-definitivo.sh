#!/bin/bash

echo "🎯 TESTE DEFINITIVO - VidaLink App"
echo "=================================="

# Parar todos os processos
echo "🛑 Parando todos os servidores..."
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
sleep 3

# Verificar se estamos na pasta correta
if [ ! -f "app.json" ]; then
    echo "❌ Erro: Execute na pasta apps/mobile"
    exit 1
fi

# Limpar completamente
echo "🧹 Limpeza completa..."
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true

# Reinstalar tudo
echo "📦 Reinstalando dependências..."
npm install

# Instalar dependências específicas
echo "🔧 Instalando dependências específicas..."
npm install @babel/runtime @babel/core metro-react-native-babel-transformer

# Corrigir versões
echo "⚙️ Corrigindo versões..."
npx expo install --fix

# Verificar se tudo está instalado
echo "✅ Verificando instalação..."
if [ ! -d "node_modules" ]; then
    echo "❌ Erro: node_modules não foi criado"
    exit 1
fi

# Iniciar servidor com configurações específicas
echo "🚀 Iniciando servidor (aguarde o QR Code)..."
echo "📱 Quando aparecer o QR Code, escaneie com o Expo Go"
echo "🔄 Se houver erro, feche e reabra o Expo Go"

# Usar configurações específicas para resolver o problema
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.19

npx expo start --clear --reset-cache --port 8081

echo "✅ Servidor iniciado!" 