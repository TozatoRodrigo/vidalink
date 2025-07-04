import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../apps/api/src/app';
import { supabase } from '../apps/api/src/config/supabase';
import { DocumentService } from '../apps/api/src/services/documentService';

// Mock do Supabase
vi.mock('../apps/api/src/config/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    }),
  },
}));

describe('Document Upload API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Mock token de autenticação
    authToken = 'mock-jwt-token';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/documents/upload', () => {
    it('should upload single document successfully', async () => {
      const mockUploadResponse = {
        data: { path: 'documents/user1/test.pdf' },
        error: null,
      };

      const mockUrlResponse = {
        data: { publicUrl: 'https://example.com/test.pdf' },
      };

      const mockDbResponse = {
        data: {
          id: 'doc1',
          health_event_id: 'event1',
          user_id: 'user1',
          original_name: 'test.pdf',
          file_path: 'documents/user1/test.pdf',
          file_url: 'https://example.com/test.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          file_type: 'pdf',
          processing_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };

      const mockStorage = supabase.storage.from as any;
      mockStorage.mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlResponse),
      });

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockDbResponse),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_id', 'event1')
        .attach('files', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toHaveLength(1);
      expect(response.body.documents[0]).toEqual(mockDbResponse.data);
    });

    it('should upload multiple documents successfully', async () => {
      const mockUploadResponse = {
        data: { path: 'documents/user1/test.pdf' },
        error: null,
      };

      const mockUrlResponse = {
        data: { publicUrl: 'https://example.com/test.pdf' },
      };

      const mockDbResponse = {
        data: [
          {
            id: 'doc1',
            health_event_id: 'event1',
            original_name: 'test1.pdf',
            file_size: 1024,
          },
          {
            id: 'doc2',
            health_event_id: 'event1',
            original_name: 'test2.jpg',
            file_size: 2048,
          },
        ],
        error: null,
      };

      const mockStorage = supabase.storage.from as any;
      mockStorage.mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlResponse),
      });

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockDbResponse),
        }),
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_id', 'event1')
        .attach('files', Buffer.from('test content 1'), 'test1.pdf')
        .attach('files', Buffer.from('test content 2'), 'test2.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toHaveLength(2);
    });

    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_id', 'event1')
        .attach('files', Buffer.from('test content'), 'test.exe');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Tipo de arquivo não permitido');
    });

    it('should reject files that are too large', async () => {
      const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_id', 'event1')
        .attach('files', largeBuffer, 'large.pdf');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Arquivo muito grande');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .field('health_event_id', 'event1')
        .attach('files', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token não fornecido');
    });

    it('should require health_event_id', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('health_event_id é obrigatório');
    });

    it('should require at least one file', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_id', 'event1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Nenhum arquivo fornecido');
    });
  });

  describe('GET /api/documents/health-event/:id', () => {
    it('should return documents for health event', async () => {
      const mockDocuments = [
        {
          id: 'doc1',
          health_event_id: 'event1',
          original_name: 'test1.pdf',
          file_size: 1024,
          created_at: new Date().toISOString(),
        },
        {
          id: 'doc2',
          health_event_id: 'event1',
          original_name: 'test2.jpg',
          file_size: 2048,
          created_at: new Date().toISOString(),
        },
      ];

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockDocuments,
            error: null,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/documents/health-event/event1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toHaveLength(2);
      expect(response.body.documents[0]).toEqual(mockDocuments[0]);
    });

    it('should return empty array when no documents found', async () => {
      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/documents/health-event/event1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toHaveLength(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/documents/health-event/event1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token não fornecido');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document successfully', async () => {
      const mockDocument = {
        id: 'doc1',
        file_path: 'documents/user1/test.pdf',
        user_id: 'user1',
      };

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockDocument,
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const mockStorage = supabase.storage.from as any;
      mockStorage.mockReturnValue({
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const response = await request(app)
        .delete('/api/documents/doc1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Documento removido com sucesso');
    });

    it('should return 404 when document not found', async () => {
      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Document not found' },
            }),
          }),
        }),
      });

      const response = await request(app)
        .delete('/api/documents/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Documento não encontrado');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/documents/doc1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token não fornecido');
    });
  });

  describe('GET /api/documents/user/stats', () => {
    it('should return user document statistics', async () => {
      const mockDocuments = [
        { file_type: 'pdf', processing_status: 'completed', file_size: 2048 },
        { file_type: 'pdf', processing_status: 'completed', file_size: 2048 },
        { file_type: 'image', processing_status: 'pending', file_size: 1024 },
      ];

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockDocuments,
            error: null,
          }),
        }),
      });

      const response = await request(app)
        .get('/api/documents/user/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats.total_documents).toBe(3);
      expect(response.body.stats.total_size).toBe(5120);
      expect(response.body.stats.by_type.pdf).toBe(2);
      expect(response.body.stats.by_type.image).toBe(1);
      expect(response.body.stats.by_status.completed).toBe(2);
      expect(response.body.stats.by_status.pending).toBe(1);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/documents/user/stats');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token não fornecido');
    });
  });

  describe('POST /api/documents/bulk-upload', () => {
    it('should upload multiple documents to different events', async () => {
      const mockUploadResponse = {
        data: { path: 'documents/user1/test.pdf' },
        error: null,
      };

      const mockUrlResponse = {
        data: { publicUrl: 'https://example.com/test.pdf' },
      };

      const mockDbResponse = {
        data: [
          {
            id: 'doc1',
            health_event_id: 'event1',
            original_name: 'test1.pdf',
          },
          {
            id: 'doc2',
            health_event_id: 'event2',
            original_name: 'test2.jpg',
          },
        ],
        error: null,
      };

      const mockStorage = supabase.storage.from as any;
      mockStorage.mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlResponse),
      });

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockDbResponse),
        }),
      });

      const response = await request(app)
        .post('/api/documents/bulk-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('health_event_ids', JSON.stringify(['event1', 'event2']))
        .attach('files', Buffer.from('test content 1'), 'test1.pdf')
        .attach('files', Buffer.from('test content 2'), 'test2.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toHaveLength(2);
    });

    it('should require health_event_ids array', async () => {
      const response = await request(app)
        .post('/api/documents/bulk-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('health_event_ids é obrigatório');
    });
  });
});

