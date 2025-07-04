/**
 * @fileoverview Rotas de acesso médico
 */

import { Router } from 'express';

const router = Router();

// Rota temporária para testar
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de acesso médico funcionando!',
  });
});

export { router as medicalAccessRoutes }; 