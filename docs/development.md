# 🛠️ Guia de Desenvolvimento - VidaLink

Este guia contém informações essenciais para desenvolvedores trabalhando no projeto VidaLink.

## 🏗️ Arquitetura do Projeto

### Estrutura de Monorepo

```
VidaLink/
├── apps/
│   ├── api/          # Backend Node.js + Express
│   ├── web/          # Frontend React (médicos)
│   ├── mobile/       # React Native (pacientes)
│   └── shared/       # Tipos e utilitários compartilhados
├── docs/             # Documentação
├── tests/            # Testes E2E
└── package.json      # Configuração do workspace
```

### Stack Tecnológica

**Backend (API):**
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- JWT para autenticação
- Winston para logging
- Zod para validação

**Frontend Web:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query/TanStack Query
- Vite

**Mobile:**
- React Native (Expo)
- TypeScript
- Expo Router
- React Query
- NativeWind (Tailwind para RN)

**Serviços Externos:**
- OpenAI API (análise de exames)
- Google Vision API (OCR)
- Supabase Storage (arquivos)

## 🚀 Configuração do Ambiente

### Pré-requisitos

```bash
# Node.js e npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Para mobile
npm install -g @expo/cli
```

### Instalação

1. **Clone e instale dependências:**
```bash
git clone <repo-url>
cd VidaLink
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

3. **Execute os serviços:**
```bash
# Todos os serviços
npm run dev

# Serviços individuais
npm run dev:api      # Backend (porta 3001)
npm run dev:web      # Frontend web (porta 3000)
npm run dev:mobile   # App mobile (Expo)
```

## 📝 Convenções de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona endpoint de upload de exames
fix: corrige validação de CPF
docs: atualiza documentação da API
chore: atualiza dependências
test: adiciona testes para autenticação
```

### Estrutura de Arquivos

```bash
# Componentes React (PascalCase)
UserProfile.tsx
HealthEventCard.tsx

# Hooks customizados (camelCase com use)
useAuth.ts
useHealthEvents.ts

# Utilitários (camelCase)
apiClient.ts
dateUtils.ts

# Constantes (UPPER_SNAKE_CASE)
API_ENDPOINTS.ts
HEALTH_EVENT_TYPES.ts
```

### TypeScript

- Use tipos explícitos sempre que possível
- Prefira `interface` para objetos, `type` para unions
- Use Zod schemas para validação de dados da API
- Documente APIs públicas com JSDoc

```typescript
/**
 * Cria um novo evento de saúde
 * @param eventData - Dados do evento
 * @returns Promise com o evento criado
 */
export async function createHealthEvent(
  eventData: CreateHealthEventRequest
): Promise<HealthEvent> {
  // implementação
}
```

## 🧪 Testes

### Estrutura de Testes

```bash
apps/api/src/
├── __tests__/
│   ├── auth.test.ts
│   ├── healthEvents.test.ts
│   └── utils.test.ts
└── routes/
    ├── auth.ts
    └── __tests__/
        └── auth.integration.test.ts
```

### Executando Testes

```bash
# Todos os testes
npm run test

# Testes por workspace
npm run test --workspace=apps/api
npm run test --workspace=apps/web

# Testes em modo watch
npm run test:watch --workspace=apps/api

# Coverage
npm run test -- --coverage
```

### Exemplos de Teste

**Teste Unitário:**
```typescript
import { isValidCPF } from '@vidalink/shared';

describe('isValidCPF', () => {
  it('should validate correct CPF', () => {
    expect(isValidCPF('11144477735')).toBe(true);
  });

  it('should reject invalid CPF', () => {
    expect(isValidCPF('12345678901')).toBe(false);
  });
});
```

**Teste de Integração:**
```typescript
import request from 'supertest';
import app from '../index';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        // ...
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔐 Segurança

### Autenticação

- JWT tokens com expiração de 7 dias
- Refresh tokens para renovação automática
- Middleware de autenticação em rotas protegidas
- Rate limiting por IP

### Validação de Dados

```typescript
// Use Zod schemas para validação
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// Valide no middleware
app.post('/users', validate(createUserSchema), createUser);
```

### LGPD/Privacidade

- Criptografia de dados sensíveis
- Logs sem informações pessoais
- Tokens QR com expiração
- Controle de acesso granular

## 🐛 Debug e Logging

### Logs Estruturados

```typescript
import { logger } from './utils/logger';

// Diferentes níveis
logger.info('User registered', { userId: '123' });
logger.warn('Rate limit exceeded', { ip: req.ip });
logger.error('Database error', { error: err.message });
```

### Debug no VS Code

`.vscode/launch.json`:
```json
{
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/index.ts",
      "runtimeArgs": ["-r", "tsx/cjs"]
    }
  ]
}
```

## 📱 Desenvolvimento Mobile

### Expo Development Build

```bash
# Instalar Expo CLI
npm install -g @expo/cli

# Executar no simulador
npm run dev:mobile

# Executar em dispositivo físico
expo start --tunnel
```

### Debugging React Native

- Use Flipper para debug avançado
- React Native Debugger para Redux/Context
- Console.log aparece no terminal do Expo

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run build
```

### Deploy

- **API**: Vercel, Railway ou AWS
- **Web**: Vercel, Netlify
- **Mobile**: Expo EAS Build

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feat/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feat/nova-funcionalidade`
5. Abra um Pull Request

### Code Review

- Pelo menos 1 aprovação necessária
- Testes devem passar
- Coverage mínimo de 80%
- Linting sem erros

## 📚 Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Expo Docs](https://docs.expo.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)

## 🆘 Troubleshooting

### Problemas Comuns

**Erro de CORS:**
```bash
# Verifique a variável CORS_ORIGIN no .env
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

**Erro de JWT:**
```bash
# Gere uma nova chave secreta
openssl rand -base64 32
```

**Expo não conecta:**
```bash
# Limpe o cache
expo start --clear
```

**Build falha:**
```bash
# Limpe node_modules
rm -rf node_modules package-lock.json
npm install
``` 