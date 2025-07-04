#!/bin/bash

echo "🚀 Iniciando VidaLink..."

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .expo
rm -rf node_modules/.cache

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🌐 Iniciando servidor..."
npx expo start --clear

echo "✅ Servidor iniciado!" 