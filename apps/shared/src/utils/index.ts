/**
 * Utilitários compartilhados do VidaLink
 */

// ============================================================================
// VALIDATION UTILS
// ============================================================================

/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Valida se o arquivo é um tipo de imagem ou PDF permitido
 */
export function isValidFileType(fileName: string): boolean {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
}

/**
 * Valida tamanho do arquivo (em bytes)
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

// ============================================================================
// FORMATTING UTILS
// ============================================================================

/**
 * Formata CPF: 12345678901 -> 123.456.789-01
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Formata data para exibição: 2024-01-15 -> 15/01/2024
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
}

/**
 * Formata nome do tipo de evento de saúde
 */
export function formatHealthEventType(type: string): string {
  const typeMap: Record<string, string> = {
    exam: 'Exame',
    consultation: 'Consulta',
    vaccination: 'Vacinação',
    medication: 'Medicação',
    surgery: 'Cirurgia',
    emergency: 'Emergência',
    other: 'Outro'
  };
  
  return typeMap[type] || type;
}

// ============================================================================
// TOKEN & SECURITY UTILS
// ============================================================================

/**
 * Gera um token aleatório seguro
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Gera uma data de expiração baseada em horas
 */
export function generateExpirationDate(hoursFromNow: number): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursFromNow);
  return expiration;
}

/**
 * Verifica se um token está expirado
 */
export function isTokenExpired(expirationDate: string | Date): boolean {
  const expiration = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  return expiration < new Date();
}

// ============================================================================
// TEXT PROCESSING UTILS
// ============================================================================

/**
 * Extrai texto relevante de OCR para busca
 */
export function extractKeywords(text: string): string[] {
  // Remove caracteres especiais e converte para minúsculas
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Divide em palavras e remove palavras muito curtas
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  
  // Remove duplicatas
  return [...new Set(words)];
}

/**
 * Trunca texto mantendo palavras completas
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// ============================================================================
// URL & QR CODE UTILS
// ============================================================================

/**
 * Gera URL para acesso via QR Code
 */
export function generateQRAccessUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/medical-access/${token}`;
}

/**
 * Gera URL para QR Code (usando serviço externo ou interno)
 */
export function generateQRCodeUrl(accessUrl: string): string {
  // Usando QR Server como exemplo - pode ser substituído por serviço próprio
  const encodedUrl = encodeURIComponent(accessUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
}

// ============================================================================
// ERROR HANDLING UTILS
// ============================================================================

/**
 * Classe de erro personalizada para a API
 */
export class VidaLinkError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'VidaLinkError';
  }
}

/**
 * Cria resposta de erro padronizada
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof VidaLinkError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }
  
  return {
    success: false,
    error: 'Erro interno do servidor',
  };
} 