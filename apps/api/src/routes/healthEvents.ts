/**
 * @fileoverview Rotas de eventos de saúde
 */

import { Router } from 'express';

const router = Router();

// Rota temporária para testar
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de eventos de saúde funcionando!',
  });
});

export { router as healthEventRoutes }; 