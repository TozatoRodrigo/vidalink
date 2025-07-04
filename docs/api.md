# 📋 Documentação da API - VidaLink

Esta documentação descreve todos os endpoints da API REST do VidaLink.

## 🔧 URL Base

```
Desenvolvimento: http://localhost:3001/api
Produção: https://api.vidalink.com/api
```

## 🔐 Autenticação

A API usa autenticação JWT. Inclua o token no header `Authorization`:

```
Authorization: Bearer <seu_jwt_token>
```

## 📝 Formato de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": boolean,
  "data": any, // opcional
  "error": string, // opcional
  "message": string // opcional
}
```

## 🔑 Endpoints de Autenticação

### POST /auth/register
Registra um novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "minimo8caracteres",
  "name": "Nome Completo",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "cpf": "12345678901",
  "phone": "11999999999" // opcional
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nome Completo"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/login
Faz login do usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nome Completo"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

## 👤 Endpoints de Usuário

### GET /users/profile
Retorna o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome Completo",
    "phone": "11999999999",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "cpf": "12345678901",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🏥 Endpoints de Eventos de Saúde

### GET /health-events
Lista eventos de saúde do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type`: Filtrar por tipo (exam, consultation, vaccination, etc.)
- `startDate`: Data inicial (ISO string)
- `endDate`: Data final (ISO string)
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 20)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "type": "exam",
        "title": "Hemograma Completo",
        "description": "Exame de sangue de rotina",
        "date": "2024-01-15T10:00:00.000Z",
        "doctorName": "Dr. João Silva",
        "institution": "Lab Central",
        "attachmentUrl": "https://...",
        "aiSummary": "Resultados normais...",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /health-events
Cria um novo evento de saúde.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "type": "exam",
  "title": "Hemograma Completo",
  "description": "Exame de sangue de rotina",
  "date": "2024-01-15T10:00:00.000Z",
  "doctorName": "Dr. João Silva",
  "institution": "Lab Central"
}
```

### POST /health-events/upload-exam
Faz upload de um exame com OCR e análise por IA.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Arquivo (PDF, JPG, PNG)
- `title`: Título do exame
- `date`: Data do exame (ISO string)
- `doctorName`: Nome do médico (opcional)
- `institution`: Instituição (opcional)

## 🔗 Endpoints de Compartilhamento QR

### POST /qr-share
Cria um novo compartilhamento QR.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "doctorEmail": "medico@hospital.com", // opcional
  "expiresInHours": 24, // padrão: 24h
  "maxAccess": 1 // padrão: 1
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "shareId": "uuid",
    "token": "secure_token",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/...",
    "accessUrl": "https://app.vidalink.com/medical-access/token",
    "expiresAt": "2024-01-16T10:00:00.000Z"
  }
}
```

### GET /qr-share/user
Lista compartilhamentos do usuário.

**Headers:** `Authorization: Bearer <token>`

### DELETE /qr-share/:id/revoke
Revoga um compartilhamento.

**Headers:** `Authorization: Bearer <token>`

## 🩺 Endpoints de Acesso Médico

### GET /medical-access/:token
Acessa dados do paciente via token QR.

**Parâmetros:**
- `token`: Token de acesso gerado pelo QR

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "name": "Nome do Paciente",
      "dateOfBirth": "1990-01-15",
      "age": 34
    },
    "healthEvents": [
      // Lista de eventos de saúde
    ],
    "shareInfo": {
      "expiresAt": "2024-01-16T10:00:00.000Z",
      "accessCount": 1,
      "maxAccess": 1
    }
  }
}
```

## ❌ Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido/expirado)
- `403` - Forbidden (acesso negado)
- `404` - Not Found (recurso não encontrado)
- `409` - Conflict (recurso já existe)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 🔒 Considerações de Segurança

- Todos os endpoints são protegidos por HTTPS em produção
- Tokens JWT expiram em 7 dias por padrão
- Rate limiting: 100 requests por 15 minutos por IP
- Dados sensíveis são criptografados no banco
- Logs não incluem informações pessoais
- CORS configurado para domínios específicos 