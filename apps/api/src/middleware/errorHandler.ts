/**
 * @fileoverview Middleware para tratamento centralizado de erros
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { VidaLinkError, normalizeError, extractErrorInfo } from '../utils/errors';

/**
 * Middleware de tratamento de erros
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Normaliza o erro para VidaLinkError
  const normalizedError = normalizeError(error);

  // Log do erro
  logger.error('Erro na API', {
    ...extractErrorInfo(normalizedError),
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Retorna a resposta formatada
  res.status(normalizedError.statusCode).json(normalizedError.toJSON());
}; 