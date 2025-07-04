const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

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

export interface DocumentStats {
  total_documents: number;
  total_size: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

class DocumentService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Upload múltiplos documentos
   */
  async uploadDocuments(files: File[], healthEventId: string): Promise<DocumentUpload[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    formData.append('health_event_id', healthEventId);

    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('authToken') && { 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload dos documentos');
    }

    return response.json();
  }

  /**
   * Buscar documentos por evento de saúde
   */
  async getDocumentsByHealthEvent(healthEventId: string): Promise<DocumentUpload[]> {
    const response = await fetch(`${API_URL}/documents/health-event/${healthEventId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar documentos');
    }

    return response.json();
  }

  /**
   * Buscar documento específico
   */
  async getDocument(documentId: string): Promise<DocumentUpload> {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar documento');
    }

    return response.json();
  }

  /**
   * Atualizar metadados do documento
   */
  async updateDocument(documentId: string, updates: Partial<DocumentUpload>): Promise<DocumentUpload> {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar documento');
    }

    return response.json();
  }

  /**
   * Remover documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao remover documento');
    }
  }

  /**
   * Buscar todos os documentos do usuário
   */
  async getUserDocuments(): Promise<DocumentUpload[]> {
    const response = await fetch(`${API_URL}/documents/user/all`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar documentos do usuário');
    }

    return response.json();
  }

  /**
   * Buscar estatísticas dos documentos
   */
  async getDocumentStats(): Promise<DocumentStats> {
    const response = await fetch(`${API_URL}/documents/user/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  }

  /**
   * Upload em lote
   */
  async bulkUpload(files: File[], healthEventIds: string[]): Promise<DocumentUpload[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('health_event_ids', JSON.stringify(healthEventIds));

    const response = await fetch(`${API_URL}/documents/bulk-upload`, {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('authToken') && { 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro no upload em lote');
    }

    return response.json();
  }

  /**
   * Download de documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/documents/download/${documentId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer download do documento');
    }

    return response.blob();
  }

  /**
   * Validar arquivo antes do upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande (máximo 10MB)'
      };
    }

    return { valid: true };
  }

  /**
   * Formatar tamanho do arquivo
   */
  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export const documentService = new DocumentService(); 