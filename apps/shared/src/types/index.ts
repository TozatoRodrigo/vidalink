import { z } from 'zod';

// ============================================================================
// USER TYPES
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime(),
  cpf: z.string().regex(/^\d{11}$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// HEALTH EVENT TYPES
// ============================================================================

export const HealthEventTypeEnum = z.enum([
  'exam',
  'consultation',
  'vaccination',
  'medication',
  'surgery',
  'emergency',
  'other'
]);

export const HealthEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: HealthEventTypeEnum,
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  attachmentUrl: z.string().url().optional(),
  ocrText: z.string().optional(),
  aiSummary: z.string().optional(),
  doctorName: z.string().optional(),
  institution: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type HealthEvent = z.infer<typeof HealthEventSchema>;
export type HealthEventType = z.infer<typeof HealthEventTypeEnum>;

// ============================================================================
// QR CODE SHARE TYPES
// ============================================================================

export const QRShareSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  doctorEmail: z.string().email().optional(),
  expiresAt: z.string().datetime(),
  isActive: z.boolean(),
  accessCount: z.number().default(0),
  maxAccess: z.number().default(1),
  createdAt: z.string().datetime(),
  lastAccessedAt: z.string().datetime().optional(),
});

export type QRShare = z.infer<typeof QRShareSchema>;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Auth
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  dateOfBirth: z.string().datetime(),
  cpf: z.string().regex(/^\d{11}$/),
  phone: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
});

// Health Events
export const CreateHealthEventRequestSchema = z.object({
  type: HealthEventTypeEnum,
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  doctorName: z.string().optional(),
  institution: z.string().optional(),
});

export const UploadExamRequestSchema = z.object({
  file: z.any(), // File object
  type: HealthEventTypeEnum.default('exam'),
  title: z.string().min(1),
  date: z.string().datetime(),
  doctorName: z.string().optional(),
  institution: z.string().optional(),
});

// QR Share
export const CreateQRShareRequestSchema = z.object({
  doctorEmail: z.string().email().optional(),
  expiresInHours: z.number().min(1).max(168).default(24), // Max 7 days
  maxAccess: z.number().min(1).max(10).default(1),
});

export const QRShareResponseSchema = z.object({
  shareId: z.string().uuid(),
  token: z.string(),
  qrCodeUrl: z.string().url(),
  expiresAt: z.string().datetime(),
  accessUrl: z.string().url(),
});

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// ============================================================================
// EXPORT INFERRED TYPES
// ============================================================================

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type CreateHealthEventRequest = z.infer<typeof CreateHealthEventRequestSchema>;
export type UploadExamRequest = z.infer<typeof UploadExamRequestSchema>;
export type CreateQRShareRequest = z.infer<typeof CreateQRShareRequestSchema>;
export type QRShareResponse = z.infer<typeof QRShareResponseSchema>; 