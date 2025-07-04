# Guia de Deploy - VidaLink

## 🚀 Visão Geral

Este guia detalha como fazer deploy do VidaLink em produção, incluindo configurações de infraestrutura, segurança e monitoramento.

## 🏗️ Arquitetura de Produção

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Cloudflare│    │   Load Balancer │    │   Monitoring    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Backend   │    │   Database      │
│   (Vercel)      │    │   (Railway)     │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   File Storage  │    │   Backup        │
│   (Expo EAS)    │    │   (AWS S3)      │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 Deploy Mobile (Expo EAS)

### 1. Configuração Inicial

**Instalar EAS CLI:**
```bash
npm install -g @expo/eas-cli
```

**Login no Expo:**
```bash
eas login
```

**Inicializar projeto:**
```bash
cd apps/mobile
eas init
```

### 2. Configuração do Build

**eas.json:**
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "seu-apple-id@exemplo.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

**app.json (produção):**
```json
{
  "expo": {
    "name": "VidaLink",
    "slug": "vidalink",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vidalink.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.vidalink.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "seu-project-id"
      },
      "apiUrl": "https://api.vidalink.com"
    },
    "updates": {
      "url": "https://u.expo.dev/seu-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### 3. Build e Deploy

**Build para iOS:**
```bash
eas build --platform ios --profile production
```

**Build para Android:**
```bash
eas build --platform android --profile production
```

**Submit para App Stores:**
```bash
# iOS App Store
eas submit --platform ios --profile production

# Google Play Store
eas submit --platform android --profile production
```

**Updates OTA:**
```bash
eas update --branch production --message "Correções de bugs"
```

## 🌐 Deploy Web Frontend (Vercel)

### 1. Configuração

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://api.vidalink.com"
  }
}
```

### 2. Deploy Automático

**GitHub Actions (.github/workflows/deploy-web.yml):**
```yaml
name: Deploy Web Frontend

on:
  push:
    branches: [main]
    paths: ['apps/web/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd apps/web
          npm install
      
      - name: Build
        run: |
          cd apps/web
          npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
```

## 🔧 Deploy API Backend (Railway)

### 1. Configuração

**railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Dockerfile (opcional):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 2. Variáveis de Ambiente

**Configurar no Railway:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_jwt_secret_super_seguro_produção
SUPABASE_URL=https://sua-url-supabase.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_KEY=sua_chave_servico
ALLOWED_ORIGINS=https://vidalink.com,https://app.vidalink.com
```

### 3. Deploy Automático

**GitHub Actions (.github/workflows/deploy-api.yml):**
```yaml
name: Deploy API Backend

