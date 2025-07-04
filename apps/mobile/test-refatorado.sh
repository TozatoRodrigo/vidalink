#!/bin/bash

echo "🎯 VIDALINK - VERSÃO REFATORADA"
echo "==============================="

# Parar processos
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Verificar pasta
if [ ! -f "app.json" ]; then
    echo "❌ Execute na pasta apps/mobile"
    exit 1
fi

echo "🚀 Iniciando servidor refatorado..."
echo "📱 Escaneie o QR Code com Expo Go"

# Iniciar com configuração mínima
npx expo start --clear --port 8081

echo "✅ Servidor iniciado!" 