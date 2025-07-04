/**
 * @fileoverview Classes de erro customizadas para a aplicação VidaLink
 */

import { ErrorCode } from '../types/database';

/**
 * Erro customizado da aplicação VidaLink
 */
export class VidaLinkError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code: ErrorCode = ErrorCode.INTERNAL_ERROR, details?: any) {
    super(message);
    this.name = 'VidaLinkError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Mantém o stack trace
    Error.captureStackTrace(this, VidaLinkError);
  }

  /**
   * Converte o erro para objeto JSON
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details })
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS PARA ERROS COMUNS
// ============================================================================

/**
 * Erros de autenticação
 */
export class AuthError {
  static invalidCredentials(message: string = 'Credenciais inválidas') {
    return new VidaLinkError(message, 401, ErrorCode.INVALID_CREDENTIALS);
  }

  static userNotFound(message: string = 'Usuário não encontrado') {
    return new VidaLinkError(message, 404, ErrorCode.USER_NOT_FOUND);
  }

  static emailAlreadyExists(message: string = 'Email já está em uso') {
    return new VidaLinkError(message, 409, ErrorCode.EMAIL_ALREADY_EXISTS);
  }

  static cpfAlreadyExists(message: string = 'CPF já está em uso') {
    return new VidaLinkError(message, 409, ErrorCode.CPF_ALREADY_EXISTS);
  }

  static invalidToken(message: string = 'Token inválido') {
    return new VidaLinkError(message, 401, ErrorCode.INVALID_TOKEN);
  }

  static expiredToken(message: string = 'Token expirado') {
    return new VidaLinkError(message, 401, ErrorCode.EXPIRED_TOKEN);
  }
}

/**
 * Erros de autorização
 */
export class AuthorizationError {
  static accessDenied(message: string = 'Acesso negado') {
    return new VidaLinkError(message, 403, ErrorCode.ACCESS_DENIED);
  }

  static insufficientPermissions(message: string = 'Permissões insuficientes') {
    return new VidaLinkError(message, 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

/**
 * Erros de recursos
 */
export class ResourceError {
  static notFound(resource: string = 'Recurso', message?: string) {
    return new VidaLinkError(
      message || `${resource} não encontrado`,
      404,
      ErrorCode.RESOURCE_NOT_FOUND
    );
  }

  static invalidId(resource: string = 'Recurso', message?: string) {
    return new VidaLinkError(
      message || `ID do ${resource} inválido`,
      400,
      ErrorCode.INVALID_RESOURCE_ID
    );
  }
}

/**
 * Erros de QR Share
 */
export class QRShareError {
  static tokenNotFound(message: string = 'Token QR não encontrado') {
    return new VidaLinkError(message, 404, ErrorCode.QR_TOKEN_NOT_FOUND);
  }

  static tokenExpired(message: string = 'Token QR expirado') {
    return new VidaLinkError(message, 410, ErrorCode.QR_TOKEN_EXPIRED);
  }

  static tokenInactive(message: string = 'Token QR inativo') {
    return new VidaLinkError(message, 410, ErrorCode.QR_TOKEN_INACTIVE);
  }

  static accessLimitExceeded(message: string = 'Limite de acesso excedido') {
    return new VidaLinkError(message, 429, ErrorCode.QR_ACCESS_LIMIT_EXCEEDED);
  }
}

/**
 * Erros de upload
 */
export class UploadError {
  static fileTooLarge(maxSize: string, message?: string) {
    return new VidaLinkError(
      message || `Arquivo muito grande. Tamanho máximo: ${maxSize}`,
      413,
      ErrorCode.FILE_TOO_LARGE
    );
  }

  static invalidFileType(allowedTypes: string[], message?: string) {
    return new VidaLinkError(
      message || `Tipo de arquivo inválido. Permitidos: ${allowedTypes.join(', ')}`,
      400,
      ErrorCode.INVALID_FILE_TYPE
    );
  }

  static uploadFailed(message: string = 'Falha no upload do arquivo') {
    return new VidaLinkError(message, 500, ErrorCode.UPLOAD_FAILED);
  }
}

/**
 * Erros de validação
 */
export class ValidationError {
  static invalidData(message: string = 'Dados inválidos', details?: any) {
    return new VidaLinkError(message, 400, ErrorCode.VALIDATION_ERROR, details);
  }

  static invalidCPF(message: string = 'CPF inválido') {
    return new VidaLinkError(message, 400, ErrorCode.INVALID_CPF);
  }

  static invalidEmail(message: string = 'Email inválido') {
    return new VidaLinkError(message, 400, ErrorCode.INVALID_EMAIL);
  }

  static invalidDate(message: string = 'Data inválida') {
    return new VidaLinkError(message, 400, ErrorCode.INVALID_DATE);
  }
}

/**
 * Erros de sistema
 */
export class SystemError {
  static internal(message: string = 'Erro interno do servidor', details?: any) {
    return new VidaLinkError(message, 500, ErrorCode.INTERNAL_ERROR, details);
  }

  static database(message: string = 'Erro no banco de dados', details?: any) {
    return new VidaLinkError(message, 500, ErrorCode.DATABASE_ERROR, details);
  }

  static externalService(service: string, message?: string, details?: any) {
    return new VidaLinkError(
      message || `Erro no serviço externo: ${service}`,
      502,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      details
    );
  }
}

// ============================================================================
// UTILITÁRIOS PARA TRATAMENTO DE ERROS
// ============================================================================

/**
 * Verifica se um erro é uma instância de VidaLinkError
 */
export function isVidaLinkError(error: any): error is VidaLinkError {
  return error instanceof VidaLinkError;
}

/**
 * Converte erros desconhecidos para VidaLinkError
 */
export function normalizeError(error: any): VidaLinkError {
  if (isVidaLinkError(error)) {
    return error;
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return AuthError.invalidToken();
  }

  if (error.name === 'TokenExpiredError') {
    return AuthError.expiredToken();
  }

  // Erro de validação Zod
  if (error.name === 'ZodError') {
    return ValidationError.invalidData('Dados inválidos', error.errors);
  }

  // Erro de banco de dados
  if (error.code === '23505') { // Unique constraint violation
    if (error.constraint?.includes('email')) {
      return AuthError.emailAlreadyExists();
    }
    if (error.constraint?.includes('cpf')) {
      return AuthError.cpfAlreadyExists();
    }
    return ValidationError.invalidData('Dados duplicados');
  }

  if (error.code === '23503') { // Foreign key constraint violation
    return ValidationError.invalidData('Referência inválida');
  }

  if (error.code === '23514') { // Check constraint violation
    return ValidationError.invalidData('Dados inválidos');
  }

  // Erro genérico
  return SystemError.internal(
    process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : error.message,
    process.env.NODE_ENV !== 'production' ? error : undefined
  );
}

/**
 * Extrai informações relevantes do erro para logging
 */
export function extractErrorInfo(error: any) {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    ...(error.details && { details: error.details })
  };
} 