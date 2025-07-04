# 🗄️ Como Executar o Schema do Banco de Dados no Supabase

## ⚠️ Importante: Resolvendo Erro de Trigger Duplicado

Se você encontrou o erro `trigger "update_users_updated_at" for relation "users" already exists`, isso significa que parte do schema já foi executada anteriormente. Siga as instruções abaixo:

## 📋 Passo a Passo

### Opção 1: Limpeza Completa (Recomendado)
Se você não tem dados importantes no banco:

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login e selecione seu projeto

2. **Abra o SQL Editor**
   - Clique em "SQL Editor" no menu lateral esquerdo
   - Clique em "New Query"

3. **Execute o Script de Limpeza**
   - Copie o conteúdo do arquivo `apps/api/database/reset-database.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Execute o Schema Principal**
   - Copie o conteúdo do arquivo `apps/api/database/schema-clean.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### Opção 2: Execução Incremental
Se você tem dados importantes:

1. **Execute apenas o schema atualizado**
   - O arquivo `schema-clean.sql` já contém verificações `IF NOT EXISTS`
   - Copie o conteúdo do arquivo `apps/api/database/schema-clean.sql`
   - Cole no SQL Editor do Supabase
   - Execute o script

## 🔍 Verificando a Execução

Após executar o schema, teste se funcionou:

```bash
cd apps/api
npm run test-db
```

## 📊 O que será criado:

### Tabelas:
- ✅ `users` - Dados dos usuários
- ✅ `health_event_types` - Tipos de eventos (exame, consulta, etc.)
- ✅ `health_events` - Eventos de saúde dos usuários
- ✅ `document_uploads` - Documentos anexados aos eventos
- ✅ `qr_shares` - Compartilhamentos via QR Code
- ✅ `access_logs` - Logs de acesso aos dados

### Recursos:
- ✅ Triggers para atualizar `updated_at` automaticamente
- ✅ Índices para otimização de consultas
- ✅ Políticas RLS (Row Level Security)
- ✅ Dados iniciais para tipos de eventos

## 🎯 Resultado Esperado

Após a execução bem-sucedida, você deverá ver:
- 6 tabelas criadas
- 7 tipos de eventos inseridos
- Triggers e índices configurados
- Políticas de segurança ativadas

## 🚨 Solução de Problemas

### Erro: "trigger already exists"
- Use a **Opção 1** (limpeza completa) acima

### Erro: "relation does not exist"
- Verifique se todas as extensões foram criadas
- Execute o script completo novamente

### Erro: "permission denied"
- Verifique se você tem permissões de administrador no projeto Supabase
- Certifique-se de estar logado com a conta correta

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Supabase Dashboard
2. Confirme que está usando o projeto correto
3. Teste a conexão com o banco usando o script `npm run test-db`

---

**Próximo passo:** Após executar o schema, teste a API com `npm run test-db` para confirmar que tudo está funcionando! 