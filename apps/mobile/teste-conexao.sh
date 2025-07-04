#!/bin/bash

echo "🔧 VIDALINK - RESOLVER CONEXÃO"
echo "==============================="

# Parar processos
echo "🛑 Parando processos..."
pkill -f expo 2>/dev/null || true
pkill -f Metro 2>/dev/null || true
sleep 3

# Navegar para o diretório correto
cd "$(dirname "$0")"

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .expo
rm -rf .metro-cache
rm -rf node_modules/.cache

# Verificar IP da rede
echo "🌐 Verificando IP da rede..."
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "IP encontrado: $IP"

# Testar diferentes abordagens
echo ""
echo "🚀 OPÇÕES DE TESTE:"
echo "1. Localhost (para simulador)"
echo "2. IP da rede (para dispositivo físico)"
echo "3. Tunnel (para redes complexas)"
echo ""

read -p "Escolha uma opção (1, 2 ou 3): " opcao

case $opcao in
    1)
        echo "🔧 Iniciando com localhost..."
        npx expo start --clear --localhost --port 8081
        ;;
    2)
        echo "🔧 Iniciando com IP da rede..."
        npx expo start --clear --lan --port 8081
        ;;
    3)
        echo "🔧 Iniciando com tunnel..."
        npx expo start --clear --tunnel --port 8081
        ;;
    *)
        echo "❌ Opção inválida. Usando localhost por padrão..."
        npx expo start --clear --localhost --port 8081
        ;;
esac 