import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentService } from '../services/documentService';
import { supabase } from '../config/supabase';

// Mock do Supabase
vi.mock('../config/supabase', () => ({
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

describe('DocumentService', () => {
  let documentService: DocumentService;

  beforeEach(() => {
    documentService = new DocumentService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const mockUploadData = {
        data: { path: 'documents/user1/test.pdf' },
        error: null,
      };

      const mockUrlData = {
        data: { publicUrl: 'https://example.com/test.pdf' },
      };

      const mockDbData = {
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

      // Mock das chamadas do Supabase
      const mockStorage = supabase.storage.from as any;
      mockStorage.mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockUploadData),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlData),
      });

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockDbData),
          }),
        }),
      });

      const result = await documentService.uploadDocument({
        health_event_id: 'event1',
        user_id: 'user1',
        file: mockFile,
      });

      expect(result).toEqual(mockDbData.data);
      expect(mockStorage).toHaveBeenCalledWith('health-documents');
    });

    it('should throw error for invalid file type', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.exe',
        mimetype: 'application/x-executable',
        size: 1024,
      };

      await expect(
        documentService.uploadDocument({
          health_event_id: 'event1',
          user_id: 'user1',
          file: mockFile,
        })
      ).rejects.toThrow('Tipo de arquivo não permitido');
    });

    it('should throw error for file too large', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 15 * 1024 * 1024, // 15MB
      };

      await expect(
        documentService.uploadDocument({
          health_event_id: 'event1',
          user_id: 'user1',
          file: mockFile,
        })
      ).rejects.toThrow('Arquivo muito grande');
    });
  });

  describe('getDocumentsByHealthEvent', () => {
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

      const result = await documentService.getDocumentsByHealthEvent('event1');

      expect(result).toEqual(mockDocuments);
      expect(mockDb).toHaveBeenCalledWith('document_uploads');
    });

    it('should throw error when health event not found', async () => {
      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Health event not found' },
          }),
        }),
      });

      await expect(
        documentService.getDocumentsByHealthEvent('nonexistent')
      ).rejects.toThrow('Health event not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const mockDocument = {
        id: 'doc1',
        file_path: 'documents/user1/test.pdf',
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

      await documentService.deleteDocument('doc1');

      expect(mockStorage).toHaveBeenCalledWith('health-documents');
    });

    it('should throw error when document not found', async () => {
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

      await expect(
        documentService.deleteDocument('nonexistent')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('getUserDocumentStats', () => {
    it('should return user document statistics', async () => {
      const mockStats = {
        total_documents: 5,
        total_size: 10240,
        by_type: {
          pdf: 3,
          image: 2,
        },
        by_status: {
          completed: 4,
          pending: 1,
        },
      };

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { file_type: 'pdf', processing_status: 'completed', file_size: 2048 },
              { file_type: 'pdf', processing_status: 'completed', file_size: 2048 },
              { file_type: 'pdf', processing_status: 'completed', file_size: 2048 },
              { file_type: 'image', processing_status: 'completed', file_size: 2048 },
              { file_type: 'image', processing_status: 'pending', file_size: 2048 },
            ],
            error: null,
          }),
        }),
      });

      const result = await documentService.getUserDocumentStats('user1');

      expect(result.total_documents).toBe(5);
      expect(result.total_size).toBe(10240);
      expect(result.by_type.pdf).toBe(3);
      expect(result.by_type.image).toBe(2);
      expect(result.by_status.completed).toBe(4);
      expect(result.by_status.pending).toBe(1);
    });
  });

  describe('validateFile', () => {
    it('should validate allowed file types', () => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'text/plain',
      ];

      allowedTypes.forEach(type => {
        const result = documentService.validateFile(type, 1024);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject disallowed file types', () => {
      const disallowedTypes = [
        'application/x-executable',
        'video/mp4',
        'audio/mp3',
      ];

      disallowedTypes.forEach(type => {
        const result = documentService.validateFile(type, 1024);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Tipo de arquivo não permitido');
      });
    });

    it('should reject files that are too large', () => {
      const result = documentService.validateFile('image/jpeg', 15 * 1024 * 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Arquivo muito grande (máximo 10MB)');
    });

    it('should accept files within size limit', () => {
      const result = documentService.validateFile('image/jpeg', 5 * 1024 * 1024);
      expect(result.valid).toBe(true);
    });
  });

  describe('processDocument', () => {
    it('should process document with OCR and AI summary', async () => {
      const mockDocument = {
        id: 'doc1',
        file_type: 'pdf',
        file_url: 'https://example.com/test.pdf',
        processing_status: 'pending',
      };

      const mockProcessedDocument = {
        ...mockDocument,
        ocr_text: 'Extracted text from document',
        ai_summary: 'AI generated summary',
        processing_status: 'completed',
      };

      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProcessedDocument,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await documentService.processDocument('doc1');

      expect(result.processing_status).toBe('completed');
      expect(result.ocr_text).toBeDefined();
      expect(result.ai_summary).toBeDefined();
    });

    it('should handle processing errors', async () => {
      const mockDb = supabase.from as any;
      mockDb.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Processing failed' },
              }),
            }),
          }),
        }),
      });

      await expect(
        documentService.processDocument('doc1')
      ).rejects.toThrow('Processing failed');
    });
  });
}); 