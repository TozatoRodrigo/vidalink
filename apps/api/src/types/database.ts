/**
 * @fileoverview Tipos TypeScript para as tabelas do banco de dados
 */

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 timestamp

// ============================================================================
// ENUMS
// ============================================================================

export enum HealthEventType {
  EXAM = 'exam',
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  MEDICATION = 'medication',
  SURGERY = 'surgery',
  EMERGENCY = 'emergency',
  OTHER = 'other'
}

export enum AccessType {
  READ = 'read',
  EXPORT = 'export'
}

export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// ============================================================================
// TABELAS DO BANCO
// ============================================================================

/**
 * Usuário (paciente) - versão completa com senha
 */
export interface User {
  id: UUID;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  birth_date?: string; // YYYY-MM-DD
  cpf: string;
  gender?: string;
  blood_type?: string;
  allergies?: string[];
  medical_conditions?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  verification_token?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Usuário (paciente) - versão pública sem senha
 */
export interface PublicUser {
  id: UUID;
  email: string;
  full_name: string;
  phone?: string;
  birth_date?: string; // YYYY-MM-DD
  cpf: string;
  gender?: string;
  blood_type?: string;
  allergies?: string[];
  medical_conditions?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Evento de saúde
 */
export interface HealthEvent {
  id: UUID;
  user_id: UUID;
  type: HealthEventType;
  title: string;
  description?: string;
  event_date: Timestamp;
  doctor_name?: string;
  institution?: string;
  location?: string;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Upload de documento
 */
export interface DocumentUpload {
  id: UUID;
  health_event_id: UUID;
  user_id: UUID;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: FileType;
  ocr_text?: string;
  ai_summary?: string;
  processing_status: ProcessingStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Compartilhamento QR Code
 */
export interface QRShare {
  id: UUID;
  user_id: UUID;
  token: string;
  event_ids: UUID[];
  access_type: AccessType;
  doctor_name?: string;
  doctor_email?: string;
  institution?: string;
  expires_at: Timestamp;
  is_active: boolean;
  access_count: number;
  max_access: number;
  last_accessed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Log de acesso
 */
export interface AccessLog {
  id: UUID;
  qr_share_id: UUID;
  user_id: UUID;
  accessed_by_ip?: string;
  accessed_by_user_agent?: string;
  access_type: 'view' | 'export';
  accessed_at: Timestamp;
}

/**
 * Tipo de evento de saúde (referência)
 */
export interface HealthEventTypeRef {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

// ============================================================================
// TIPOS PARA REQUESTS/RESPONSES
// ============================================================================

/**
 * Dados para criar usuário
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  date_of_birth: string;
  cpf: string;
}

/**
 * Dados para login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Dados para criar evento de saúde
 */
export interface CreateHealthEventRequest {
  type: HealthEventType;
  title: string;
  description?: string;
  event_date: string;
  doctor_name?: string;
  institution?: string;
  location?: string;
  notes?: string;
}

/**
 * Dados para atualizar evento de saúde
 */
export interface UpdateHealthEventRequest {
  type?: HealthEventType;
  title?: string;
  description?: string;
  event_date?: string;
  doctor_name?: string;
  institution?: string;
  location?: string;
  notes?: string;
}

/**
 * Dados para criar compartilhamento QR
 */
export interface CreateQRShareRequest {
  event_ids: UUID[];
  access_type: AccessType;
  doctor_name?: string;
  doctor_email?: string;
  institution?: string;
  expires_in_hours: number; // Será convertido para expires_at
  max_access?: number;
}

/**
 * Dados para upload de arquivo
 */
export interface UploadFileRequest {
  health_event_id: UUID;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_buffer: Buffer;
}

// ============================================================================
// TIPOS PARA RESPONSES
// ============================================================================

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Resposta de autenticação
 */
export interface AuthResponse {
  user: PublicUser;
  token: string;
  expires_at: Timestamp;
}

/**
 * Evento de saúde com documentos
 */
export interface HealthEventWithDocuments extends HealthEvent {
  documents: DocumentUpload[];
}

/**
 * Dados do paciente para compartilhamento
 */
export interface PatientShareData {
  patient: Omit<User, 'password_hash' | 'email' | 'cpf'>;
  events: HealthEventWithDocuments[];
  share_info: {
    token: string;
    access_type: AccessType;
    expires_at: Timestamp;
    doctor_name?: string;
    institution?: string;
  };
}

/**
 * Estatísticas do usuário
 */
export interface UserStats {
  total_events: number;
  events_by_type: Record<HealthEventType, number>;
  total_documents: number;
  active_shares: number;
  recent_activity: {
    date: string;
    count: number;
  }[];
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO
// ============================================================================

/**
 * Filtros para buscar eventos
 */
export interface HealthEventFilters {
  type?: HealthEventType;
  date_from?: string;
  date_to?: string;
  doctor_name?: string;
  institution?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Opções de ordenação
 */
export interface SortOptions {
  field: 'created_at' | 'event_date' | 'title' | 'type';
  direction: 'asc' | 'desc';
}

/**
 * Paginação
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ============================================================================
// TIPOS PARA ERROS
// ============================================================================

/**
 * Códigos de erro customizados
 */
export enum ErrorCode {
  // Autenticação
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  CPF_ALREADY_EXISTS = 'CPF_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  
  // Autorização
  ACCESS_DENIED = 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Recursos
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INVALID_RESOURCE_ID = 'INVALID_RESOURCE_ID',
  
  // QR Share
  QR_TOKEN_NOT_FOUND = 'QR_TOKEN_NOT_FOUND',
  QR_TOKEN_EXPIRED = 'QR_TOKEN_EXPIRED',
  QR_TOKEN_INACTIVE = 'QR_TOKEN_INACTIVE',
  QR_ACCESS_LIMIT_EXCEEDED = 'QR_ACCESS_LIMIT_EXCEEDED',
  
  // Upload
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CPF = 'INVALID_CPF',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_DATE = 'INVALID_DATE',
  
  // Sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Erro customizado da aplicação
 */
export interface VidaLinkError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: any;
} 