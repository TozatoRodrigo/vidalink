/**
 * @fileoverview Servidor principal da API VidaLink
 * Configura Express, middlewares e rotas
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { healthEventRoutes } from './routes/healthEvents';
import { qrShareRoutes } from './routes/qrShare';
import { medicalAccessRoutes } from './routes/medicalAccess';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARES DE SEGURANÇA
// ============================================================================

// Helmet para headers de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});
app.use(limiter);

// ============================================================================
// MIDDLEWARES DE PARSING
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VidaLink API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================================================
// ROTAS DA API
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health-events', healthEventRoutes);
app.use('/api/qr-share', qrShareRoutes);
app.use('/api/medical-access', medicalAccessRoutes);

// ============================================================================
// MIDDLEWARE DE ERRO
// ============================================================================

app.use(errorHandler);

// ============================================================================
// ROTA 404
// ============================================================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
  });
});

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  logger.info(`🚀 Servidor VidaLink rodando na porta ${PORT}`);
  logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

export default app; 