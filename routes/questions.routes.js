import { Router } from 'express';
import { 
  createQuestion,
  getQuestions,
  getQuestionsByLevel,
  getQuestionsByModule,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from '../controllers/questions.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.get('/levels/:level_id/questions', getQuestionsByLevel);
router.get('/modules/:module_id/questions', getQuestionsByModule);

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware);

// Rutas protegidas
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;