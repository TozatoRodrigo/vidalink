# 📁 Upload de Documentos - VidaLink

## 🎯 Visão Geral

A funcionalidade de upload de documentos permite aos usuários anexar fotos, PDFs e outros documentos aos seus eventos de saúde, facilitando o compartilhamento de informações médicas com profissionais de saúde.

## 🏗️ Arquitetura

### Backend (API)
- **Serviço**: `DocumentService` - Gerencia upload, validação e processamento
- **Rotas**: `/api/documents/*` - Endpoints RESTful para CRUD de documentos
- **Storage**: Supabase Storage - Armazenamento seguro de arquivos
- **Banco**: Tabela `document_uploads` - Metadados dos documentos

### Mobile (React Native)
- **Componente**: `DocumentUploadModal` - Interface de upload
- **Serviço**: `DocumentService` - Cliente para API
- **Seleção**: Expo ImagePicker + DocumentPicker

### Web (React)
- **Componente**: `DocumentUpload` - Interface drag & drop
- **Componente**: `DocumentList` - Visualização de documentos
- **Serviço**: `documentService` - Cliente para API

## 📋 Funcionalidades Implementadas

### ✅ Backend API

#### Upload de Documentos
```typescript
POST /api/documents/upload
Content-Type: multipart/form-data

// Campos obrigatórios
health_event_id: string
files: File[] (máximo 5 arquivos)

// Resposta
{
  "documents": [
    {
      "id": "uuid",
      "health_event_id": "uuid",
      "original_name": "exame.pdf",
      "file_url": "https://...",
      "file_size": 1024,
      "mime_type": "application/pdf",
      "file_type": "pdf",
      "processing_status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Buscar Documentos por Evento
```typescript
GET /api/documents/health-event/:id
Authorization: Bearer <token>

// Resposta
{
  "documents": [...]
}
```

#### Remover Documento
```typescript
DELETE /api/documents/:id
Authorization: Bearer <token>

// Resposta
{
  "message": "Documento removido com sucesso"
}
```

#### Estatísticas do Usuário
```typescript
GET /api/documents/user/stats
Authorization: Bearer <token>

// Resposta
{
  "stats": {
    "total_documents": 15,
    "total_size": 52428800,
    "by_type": {
      "pdf": 8,
      "image": 6,
      "document": 1
    },
    "by_status": {
      "completed": 12,
      "processing": 2,
      "pending": 1
    }
  }
}
```

#### Upload em Lote
```typescript
POST /api/documents/bulk-upload
Content-Type: multipart/form-data

// Campos
health_event_ids: string[] (JSON)
files: File[]

// Resposta
{
  "documents": [...]
}
```

### ✅ Mobile (React Native)

#### DocumentUploadModal
```typescript
interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (files: SelectedFile[]) => Promise<void>;
  healthEventId: string;
}

// Funcionalidades
- Seleção via câmera, galeria ou documentos
- Preview de imagens
- Validação de arquivos
- Progress de upload
- Interface responsiva
```

#### Integração no App
```typescript
// Uso no componente principal
const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

const handleUpload = async (files: SelectedFile[]) => {
  try {
    await documentService.uploadDocuments(files, selectedEventId!);
    toast.success('Documentos enviados!');
  } catch (error) {
    toast.error('Erro no upload');
  }
};

<DocumentUploadModal
  visible={showUploadModal}
  onClose={() => setShowUploadModal(false)}
  onUpload={handleUpload}
  healthEventId={selectedEventId!}
/>
```

### ✅ Web (React)

#### DocumentUpload Component
```typescript
interface DocumentUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  healthEventId: string;
  maxFiles?: number;
  maxSize?: number;
}

// Funcionalidades
- Drag & drop com react-dropzone
- Validação de tipos e tamanhos
- Preview de arquivos selecionados
- Progress de upload
- Interface responsiva
```

#### DocumentList Component
```typescript
interface DocumentListProps {
  documents: DocumentUpload[];
  onDeleteDocument?: (documentId: string) => void;
  editable?: boolean;
}

// Funcionalidades
- Lista responsiva de documentos
- Status badges (processado, processando, falha)
- Ações de download e remoção
- Formatação de datas e tamanhos
```

#### Integração na Timeline
```typescript
// PatientTimelinePage.tsx
const handleUploadDocuments = async (files: File[]) => {
  try {
    const documents = await documentService.uploadDocuments(files, eventId);
    updateEventDocuments(eventId, documents);
    toast.success('Documentos enviados!');
  } catch (error) {
    toast.error('Erro no upload');
  }
};

// Modal de upload integrado
{showUploadModal && (
  <DocumentUpload
    onUpload={handleUploadDocuments}
    healthEventId={uploadingEventId}
    maxFiles={5}
  />
)}
```

## 🔧 Validações e Regras

### Tipos de Arquivo Permitidos
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
```

