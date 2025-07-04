/**
 * @fileoverview Rotas de usuários
 */

import { Router } from 'express';

const router = Router();

// Rota temporária para testar
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de usuários funcionando!',
  });
});

export { router as userRoutes }; 