on:
  push:
    branches: [main]
    paths: ['apps/api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy-action@v1.1.0
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: vidalink-api
```

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Configuração de Produção

**Configurações recomendadas:**
- **Plan**: Pro ou Team
- **Region**: São Paulo (South America)
- **Backup**: Automático diário
- **SSL**: Obrigatório
- **Row Level Security**: Habilitado

### 2. Migrações

**Executar schema em produção:**
```sql
-- Execute via Supabase Dashboard > SQL Editor
-- Copie o conteúdo de apps/api/database/schema.sql
```

### 3. Políticas de Segurança

**RLS Policies:**
```sql
-- Política para usuários verem apenas seus dados
CREATE POLICY "Users can view own data" ON health_events
FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários editarem apenas seus dados
CREATE POLICY "Users can edit own data" ON health_events
FOR ALL USING (auth.uid() = user_id);
```

## 🔒 Segurança

### 1. HTTPS e SSL

**Configurar SSL no Railway:**
- Certificado automático via Let's Encrypt
- Redirect HTTP para HTTPS
- HSTS headers habilitados

### 2. Firewall e Rate Limiting

**Configurar Cloudflare:**
```javascript
// Rate limiting rules
{
  "rules": [
    {
      "action": "block",
      "expression": "(http.request.uri.path eq \"/api/auth/login\" and rate(10m) > 10)"
    },
    {
      "action": "challenge",
      "expression": "(rate(1m) > 100)"
    }
  ]
}
```

### 3. Monitoramento

**Configurar alertas:**
- Uptime monitoring
- Error rate alerts
- Performance monitoring
- Security incident alerts

## 📊 Monitoramento e Logs

### 1. Sentry (Error Tracking)

**Configuração:**
```javascript
// apps/api/src/config/sentry.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. LogRocket (Session Replay)

**Frontend:**
```javascript
// apps/web/src/main.tsx
import LogRocket from 'logrocket';

if (import.meta.env.PROD) {
  LogRocket.init('app-id');
}
```

### 3. Uptime Monitoring

**Configurar Uptime Robot:**
- Monitor API endpoints
- Monitor web frontend
- Monitor mobile app updates
- Alert via email/SMS

## 🚀 Pipeline de Deploy

### 1. Estratégia de Branches

```
main (produção)
├── develop (staging)
├── feature/nova-funcionalidade
└── hotfix/correção-crítica
```

### 2. Ambientes

- **Development**: Local
- **Staging**: Deploy automático do branch `develop`
- **Production**: Deploy manual do branch `main`

### 3. Checklist de Deploy

**Pré-Deploy:**
- [ ] Testes automatizados passando
- [ ] Code review aprovado
- [ ] Backup do banco de dados
- [ ] Verificação de dependências
- [ ] Configuração de variáveis de ambiente

**Deploy:**
- [ ] Deploy da API
- [ ] Deploy do frontend web
- [ ] Update do app mobile (se necessário)
- [ ] Verificação de health checks

**Pós-Deploy:**
- [ ] Testes de fumaça
- [ ] Verificação de logs
- [ ] Monitoramento de métricas
- [ ] Comunicação para stakeholders

## 🔄 Rollback

### 1. Estratégia de Rollback

**API (Railway):**
```bash
# Via Railway CLI
railway rollback deployment-id
```

**Frontend (Vercel):**
```bash
# Via Vercel CLI
vercel rollback deployment-url
```

**Mobile (Expo):**
```bash
# Rollback OTA update
eas update --branch production --message "Rollback" --republish
```

### 2. Rollback Automático

**Health Check Failure:**
```yaml
# .github/workflows/auto-rollback.yml
name: Auto Rollback

on:
  workflow_run:
    workflows: ["Deploy API Backend"]
    types: [completed]

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Health Check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.vidalink.com/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed, initiating rollback"
            # Rollback logic here
          fi
```

## 📈 Escalabilidade

### 1. Load Balancing

**Configurar múltiplas instâncias:**
- Railway: Auto-scaling habilitado
- Vercel: Edge functions
- Supabase: Read replicas

### 2. Cache

**Redis para cache:**
```javascript
// Cache de sessões e dados frequentes
const redis = new Redis(process.env.REDIS_URL);

// Cache de 1 hora para dados de usuário
await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
```

### 3. CDN

**Cloudflare para assets:**
- Cache de imagens
- Minificação automática
- Compressão Gzip/Brotli

## 💰 Custos Estimados

### Infraestrutura Mensal

- **Railway (API)**: $5-20/mês
- **Vercel (Web)**: $0-20/mês
- **Supabase (Database)**: $25-100/mês
- **Expo EAS (Mobile)**: $29/mês
- **Cloudflare (CDN)**: $0-20/mês
- **Sentry (Monitoring)**: $0-26/mês

**Total estimado**: $59-215/mês

## 📞 Suporte Pós-Deploy

### 1. Monitoramento 24/7

- Uptime monitoring
- Error tracking
- Performance monitoring
- Security monitoring

### 2. Backup e Recuperação

- Backup automático diário
- Backup antes de deploys
- Teste de recuperação mensal
- Plano de disaster recovery

### 3. Contatos de Emergência

- **DevOps**: devops@vidalink.com
- **Suporte**: support@vidalink.com
- **Emergência**: +55 11 99999-9999

---

**Deploy concluído com sucesso!** 🎉

Para suporte técnico: deploy-support@vidalink.com 