### Limites
- **Tamanho máximo**: 10MB por arquivo
- **Quantidade máxima**: 5 arquivos por upload
- **Formatos**: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT

### Validação no Frontend
```typescript
const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Arquivo muito grande (máximo 10MB)' };
  }
  
  return { valid: true };
};
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `document_uploads`
```sql
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_event_id UUID NOT NULL REFERENCES health_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'pdf', 'document', 'other')),
  ocr_text TEXT,
  ai_summary TEXT,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_document_uploads_health_event_id ON document_uploads(health_event_id);
CREATE INDEX idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX idx_document_uploads_processing_status ON document_uploads(processing_status);
```

## 🔒 Segurança

### Autenticação
- Todas as rotas protegidas por JWT
- Validação de propriedade dos documentos
- Middleware de autenticação

### Validação de Arquivos
- Verificação de MIME type
- Limitação de tamanho
- Sanitização de nomes de arquivo
- Geração de nomes únicos (UUID)

### Armazenamento
- Supabase Storage com políticas RLS
- URLs públicas com controle de acesso
- Backup automático

## 🚀 Processamento em Background

### OCR (Reconhecimento de Texto)
```typescript
const processDocument = async (documentId: string) => {
  try {
    // Atualizar status para 'processing'
    await updateDocumentStatus(documentId, 'processing');
    
    // Extrair texto (OCR)
    const ocrText = await extractTextFromDocument(documentUrl);
    
    // Gerar resumo com IA
    const aiSummary = await generateAISummary(ocrText);
    
    // Salvar resultados
    await updateDocument(documentId, {
      ocr_text: ocrText,
      ai_summary: aiSummary,
      processing_status: 'completed'
    });
  } catch (error) {
    await updateDocumentStatus(documentId, 'failed');
    throw error;
  }
};
```

### Status de Processamento
- **pending**: Aguardando processamento
- **processing**: Em processamento (OCR/IA)
- **completed**: Processado com sucesso
- **failed**: Falha no processamento

## 📊 Monitoramento e Métricas

### Estatísticas Disponíveis
- Total de documentos por usuário
- Tamanho total utilizado
- Distribuição por tipo de arquivo
- Status de processamento
- Uploads por período

### Logs
- Upload de arquivos
- Processamento de documentos
- Erros e falhas
- Tempo de processamento

## 🧪 Testes

### Testes de API
```typescript
describe('Document Upload API', () => {
  it('should upload single document successfully');
  it('should upload multiple documents successfully');
  it('should reject invalid file types');
  it('should reject files that are too large');
  it('should require authentication');
  it('should return documents for health event');
  it('should delete document successfully');
  it('should return user statistics');
});
```

### Testes de Serviço
```typescript
describe('DocumentService', () => {
  it('should validate file type and size correctly');
  it('should determine file type correctly');
  it('should format file sizes correctly');
  it('should process document with OCR and AI');
  it('should handle processing errors');
});
```

## 🔄 Fluxo de Uso

### Mobile
1. Usuário acessa evento de saúde
2. Toca em "Anexar Documentos"
3. Seleciona fonte (câmera, galeria, documentos)
4. Escolhe arquivos
5. Visualiza preview
6. Confirma upload
7. Documentos são enviados e processados

### Web (Médico)
1. Médico acessa timeline do paciente
2. Visualiza eventos com documentos anexados
3. Pode fazer download dos documentos
4. Visualiza resumos de IA quando disponíveis

## 📈 Próximas Melhorias

### Funcionalidades Planejadas
- [ ] Assinatura digital de documentos
- [ ] Compartilhamento temporário de documentos
- [ ] Integração com sistemas hospitalares
- [ ] Sincronização offline
- [ ] Compressão automática de imagens
- [ ] Reconhecimento de documentos médicos específicos
- [ ] Tradução automática de documentos
- [ ] Backup em múltiplas regiões

### Otimizações
- [ ] Cache de documentos no mobile
- [ ] Lazy loading na lista de documentos
- [ ] Pré-processamento de imagens
- [ ] Compressão de PDFs
- [ ] CDN para distribuição global

## 🐛 Troubleshooting

### Problemas Comuns

#### Upload Falha
```typescript
// Verificar conectividade
// Validar tamanho do arquivo
// Verificar permissões de storage
// Logs de erro detalhados
```

#### Processamento Lento
```typescript
// Verificar fila de processamento
// Monitorar recursos do servidor
// Otimizar algoritmos de OCR
// Implementar processamento paralelo
```

#### Documentos Não Aparecem
```typescript
// Verificar sincronização
// Validar permissões do usuário
// Verificar status de processamento
// Logs de consulta ao banco
```

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte os logs da aplicação
- Verifique a documentação da API
- Teste com arquivos menores
- Contate o suporte técnico

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024  
**Autor**: Equipe VidaLink 