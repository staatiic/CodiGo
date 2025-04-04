import { Router } from 'express';
import { 
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule
} from '../controllers/modules.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.get('/modules', getModules);
router.get('/modules/:id', getModuleById);

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware);

// Rutas protegidas
router.post('/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

export default router;