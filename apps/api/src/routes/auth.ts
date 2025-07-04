/**
 * @fileoverview Rotas de autenticação
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { createUserSchema, loginSchema } from '../utils/validation';
import { ApiResponse } from '../types/database';

const router = Router();

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados de entrada
    const validatedData = createUserSchema.parse(req.body);

    // Registra o usuário
    const authResponse = await AuthService.register(validatedData);

    const response: ApiResponse = {
      success: true,
      data: authResponse,
      message: 'Usuário registrado com sucesso'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Autentica um usuário
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados de entrada
    const validatedData = loginSchema.parse(req.body);

    // Autentica o usuário
    const authResponse = await AuthService.login(validatedData);

    const response: ApiResponse = {
      success: true,
      data: authResponse,
      message: 'Login realizado com sucesso'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify
 * Verifica se um token é válido
 */
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      });
    }

    // Verifica o token
    const user = await AuthService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { user },
      message: 'Token válido'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/check-email
 * Verifica se um email já está em uso
 */
router.get('/check-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    const isEmailTaken = await AuthService.isEmailTaken(email);

    const response: ApiResponse = {
      success: true,
      data: { 
        email,
        available: !isEmailTaken 
      },
      message: isEmailTaken ? 'Email já está em uso' : 'Email disponível'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/check-cpf
 * Verifica se um CPF já está em uso
 */
router.get('/check-cpf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cpf } = req.query;

    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'CPF é obrigatório'
      });
    }

    const isCPFTaken = await AuthService.isCPFTaken(cpf);

    const response: ApiResponse = {
      success: true,
      data: { 
        cpf,
        available: !isCPFTaken 
      },
      message: isCPFTaken ? 'CPF já está em uso' : 'CPF disponível'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Rota temporária para testar
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rotas de autenticação funcionando!',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/verify',
      'GET /api/auth/check-email',
      'GET /api/auth/check-cpf'
    ]
  });
});

export { router as authRoutes }; 