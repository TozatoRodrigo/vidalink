#!/bin/bash

echo "🎯 VIDALINK - APP FUNCIONANDO"
echo "============================"

# Parar processos antigos
echo "🛑 Parando processos antigos..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Limpeza de cache
echo "🧹 Limpando cache..."
rm -rf .expo
rm -rf node_modules/.cache
npx expo r -c 2>/dev/null || true

# Verificar se @babel/runtime existe
echo "✅ Verificando @babel/runtime..."
if [ ! -f "node_modules/@babel/runtime/helpers/interopRequireDefault.js" ]; then
    echo "❌ @babel/runtime não encontrado - instalando..."
    
    # Criar diretório e instalar manualmente
    mkdir -p node_modules/@babel/runtime
    cd node_modules/@babel/runtime
    
    # Baixar e extrair o pacote
    npm pack @babel/runtime@7.27.6
    tar -xzf babel-runtime-7.27.6.tgz --strip-components=1
    rm babel-runtime-7.27.6.tgz
    
    cd ../..
    echo "✅ @babel/runtime instalado!"
else
    echo "✅ @babel/runtime já está instalado!"
fi

# Verificar dependências essenciais do Expo
echo "🔍 Verificando dependências essenciais do Expo..."

EXPO_DEPS=("expo-asset" "expo-constants" "expo-file-system" "expo-font")
MISSING_DEPS=()

for dep in "${EXPO_DEPS[@]}"; do
    if [ ! -d "node_modules/$dep" ]; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo "❌ Dependências faltando: ${MISSING_DEPS[*]}"
    echo "📦 Instalando dependências essenciais..."
    npm install ${MISSING_DEPS[*]} --legacy-peer-deps
    echo "✅ Dependências instaladas!"
else
    echo "✅ Todas as dependências essenciais estão instaladas!"
fi

# Verificar se ainda há problemas
echo "🔍 Verificação final..."
if [ ! -f "node_modules/@babel/runtime/helpers/interopRequireDefault.js" ]; then
    echo "❌ Erro crítico: @babel/runtime ainda não está funcionando!"
    exit 1
fi

echo "✅ Tudo pronto!"
echo ""
echo "🚀 Iniciando servidor..."
echo "📱 Escaneie o QR Code com Expo Go ou use o simulador iOS"
echo ""

# Iniciar servidor
EXPO_USE_LOCAL_CLI=1 npx expo start --clear --port 8081 