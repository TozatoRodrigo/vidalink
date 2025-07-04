# 🚀 Configuração do Supabase - VidaLink

## 📋 Pré-requisitos

✅ Projeto criado no Supabase (https://app.supabase.com)
✅ Acesso ao painel do Supabase

## 🔧 Passo a Passo

### **1. Obter as Credenciais do Supabase**

1. Acesse https://app.supabase.com
2. Selecione seu projeto VidaLink
3. Vá para **Settings** → **API**
4. Copie as seguintes informações:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public key** (chave pública)
   - **service_role key** (chave privada - **CUIDADO: não compartilhe**)

### **2. Configurar Variáveis de Ambiente**

Edite o arquivo `apps/api/.env`:

```bash
# Configurações JWT
JWT_SECRET=sua-chave-secreta-jwt-super-segura-aqui-desenvolvimento-apenas

# Configurações Supabase - SUBSTITUA COM SUAS INFORMAÇÕES REAIS
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA-AQUI
SUPABASE_SERVICE_ROLE_KEY=SUA-CHAVE-SERVICE-ROLE-AQUI

# Configurações do Servidor
NODE_ENV=development
PORT=3001

# Configurações de Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configurações de Logs
LOG_LEVEL=debug
```

**⚠️ IMPORTANTE:** Substitua:
- `https://SEU-PROJETO.supabase.co` pela URL real do seu projeto
- `SUA-CHAVE-ANONIMA-AQUI` pela sua chave anon public
- `SUA-CHAVE-SERVICE-ROLE-AQUI` pela sua chave service_role

### **3. Executar o Schema do Banco de Dados**

#### **Opção A: Script Automático (Recomendado)**

```bash
cd apps/api
npm run setup-db
```

#### **Opção B: Manual no Supabase**

1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `apps/api/database/schema.sql`
4. Execute o script

### **4. Verificar a Configuração**

Após configurar, teste o servidor:

```bash
cd apps/api
npm run dev
```

Você deve ver:
```
🚀 Servidor VidaLink rodando na porta 3001
📱 Health check: http://localhost:3001/health
🔧 Ambiente: development
```

### **5. Testar os Endpoints**

```bash
# Testar endpoint de autenticação
curl http://localhost:3001/api/auth/test

# Testar verificação de email
curl "http://localhost:3001/api/auth/check-email?email=test@example.com"
```

## 🎯 Estrutura do Banco de Dados

O schema criará as seguintes tabelas:

- **users** - Usuários do sistema
- **health_events** - Eventos de saúde
- **document_uploads** - Documentos anexados
- **qr_shares** - Compartilhamentos via QR Code
- **access_logs** - Logs de acesso
- **health_event_types** - Tipos de eventos

## 🔒 Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- **Políticas de acesso** configuradas para cada usuário ver apenas seus dados
- **Índices** otimizados para performance
- **Triggers** para atualização automática de timestamps

## 🐛 Resolução de Problemas

### **Erro: "Variáveis de ambiente não configuradas"**
- Verifique se o arquivo `.env` está no diretório correto (`apps/api/.env`)
- Confirme se as variáveis estão preenchidas corretamente

### **Erro: "Connection failed"**
- Verifique se a URL do Supabase está correta
- Confirme se a chave service_role está correta
- Teste a conexão no painel do Supabase

### **Erro: "Permission denied"**
- Verifique se está usando a chave `service_role` (não a `anon`)
- Confirme se o RLS está configurado corretamente

## 📚 Próximos Passos

Após a configuração:

1. ✅ **Servidor funcionando**
2. ✅ **Banco configurado**
3. 🔄 **Implementar endpoints restantes**
4. 🔄 **Testar integração com frontends**
5. 🔄 **Deploy em produção**

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Confirme as configurações no painel do Supabase
3. Teste a conexão manualmente

---

**🎉 Parabéns! Seu backend VidaLink está configurado e pronto para uso!** 