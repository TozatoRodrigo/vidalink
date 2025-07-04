# 🧩 Exemplo de Tarefa - VidaLink

## 🧩 Tarefa: Endpoint de Registro de Eventos de Saúde

📄 **Descrição**: Criar um endpoint POST /health-events que permita ao usuário registrar um novo evento de saúde (exame, consulta, vacina, etc.) no seu histórico médico.

📥 **Input**: 
- Headers: `Authorization: Bearer <jwt_token>`
- Body JSON:
```json
{
  "type": "exam", // enum: exam, consultation, vaccination, medication, surgery, emergency, other
  "title": "Hemograma Completo",
  "description": "Exame de sangue de rotina", // opcional
  "date": "2024-01-15T10:00:00.000Z",
  "doctorName": "Dr. João Silva", // opcional
  "institution": "Lab Central" // opcional
}
```

📤 **Output**: 
- Status: 201 Created
- Response JSON:
```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "userId": "uuid-do-usuario",
    "type": "exam",
    "title": "Hemograma Completo",
    "description": "Exame de sangue de rotina",
    "date": "2024-01-15T10:00:00.000Z",
    "doctorName": "Dr. João Silva",
    "institution": "Lab Central",
    "attachmentUrl": null,
    "ocrText": null,
    "aiSummary": null,
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

📌 **Observações**: 
- Validar que o usuário está autenticado via JWT
- Validar dados de entrada usando Zod schema
- Salvar no banco de dados Supabase (tabela health_events)
- Retornar erro 400 se dados inválidos
- Retornar erro 401 se token inválido
- Aplicar rate limiting (máximo 50 eventos por dia por usuário)
- Logar a ação para auditoria (sem dados sensíveis)

---

## 🔧 Implementação Sugerida

### 1. Atualizar o schema Zod em `apps/shared/src/types/index.ts`
### 2. Criar service em `apps/api/src/services/healthEventService.ts`
### 3. Implementar rota em `apps/api/src/routes/healthEvents.ts`
### 4. Adicionar testes em `apps/api/src/routes/__tests__/healthEvents.test.ts`

---

## ✅ Critérios de Aceitação

- [ ] Endpoint criado e funcionando
- [ ] Validação de dados implementada
- [ ] Autenticação obrigatória
- [ ] Dados salvos corretamente no banco
- [ ] Testes unitários e de integração
- [ ] Documentação da API atualizada
- [ ] Rate limiting configurado
- [ ] Logs estruturados implementados

---

**💡 Dica**: Use este formato sempre que quiser solicitar uma nova funcionalidade! 