/**
 * @fileoverview Serviço de autenticação para VidaLink
 */

import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { AuthError } from '../utils/errors';
import { 
  PublicUser,
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse
} from '../types/database';

/**
 * Configurações de autenticação
 */
const AUTH_CONFIG = {
  SALT_ROUNDS: 12,
  JWT_EXPIRES_IN: '7d',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key'
};

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Registra um novo usuário
   */
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Iniciando registro com dados:', { ...userData, password: '[HIDDEN]' });
      
      // Verifica se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw AuthError.emailAlreadyExists();
      }

      // Verifica se o CPF já existe
      const { data: existingCPF } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', userData.cpf.replace(/\D/g, ''))
        .single();

      if (existingCPF) {
        throw AuthError.cpfAlreadyExists();
      }

      // Hash da senha
      console.log('🔐 Gerando hash da senha...');
      const passwordHash = await bcrypt.hash(userData.password, AUTH_CONFIG.SALT_ROUNDS);
      console.log('✅ Hash gerado com sucesso');

      // Cria o usuário no banco
      console.log('💾 Inserindo usuário no banco...');
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: passwordHash,
          full_name: userData.name,
          phone: userData.phone,
          birth_date: userData.date_of_birth,
          cpf: userData.cpf.replace(/\D/g, ''), // Remove formatação
          is_verified: false
        })
        .select('id, email, full_name, phone, birth_date, cpf, profile_picture_url, is_verified, created_at, updated_at')
        .single();

      if (error) {
        console.error('❌ Erro ao inserir usuário:', error);
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }
      
      console.log('✅ Usuário criado com sucesso:', newUser.id);

      // Gera token JWT
      const payload = { userId: newUser.id, email: newUser.email };
      const token = (jwt.sign as any)(payload, AUTH_CONFIG.JWT_SECRET, { expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN });

      // Calcula data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      return {
        user: newUser as PublicUser,
        token,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Autentica um usuário
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Busca o usuário pelo email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email.toLowerCase())
        .eq('is_verified', true)
        .single();

      if (error || !user) {
        throw AuthError.invalidCredentials();
      }

      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
      
      if (!isPasswordValid) {
        throw AuthError.invalidCredentials();
      }

      // Gera token JWT
      const payload = { userId: user.id, email: user.email };
      const token = (jwt.sign as any)(payload, AUTH_CONFIG.JWT_SECRET, { expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN });

      // Calcula data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Remove senha do retorno
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as PublicUser,
        token,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica se um token JWT é válido
   */
  static async verifyToken(token: string): Promise<PublicUser | null> {
    try {
      const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as any;
      
      // Busca o usuário no banco
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, birth_date, cpf, profile_picture_url, is_verified, created_at, updated_at')
        .eq('id', decoded.userId)
        .eq('is_verified', true)
        .single();

      if (error || !user) {
        return null;
      }

      return user as PublicUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Atualiza informações do usuário
   */
  static async updateProfile(userId: string, updates: Partial<PublicUser>): Promise<PublicUser> {
    try {
      // Remove campos que não podem ser atualizados
      const { id, created_at, updated_at, ...allowedUpdates } = updates;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...allowedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, email, full_name, phone, birth_date, cpf, profile_picture_url, is_verified, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

      return updatedUser as PublicUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Altera a senha do usuário
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Busca o usuário atual
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw AuthError.userNotFound();
      }

      // Verifica a senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isCurrentPasswordValid) {
        throw AuthError.invalidCredentials('Senha atual incorreta');
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword, AUTH_CONFIG.SALT_ROUNDS);

      // Atualiza a senha no banco
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erro ao alterar senha: ${updateError.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  static async getUserById(userId: string): Promise<PublicUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, birth_date, cpf, profile_picture_url, is_verified, created_at, updated_at')
        .eq('id', userId)
        .eq('is_verified', true)
        .single();

      if (error || !user) {
        return null;
      }

      return user as PublicUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gera um novo token para um usuário
   */
  static generateToken(userId: string, email: string): string {
    const payload = { userId, email };
    return (jwt.sign as any)(payload, AUTH_CONFIG.JWT_SECRET, { expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN });
  }

  /**
   * Valida se um email já está em uso
   */
  static async isEmailTaken(email: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida se um CPF já está em uso
   */
  static async isCPFTaken(cpf: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpf.replace(/\D/g, ''))
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
} 