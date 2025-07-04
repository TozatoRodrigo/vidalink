import { StorageService } from './StorageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

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

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

class DocumentService {
  private async getAuthHeaders() {
    const token = await StorageService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };
  }

  /**
   * Faz upload de documentos para um evento de saúde
   */
  async uploadDocuments(healthEventId: string, files: UploadFile[]): Promise<DocumentUpload[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const formData = new FormData();
      formData.append('health_event_id', healthEventId);
      
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      return data.data;
    } catch (error) {
      console.error('Erro no upload de documentos:', error);
      throw error;
    }
  }

  /**
   * Busca documentos de um evento de saúde
   */
  async getDocumentsByHealthEvent(healthEventId: string): Promise<DocumentUpload[]> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/health-event/${healthEventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar documentos');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      throw error;
    }
  }

  /**
   * Busca um documento específico
   */
  async getDocumentById(documentId: string): Promise<DocumentUpload> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar documento');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      throw error;
    }
  }

  /**
   * Remove um documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover documento');
      }
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      throw error;
    }
  }

  /**
   * Atualiza metadados de um documento
   */
  async updateDocument(documentId: string, updates: Partial<DocumentUpload>): Promise<DocumentUpload> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar documento');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  }

  /**
   * Busca todos os documentos do usuário
   */
  async getUserDocuments(limit: number = 50, offset: number = 0): Promise<DocumentUpload[]> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/user/all?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar documentos do usuário');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao buscar documentos do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de documentos do usuário
   */
  async getDocumentStats(): Promise<{
    total: number;
    by_type: Record<string, number>;
    total_size: number;
  }> {
    try {
      const token = await StorageService.getToken();
      
      const response = await fetch(`${API_URL}/documents/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar estatísticas');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Upload em lote para múltiplos eventos
   */
  async bulkUpload(healthEventIds: string[], files: UploadFile[]): Promise<{
    uploaded: DocumentUpload[];
    errors: Array<{ file: string; health_event_id: string; error: string }>;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const formData = new FormData();
      formData.append('health_event_ids', JSON.stringify(healthEventIds));
      
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      const response = await fetch(`${API_URL}/documents/bulk-upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload em lote');
      }

      return data.data;
    } catch (error) {
      console.error('Erro no upload em lote:', error);
      throw error;
    }
  }

  /**
   * Obtém URL para download de um documento
   */
  getDownloadUrl(documentId: string): string {
    return `${API_URL}/documents/download/${documentId}`;
  }

  /**
   * Valida arquivo antes do upload
   */
  validateFile(file: UploadFile): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido',
      };
    }

    // Note: File size validation would need to be done differently in React Native
    // as we don't have direct access to file size from the picker results

    return { valid: true };
  }

  /**
   * Formata tamanho do arquivo
   */
  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Determina o tipo de ícone baseado no tipo MIME
   */
  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'document-text';
    if (type.includes('word')) return 'document';
    return 'document-outline';
  }
}

export default new DocumentService(); 