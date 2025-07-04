#!/bin/bash

echo "🔧 Resolvendo erro do Babel Runtime..."

# Parar todos os processos
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Limpar completamente
echo "🧹 Limpando cache..."
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json

# Reinstalar dependências essenciais
echo "📦 Reinstalando dependências..."
npm install

# Instalar dependências do Babel
echo "🔨 Instalando dependências do Babel..."
npm install @babel/runtime @babel/core @babel/preset-env

# Corrigir versões das dependências do Expo
echo "🔧 Corrigindo versões das dependências..."
npx expo install --fix

# Limpar cache do Metro
echo "🧹 Limpando cache do Metro..."
npx react-native start --reset-cache || true

echo "✅ Correção concluída!"
echo "🚀 Iniciando servidor..."

# Iniciar servidor
npx expo start --clear --reset-cache 