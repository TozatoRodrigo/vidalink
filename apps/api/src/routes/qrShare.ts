/**
 * @fileoverview Rotas de compartilhamento QR
 */

import { Router } from 'express';

const router = Router();

// Rota temporária para testar
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de QR Share funcionando!',
  });
});

export { router as qrShareRoutes }; 