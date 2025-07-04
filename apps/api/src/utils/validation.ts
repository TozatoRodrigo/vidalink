/**
 * @fileoverview Utilitários de validação para a aplicação VidaLink
 */

import { z } from 'zod';
import { HealthEventType, AccessType } from '../types/database';

// ============================================================================
// VALIDAÇÕES BÁSICAS
// ============================================================================

/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCPF[9]) !== firstDigit) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  return parseInt(cleanCPF[10]) === secondDigit;
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida data no formato ISO 8601
 */
export function isValidDate(date: string): boolean {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().substring(0, 10) === date.substring(0, 10);
}

/**
 * Valida se a data não é no futuro
 */
export function isNotFutureDate(date: string): boolean {
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fim do dia atual
  return parsedDate <= today;
}

/**
 * Valida se a pessoa tem pelo menos 18 anos
 */
export function isAdult(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

/**
 * Valida telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Valida senha forte
 */
export function isStrongPassword(password: string): boolean {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================================================

/**
 * Schema para CPF
 */
export const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido')
  .refine(isValidCPF, { message: 'CPF inválido' });

/**
 * Schema para email
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muito longo');

/**
 * Schema para senha
 */
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .refine(isStrongPassword, {
    message: 'Senha deve conter pelo menos 1 maiúscula, 1 minúscula e 1 número'
  });

/**
 * Schema para data de nascimento
 */
export const birthDateSchema = z
  .string()
  .refine(isValidDate, { message: 'Data inválida' })
  .refine(isNotFutureDate, { message: 'Data de nascimento não pode ser no futuro' })
  .refine(isAdult, { message: 'Usuário deve ter pelo menos 18 anos' });

/**
 * Schema para telefone
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => !phone || isValidPhone(phone), {
    message: 'Telefone inválido'
  });

/**
 * Schema para UUID
 */
export const uuidSchema = z
  .string()
  .uuid('UUID inválido');

// ============================================================================
// SCHEMAS PARA REQUESTS
// ============================================================================

/**
 * Schema para criação de usuário
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255, 'Nome muito longo'),
  phone: phoneSchema,
  date_of_birth: birthDateSchema,
  cpf: cpfSchema
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
});

/**
 * Schema para criação de evento de saúde
 */
export const createHealthEventSchema = z.object({
  type: z.nativeEnum(HealthEventType, { message: 'Tipo de evento inválido' }),
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  event_date: z.string().refine(isValidDate, { message: 'Data inválida' }),
  doctor_name: z.string().max(255, 'Nome do médico muito longo').optional(),
  institution: z.string().max(255, 'Nome da instituição muito longo').optional(),
  location: z.string().max(255, 'Localização muito longa').optional(),
  notes: z.string().max(2000, 'Notas muito longas').optional()
});

/**
 * Schema para atualização de evento de saúde
 */
export const updateHealthEventSchema = createHealthEventSchema.partial();

/**
 * Schema para criação de compartilhamento QR
 */
export const createQRShareSchema = z.object({
  event_ids: z.array(uuidSchema).min(1, 'Pelo menos um evento deve ser selecionado'),
  access_type: z.nativeEnum(AccessType, { message: 'Tipo de acesso inválido' }),
  doctor_name: z.string().max(255, 'Nome do médico muito longo').optional(),
  doctor_email: emailSchema.optional(),
  institution: z.string().max(255, 'Nome da instituição muito longo').optional(),
  expires_in_hours: z.number().min(1, 'Expiração deve ser pelo menos 1 hora').max(168, 'Expiração máxima é 7 dias'),
  max_access: z.number().min(1, 'Máximo de acessos deve ser pelo menos 1').max(100, 'Máximo de acessos é 100').optional()
});

/**
 * Schema para filtros de eventos de saúde
 */
export const healthEventFiltersSchema = z.object({
  type: z.nativeEnum(HealthEventType).optional(),
  date_from: z.string().refine(isValidDate, { message: 'Data inicial inválida' }).optional(),
  date_to: z.string().refine(isValidDate, { message: 'Data final inválida' }).optional(),
  doctor_name: z.string().max(255).optional(),
  institution: z.string().max(255).optional(),
  search: z.string().max(255).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

/**
 * Schema para paginação
 */
export const paginationSchema = z.object({
  page: z.number().min(1, 'Página deve ser pelo menos 1').default(1),
  limit: z.number().min(1, 'Limit deve ser pelo menos 1').max(100, 'Limit máximo é 100').default(20)
});

// ============================================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================================

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Limpa string removendo caracteres especiais
 */
export function cleanString(str: string): string {
  return str.replace(/[^\w\s]/gi, '').trim();
}

/**
 * Sanitiza entrada de texto
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Gera token QR aleatório
 */
export function generateQRToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Calcula data de expiração
 */
export function calculateExpirationDate(hoursFromNow: number): Date {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + hoursFromNow);
  return expirationDate;
}

/**
 * Verifica se uma data está expirada
 */
export function isExpired(date: string | Date): boolean {
  const expirationDate = typeof date === 'string' ? new Date(date) : date;
  return expirationDate < new Date();
}

// ============================================================================
// VALIDAÇÕES CUSTOMIZADAS
// ============================================================================

/**
 * Valida se os eventos pertencem ao usuário
 */
export function validateEventOwnership(eventIds: string[], userEvents: string[]): boolean {
  return eventIds.every(id => userEvents.includes(id));
}

/**
 * Valida tamanho de arquivo
 */
export function validateFileSize(size: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}

/**
 * Valida tipo de arquivo
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Valida se o token QR tem formato correto
 */
export function validateQRTokenFormat(token: string): boolean {
  const tokenRegex = /^[A-Z0-9]{8}$/;
  return tokenRegex.test(token);
} 