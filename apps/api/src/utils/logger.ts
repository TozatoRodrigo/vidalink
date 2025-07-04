/**
 * @fileoverview Sistema de logging centralizado usando Winston
 */

import winston from 'winston';

const { combine, timestamp, errors, json, simple, colorize } = winston.format;

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: {
    service: 'vidalink-api',
  },
  transports: [
    // Arquivo para logs de erro
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Arquivo para todos os logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Em desenvolvimento, também exibe no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      simple()
    ),
  }));
}

/**
 * Middleware para logging de requests HTTP
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
}; 