describe('DocumentService Unit Tests', () => {
  let documentService: DocumentService;

  beforeEach(() => {
    documentService = new DocumentService();
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate file type and size correctly', () => {
      // Tipos válidos
      expect(documentService.validateFile('image/jpeg', 1024)).toEqual({ valid: true });
      expect(documentService.validateFile('application/pdf', 1024)).toEqual({ valid: true });
      expect(documentService.validateFile('text/plain', 1024)).toEqual({ valid: true });

      // Tipos inválidos
      expect(documentService.validateFile('video/mp4', 1024)).toEqual({
        valid: false,
        error: 'Tipo de arquivo não permitido'
      });

      // Tamanho muito grande
      expect(documentService.validateFile('image/jpeg', 15 * 1024 * 1024)).toEqual({
        valid: false,
        error: 'Arquivo muito grande (máximo 10MB)'
      });

      // Tamanho OK
      expect(documentService.validateFile('image/jpeg', 5 * 1024 * 1024)).toEqual({ valid: true });
    });
  });

  describe('getFileType', () => {
    it('should determine file type correctly', () => {
      expect(documentService.getFileType('image/jpeg')).toBe('image');
      expect(documentService.getFileType('image/png')).toBe('image');
      expect(documentService.getFileType('application/pdf')).toBe('pdf');
      expect(documentService.getFileType('application/msword')).toBe('document');
      expect(documentService.getFileType('text/plain')).toBe('document');
      expect(documentService.getFileType('application/unknown')).toBe('other');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(documentService.formatFileSize(500)).toBe('500 B');
      expect(documentService.formatFileSize(1024)).toBe('1.0 KB');
      expect(documentService.formatFileSize(1536)).toBe('1.5 KB');
      expect(documentService.formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(documentService.formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });
}); 