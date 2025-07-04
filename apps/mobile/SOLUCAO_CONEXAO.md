# 🔧 VidaLink - Solução de Problemas de Conexão

## ❌ Erro Atual
```
Could not connect to development server.
URL: http://192.168.0.19:8081/apps/mobile/index.bundle?platform=ios&dev=true
```

## ✅ Soluções Testadas

### 1. 📱 Para Dispositivo Físico (iPhone)

#### Opção A: Usar o script automático
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
./teste-conexao.sh
# Escolha opção 2 (IP da rede)
```

#### Opção B: Manual
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
pkill -f expo && sleep 3
npx expo start --clear --lan --port 8081
```

### 2. 🖥️ Para Simulador iOS

#### Opção A: Localhost
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
pkill -f expo && sleep 3
npx expo start --clear --localhost --port 8081
# Pressione 'i' para abrir no simulador
```

#### Opção B: Abrir simulador automaticamente
```bash
npx expo start --clear --localhost --port 8081 --ios
```

### 3. 🌐 Para Redes Complexas (Tunnel)

```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
npx expo start --clear --tunnel --port 8081
```

## 🔍 Diagnóstico de Problemas

### Verificar IP da Rede
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Verificar Portas em Uso
```bash
lsof -i :8081
```

### Limpar Cache Completo
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
rm -rf .expo .metro-cache node_modules/.cache
npx expo start --clear
```

## 🚀 Teste Rápido (RECOMENDADO)

1. **Pare todos os processos:**
   ```bash
   pkill -f expo && pkill -f Metro
   ```

2. **Inicie com localhost:**
   ```bash
   cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
   npx expo start --clear --localhost --port 8081
   ```

3. **No terminal, pressione 'i' para abrir o simulador iOS**

4. **Se usar iPhone físico, escaneie o QR Code com a câmera**

## 📱 Configurações do Expo Go

- Certifique-se de que o Expo Go está atualizado
- iPhone e Mac na mesma rede WiFi
- Desabilite VPN se estiver usando

## ⚠️ Problemas Conhecidos

1. **Erro de assets:** O app está procurando assets na pasta raiz
2. **Babel runtime:** Dependência resolvida
3. **Versões:** Algumas dependências têm versões conflitantes (funcionais)

## 🎯 Status Atual

✅ Dependências instaladas
✅ @babel/runtime configurado  
✅ Scripts de teste criados
✅ Servidor iniciando corretamente
⚠️ Problema de conexão de rede

## 🔄 Próximos Passos

1. Teste com localhost primeiro
2. Se funcionar, teste com IP da rede
3. Use tunnel como último recurso
4. Reporte qual método funcionou 