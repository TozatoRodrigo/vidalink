# Guia de Instalação - VidaLink

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento

- **Node.js**: Versão 18.0.0 ou superior
- **npm**: Versão 8.0.0 ou superior (ou yarn)
- **Git**: Para controle de versão
- **Expo CLI**: Para desenvolvimento mobile

### Ferramentas Recomendadas

- **VS Code**: Editor de código recomendado
- **Expo Go**: App para testes em dispositivos físicos
- **Postman**: Para testes de API
- **Supabase Account**: Para banco de dados em produção

## 🚀 Instalação Completa

### 1. Clone do Repositório

```bash
git clone https://github.com/seu-usuario/vidalink.git
cd vidalink
```

### 2. Instalação das Dependências

**Instalar dependências globais:**
```bash
npm install -g expo-cli
npm install -g @expo/cli
```

**Instalar dependências do projeto:**
```bash
# Raiz do projeto
npm install

# Mobile
cd apps/mobile
npm install
cd ../..

# Web
cd apps/web
npm install
cd ../..

# API
cd apps/api
npm install
cd ../..

# Shared
cd apps/shared
npm install
cd ../..
```

### 3. Configuração do Ambiente

**API (.env):**
```bash
cd apps/api
cp env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
# Database
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_KEY=sua_chave_servico

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,exp://localhost:8081
```

### 4. Configuração do Banco de Dados

**Supabase Setup:**
1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o schema SQL:

```bash
cd apps/api/database
# Execute schema.sql no Supabase SQL Editor
```

**Schema Principal:**
```sql
-- Execute o conteúdo de apps/api/database/schema.sql
-- no painel SQL do Supabase
```

### 5. Executar o Projeto

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd apps/mobile
npm start
```

**Terminal 3 - Web (opcional):**
```bash
cd apps/web
npm run dev
```

## 📱 Configuração Mobile

### Expo Configuration

O arquivo `app.json` já está configurado:
```json
{
  "expo": {
    "name": "VidaLink",
    "slug": "vidalink",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "sdkVersion": "51.0.0"
  }
}
```

### Testando no Dispositivo

1. **Instale o Expo Go** no seu dispositivo
2. **Execute** `npm start` em `apps/mobile`
3. **Escaneie o QR Code** com o Expo Go
4. **Aguarde** o build e download

### Testando no Simulador

**iOS Simulator:**
```bash
cd apps/mobile
npm start
# Pressione 'i' para abrir no iOS Simulator
```

**Android Emulator:**
```bash
cd apps/mobile
npm start
# Pressione 'a' para abrir no Android Emulator
```

## 🌐 Configuração Web

### Desenvolvimento Local

```bash
cd apps/web
npm run dev
```

Acesse: `http://localhost:5173`

### Build para Produção

```bash
cd apps/web
npm run build
npm run preview
```

## 🔧 Resolução de Problemas

### Problemas Comuns

**1. Erro de dependências do Expo:**
```bash
cd apps/mobile
npx expo install --fix
```

**2. Cache do Metro Bundler:**
```bash
cd apps/mobile
npx expo start --clear
```

**3. Problemas de CORS:**
- Verifique `ALLOWED_ORIGINS` no `.env`
- Reinicie o servidor da API

**4. Erro de conexão com Supabase:**
- Verifique as URLs e chaves no `.env`
- Confirme que o projeto Supabase está ativo

### Limpeza Completa

```bash
# Limpar node_modules
rm -rf node_modules apps/*/node_modules

# Reinstalar tudo
npm install
cd apps/mobile && npm install && cd ../..
cd apps/web && npm install && cd ../..
cd apps/api && npm install && cd ../..
```

## 📊 Verificação da Instalação

### Checklist de Funcionamento

- [ ] API rodando em `http://localhost:3000`
- [ ] Mobile carregando no Expo Go
- [ ] Web acessível em `http://localhost:5173`
- [ ] Banco de dados conectado
- [ ] QR Code sendo gerado
- [ ] Eventos sendo salvos

### Endpoints de Teste

```bash
# Health check da API
curl http://localhost:3000/health

# Teste de usuários
curl http://localhost:3000/api/users
```

## 🚀 Próximos Passos

1. **Configure seu perfil** no app mobile
2. **Adicione alguns eventos** de teste
3. **Teste o QR Code** na interface web
4. **Explore a documentação** em `/docs`

## 📞 Suporte

Se encontrar problemas durante a instalação:

- Verifique os logs no terminal
- Consulte a documentação em `/docs`
- Entre em contato: support@vidalink.com

---

**Instalação concluída com sucesso!** 🎉 