import { Router } from 'express';
import { 
  createLevel,
  getLevels,
  getLevelsByModule,
  getLevelById,
  updateLevel,
  deleteLevel
} from '../controllers/level.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.get('/levels', getLevels);
router.get('/levels/:id', getLevelById);
router.get('/modules/:module_id/levels', getLevelsByModule);

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware);

// Rutas protegidas
router.post('/levels', createLevel);
router.put('/levels/:id', updateLevel);
router.delete('/levels/:id', deleteLevel);

export default router;