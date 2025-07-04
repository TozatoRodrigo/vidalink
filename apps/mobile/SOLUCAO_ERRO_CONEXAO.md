# 🔧 Solução para Erro de Conexão - VidaLink

## ❌ Erro Comum
```
Could not connect to development server.
URL: http://192.168.0.19:8082/apps/mobile/index.bundle?platform=ios&dev=true...
```

## ✅ Solução Definitiva

### Método 1: Script Automatizado (Recomendado)
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
./start-app.sh
```

### Método 2: Passo a Passo Manual

#### 1. Limpar Completamente
```bash
cd /Users/rodrigodiastozato/Desktop/VidaLink/apps/mobile
pkill -f "expo" || true
pkill -f "metro" || true
rm -rf .expo
rm -rf node_modules/.cache
```

#### 2. Corrigir Dependências
```bash
npx expo install --fix
```

#### 3. Iniciar com Configurações Otimizadas
```bash
npx expo start --clear --reset-cache --lan
```

## 🎯 Teste no iPhone

### Passo 1: Aguardar QR Code
- Aguarde aparecer o QR Code no terminal
- Deve mostrar: "Metro waiting on exp://..."

### Passo 2: Conectar no Expo Go
1. **Abra o Expo Go** no iPhone
2. **Escaneie o QR Code** do terminal
3. **Aguarde o download** (pode demorar)

### Passo 3: Se Ainda Houver Erro

#### Opção A: Modo Tunnel
```bash
pkill -f "expo" && sleep 2
npx expo start --clear --tunnel
```

#### Opção B: Localhost
```bash
pkill -f "expo" && sleep 2
npx expo start --clear --localhost
```

#### Opção C: Porta Específica
```bash
pkill -f "expo" && sleep 2
npx expo start --clear --port 8081
```

## 🔍 Verificações Importantes

### 1. Rede WiFi
- ✅ iPhone e Mac na mesma rede WiFi
- ✅ Firewall não está bloqueando

### 2. Versões das Dependências
- ✅ React Native atualizado
- ✅ AsyncStorage compatível
- ✅ React Native SVG atualizado

### 3. Cache Limpo
- ✅ Cache do Expo removido
- ✅ Cache do Metro removido
- ✅ Node modules cache limpo

## 🚨 Soluções de Emergência

### Se Nada Funcionar:
1. **Reinstalar dependências**:
   ```bash
   rm -rf node_modules
   npm install
   npx expo install --fix
   ```

2. **Usar IP manual no Expo Go**:
   - Abra Expo Go
   - Toque em "Enter URL manually"
   - Digite: `exp://192.168.0.19:8081`

3. **Reiniciar dispositivos**:
   - Reinicie o iPhone
   - Reinicie o Mac
   - Reconecte na WiFi

## 📱 O Que Esperar Quando Funcionar

### Tela Principal
- ✅ Header azul "Olá, Usuário! 👋"
- ✅ Cards de estatísticas
- ✅ Barra de busca
- ✅ Botões "Adicionar Exemplo" e "Compartilhar"

### Funcionalidades Testáveis
1. **➕ Adicionar Evento**: Cria evento de exemplo
2. **🔍 Buscar**: Filtra eventos por texto
3. **🎯 Filtrar**: Filtra por tipo e data
4. **✏️ Editar**: Modifica eventos existentes
5. **🗑️ Excluir**: Remove eventos
6. **📱 QR Code**: Gera código para compartilhar

## 🎉 Status Atual
- ✅ **Dependências**: Corrigidas e compatíveis
- ✅ **Configuração**: Otimizada para conexão
- ✅ **Cache**: Completamente limpo
- ✅ **Script**: Automatizado para facilitar

---

**💡 Dica**: Use sempre o script `./start-app.sh` para iniciar o app. Ele resolve automaticamente os problemas mais comuns! 