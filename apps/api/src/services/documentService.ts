import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { VidaLinkError } from '../utils/errors';

// Alias para compatibilidade
const AppError = VidaLinkError;

export interface DocumentUpload {
  id: string;
  health_event_id: string;
  user_id: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'pdf' | 'document' | 'other';
  ocr_text?: string;
  ai_summary?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentRequest {
  health_event_id: string;
  user_id: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export class DocumentService {
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Faz upload de um documento para o Supabase Storage
   */
  async uploadDocument(data: UploadDocumentRequest): Promise<DocumentUpload> {
    try {
      // Validar arquivo
      this.validateFile(data.file);

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(data.file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `documents/${data.user_id}/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('health-documents')
        .upload(filePath, data.file.buffer, {
          contentType: data.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new AppError('Erro ao fazer upload do arquivo', 500);
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('health-documents')
        .getPublicUrl(filePath);

      // Determinar tipo do arquivo
      const fileType = this.getFileType(data.file.mimetype);

      // Salvar metadados no banco
      const { data: documentData, error: dbError } = await supabase
        .from('document_uploads')
        .insert({
          health_event_id: data.health_event_id,
          user_id: data.user_id,
          original_name: data.file.originalname,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: data.file.size,
          mime_type: data.file.mimetype,
          file_type: fileType,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        // Remover arquivo do storage se falhar ao salvar no banco
        await supabase.storage
          .from('health-documents')
          .remove([filePath]);
        
        throw new AppError('Erro ao salvar metadados do documento', 500);
      }

      // Processar documento em background (OCR, AI summary)
      this.processDocumentInBackground(documentData.id);

      return documentData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao fazer upload do documento', 500);
    }
  }

  /**
   * Busca documentos de um evento de saúde
   */
  async getDocumentsByHealthEvent(healthEventId: string, userId: string): Promise<DocumentUpload[]> {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('health_event_id', healthEventId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Erro ao buscar documentos', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao buscar documentos', 500);
    }
  }

  /**
   * Busca um documento específico
   */
  async getDocumentById(documentId: string, userId: string): Promise<DocumentUpload | null> {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new AppError('Erro ao buscar documento', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao buscar documento', 500);
    }
  }

  /**
   * Remove um documento
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      // Buscar documento para obter o caminho do arquivo
      const document = await this.getDocumentById(documentId, userId);
      
      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }

      // Remover arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('health-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Erro ao remover arquivo do storage:', storageError);
      }

      // Remover do banco de dados
      const { error: dbError } = await supabase
        .from('document_uploads')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (dbError) {
        throw new AppError('Erro ao remover documento', 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao remover documento', 500);
    }
  }

  /**
   * Atualiza metadados de um documento
   */
  async updateDocument(documentId: string, userId: string, updates: Partial<DocumentUpload>): Promise<DocumentUpload> {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .update(updates)
        .eq('id', documentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new AppError('Erro ao atualizar documento', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao atualizar documento', 500);
    }
  }

  /**
   * Valida arquivo antes do upload
   */
  private validateFile(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }): void {
    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      throw new AppError('Arquivo muito grande. Tamanho máximo: 10MB', 400);
    }

    // Validar tipo MIME
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError('Tipo de arquivo não permitido', 400);
    }

    // Validar se o arquivo não está vazio
    if (file.size === 0) {
      throw new AppError('Arquivo vazio não é permitido', 400);
    }
  }

  /**
   * Determina o tipo do arquivo baseado no MIME type
   */
  private getFileType(mimeType: string): 'image' | 'pdf' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (mimeType.includes('word') || mimeType.includes('document') || mimeType === 'text/plain') {
      return 'document';
    }
    return 'other';
  }

  /**
   * Processa documento em background (OCR, AI summary)
   */
  private async processDocumentInBackground(documentId: string): Promise<void> {
    try {
      // Marcar como processando
      await supabase
        .from('document_uploads')
        .update({ processing_status: 'processing' })
        .eq('id', documentId);

      // Aqui você pode implementar:
      // - OCR para extrair texto de imagens
      // - AI para gerar resumos
      // - Análise de documentos médicos
      
      // Por enquanto, apenas marcar como concluído
      setTimeout(async () => {
        await supabase
          .from('document_uploads')
          .update({ processing_status: 'completed' })
          .eq('id', documentId);
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar documento:', error);
      
      // Marcar como falha
      await supabase
        .from('document_uploads')
        .update({ processing_status: 'failed' })
        .eq('id', documentId);
    }
  }

  /**
   * Busca documentos por usuário
   */
  async getDocumentsByUser(userId: string, limit: number = 50, offset: number = 0): Promise<DocumentUpload[]> {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError('Erro ao buscar documentos do usuário', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao buscar documentos do usuário', 500);
    }
  }

  /**
   * Obter estatísticas de documentos
   */
  async getDocumentStats(userId: string): Promise<{
    total: number;
    by_type: Record<string, number>;
    total_size: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('file_type, file_size')
        .eq('user_id', userId);

      if (error) {
        throw new AppError('Erro ao buscar estatísticas', 500);
      }

      const stats = {
        total: data.length,
        by_type: {} as Record<string, number>,
        total_size: 0
      };

      data.forEach(doc => {
        stats.by_type[doc.file_type] = (stats.by_type[doc.file_type] || 0) + 1;
        stats.total_size += doc.file_size;
      });

      return stats;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro interno ao buscar estatísticas', 500);
    }
  }
}

export const documentService = new DocumentService(); 