import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { documentService } from '../services/documentService';
import { VidaLinkError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 arquivos por vez
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new VidaLinkError('Tipo de arquivo não permitido', 400));
    }
  }
});

/**
 * @route POST /api/documents/upload
 * @desc Upload de documentos para um evento de saúde
 * @access Private
 */
router.post('/upload', authenticateToken, upload.array('files', 5), async (req, res, next) => {
  try {
    const { health_event_id } = req.body;
    const files = req.files as Express.Multer.File[];
    const userId = req.user!.id;

    if (!health_event_id) {
      throw new VidaLinkError('health_event_id é obrigatório', 400);
    }

    if (!files || files.length === 0) {
      throw new VidaLinkError('Nenhum arquivo foi enviado', 400);
    }

    // Upload de cada arquivo
    const uploadPromises = files.map(file => 
      documentService.uploadDocument({
        health_event_id,
        user_id: userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      })
    );

    const uploadedDocuments = await Promise.all(uploadPromises);

    logger.info(`${files.length} documentos enviados pelo usuário ${userId}`);

    res.status(201).json({
      success: true,
      message: `${files.length} documento(s) enviado(s) com sucesso`,
      data: uploadedDocuments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/documents/health-event/:healthEventId
 * @desc Buscar documentos de um evento de saúde
 * @access Private
 */
router.get('/health-event/:healthEventId', authenticateToken, async (req, res, next) => {
  try {
    const { healthEventId } = req.params;
    const userId = req.user!.id;

    const documents = await documentService.getDocumentsByHealthEvent(healthEventId, userId);

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/documents/:documentId
 * @desc Buscar um documento específico
 * @access Private
 */
router.get('/:documentId', authenticateToken, async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const document = await documentService.getDocumentById(documentId, userId);

    if (!document) {
      throw new VidaLinkError('Documento não encontrado', 404);
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/documents/:documentId
 * @desc Atualizar metadados de um documento
 * @access Private
 */
router.put('/:documentId', authenticateToken, async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    // Remover campos que não devem ser atualizados
    const allowedUpdates = ['original_name', 'ocr_text', 'ai_summary'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const document = await documentService.updateDocument(documentId, userId, filteredUpdates);

    logger.info(`Documento ${documentId} atualizado pelo usuário ${userId}`);

    res.json({
      success: true,
      message: 'Documento atualizado com sucesso',
      data: document
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/documents/:documentId
 * @desc Remover um documento
 * @access Private
 */
router.delete('/:documentId', authenticateToken, async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    await documentService.deleteDocument(documentId, userId);

    logger.info(`Documento ${documentId} removido pelo usuário ${userId}`);

    res.json({
      success: true,
      message: 'Documento removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/documents/user/all
 * @desc Buscar todos os documentos do usuário
 * @access Private
 */
router.get('/user/all', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = 50, offset = 0 } = req.query;

    const documents = await documentService.getDocumentsByUser(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/documents/user/stats
 * @desc Obter estatísticas de documentos do usuário
 * @access Private
 */
router.get('/user/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const stats = await documentService.getDocumentStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/documents/bulk-upload
 * @desc Upload em lote de documentos
 * @access Private
 */
router.post('/bulk-upload', authenticateToken, upload.array('files', 20), async (req, res, next) => {
  try {
    const { health_event_ids } = req.body; // Array de IDs de eventos
    const files = req.files as Express.Multer.File[];
    const userId = req.user!.id;

    if (!health_event_ids || !Array.isArray(health_event_ids)) {
      throw new VidaLinkError('health_event_ids deve ser um array', 400);
    }

    if (!files || files.length === 0) {
      throw new VidaLinkError('Nenhum arquivo foi enviado', 400);
    }

    const results = [];
    const errors = [];

    // Upload de cada arquivo para cada evento
    for (const file of files) {
      for (const healthEventId of health_event_ids) {
        try {
          const document = await documentService.uploadDocument({
            health_event_id: healthEventId,
            user_id: userId,
            file: {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size
            }
          });
          results.push(document);
        } catch (error) {
          errors.push({
            file: file.originalname,
            health_event_id: healthEventId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    }

    logger.info(`Upload em lote: ${results.length} sucessos, ${errors.length} erros - usuário ${userId}`);

    res.status(201).json({
      success: true,
      message: `Upload em lote concluído: ${results.length} sucessos, ${errors.length} erros`,
      data: {
        uploaded: results,
        errors: errors
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/documents/download/:documentId
 * @desc Download de um documento
 * @access Private
 */
router.get('/download/:documentId', authenticateToken, async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const document = await documentService.getDocumentById(documentId, userId);

    if (!document) {
      throw new VidaLinkError('Documento não encontrado', 404);
    }

    // Redirecionar para a URL do arquivo no Supabase
    res.redirect(document.file_url);
  } catch (error) {
    next(error);
  }
});

export default router; 