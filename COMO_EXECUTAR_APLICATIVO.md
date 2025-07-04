# 🚀 Como Executar o Aplicativo VidaLink

> **IMPORTANTE**: Este é um projeto **monorepo** - o aplicativo móvel está em `apps/mobile/`

## ❌ Erro Comum

Se você receber este erro:
```
Error: Cannot find module 'react-native/package.json'
```

**Causa**: Você está executando o comando no diretório errado!

## ✅ Solução Correta

### 1. **Navegue para o diretório correto**
```bash
cd apps/mobile
```

### 2. **Execute o script de inicialização**
```bash
./start.sh
```

**OU** execute manualmente:
```bash
npm install
npx expo start --port 8082 --clear
```

## 📁 Estrutura do Projeto

```
VidaLink/                    ← Diretório raiz (NÃO execute aqui)
├── apps/
│   ├── mobile/             ← Execute o app AQUI
│   │   ├── start.sh        ← Script de inicialização
│   │   ├── package.json    ← Dependências do mobile
│   │   └── ...
│   ├── api/                ← Backend
│   └── web/                ← Frontend web
└── package.json            ← Configuração do monorepo
```

## 🎯 Comandos Corretos

### Iniciar o App Mobile
```bash
# Método 1: Script automático (recomendado)
cd apps/mobile
./start.sh

# Método 2: Manual
cd apps/mobile
npm install
npx expo start --port 8082 --clear
```

### Iniciar Outros Apps
```bash
# Backend API
cd apps/api
npm run dev

# Frontend Web
cd apps/web
npm run dev
```

## 🔧 Solução de Problemas

### Se o erro persistir:
1. **Limpe as dependências**:
   ```bash
   cd apps/mobile
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verifique o Node.js**:
   ```bash
   node --version  # Deve ser >= 18.0.0
   npm --version   # Deve ser >= 9.0.0
   ```

3. **Instale o Expo CLI** (se necessário):
   ```bash
   sudo npm install -g @expo/cli
   ```

### Se o QR Code não funcionar:
- Verifique se o celular e computador estão na mesma rede WiFi
- Use o IP mostrado no terminal em vez de localhost
- Reinstale o app Expo Go no celular

## 📱 Testando o App

1. **Instale o Expo Go** no seu celular
2. **Execute** `./start.sh` em `apps/mobile/`
3. **Escaneie** o QR Code que aparece
4. **Aguarde** o app carregar

## 🆘 Ainda com Problemas?

Se o erro persistir, verifique:
- ✅ Você está em `apps/mobile/`
- ✅ O arquivo `package.json` existe
- ✅ A pasta `node_modules` existe
- ✅ O React Native está instalado

---

**Lembre-se**: Sempre execute comandos do React Native/Expo dentro de `apps/mobile/` ! 📱✨ 