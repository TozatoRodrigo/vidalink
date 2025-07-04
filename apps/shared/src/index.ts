/**
 * @fileoverview Ponto de entrada principal do pacote @vidalink/shared
 * Exporta todos os tipos, utilitários e constantes compartilhadas
 */

// Tipos
export * from './types';

// Utilitários
export * from './utils';

// Constantes
export const APP_CONFIG = {
  QR_TOKEN_DEFAULT_EXPIRY_HOURS: 24,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
  MAX_QR_ACCESS_COUNT: 10,
  MAX_QR_EXPIRY_HOURS: 168, // 7 days
} as const;

export const HEALTH_EVENT_COLORS = {
  exam: '#3B82F6',      // Blue
  consultation: '#10B981', // Green
  vaccination: '#8B5CF6',  // Purple
  medication: '#F59E0B',   // Amber
  surgery: '#EF4444',      // Red
  emergency: '#DC2626',    // Dark Red
  other: '#6B7280',        // Gray
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  HEALTH_EVENTS: {
    LIST: '/health-events',
    CREATE: '/health-events',
    GET_BY_ID: '/health-events/:id',
    UPDATE: '/health-events/:id',
    DELETE: '/health-events/:id',
    UPLOAD_EXAM: '/health-events/upload-exam',
  },
  QR_SHARE: {
    CREATE: '/qr-share',
    GET_BY_TOKEN: '/qr-share/:token',
    REVOKE: '/qr-share/:id/revoke',
    LIST_USER_SHARES: '/qr-share/user',
  },
  MEDICAL_ACCESS: {
    GET_PATIENT_DATA: '/medical-access/:token',
    RECORD_ACCESS: '/medical-access/:token/access',
  },
} as const; 