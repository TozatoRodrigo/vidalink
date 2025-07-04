/**
 * @fileoverview Middleware de autenticação e autorização
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { AuthError, AuthorizationError } from '../utils/errors';

// Extende o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware para verificar token JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw AuthError.invalidToken('Token de acesso obrigatório');
    }

    // Verifica o token JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('Configuração de JWT inválida');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Busca dados atualizados do usuário no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw AuthError.userNotFound();
    }

    // Adiciona o usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AuthError.invalidToken());
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(AuthError.expiredToken());
    }

    next(error);
  }
};

/**
 * Middleware opcional para autenticação (não falha se não houver token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continua sem autenticação
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return next(); // Continua sem autenticação
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.userId)
      .single();

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

/**
 * Middleware para verificar se o usuário é dono do recurso
 */
export const authorizeOwner = (resourceUserIdField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw AuthError.invalidToken('Autenticação obrigatória');
      }

      // Verifica se o ID do usuário está nos parâmetros, body ou query
      const resourceUserId = req.params[resourceUserIdField] || 
                           req.body[resourceUserIdField] || 
                           req.query[resourceUserIdField];

      if (resourceUserId && resourceUserId !== req.user.id) {
        throw AuthorizationError.accessDenied();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 