import { Router } from 'express';
import { 
  createAnswer,
  getAnswers,
  getAnswersByQuestion,
  getAnswerById,
  updateAnswer,
  deleteAnswer
} from '../controllers/answers.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.get('/answers', getAnswers);
router.get('/answers/:id', getAnswerById);
router.get('/questions/:question_id/answers', getAnswersByQuestion);

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware);

// Rutas protegidas
router.post('/answers', createAnswer);
router.put('/answers/:id', updateAnswer);
router.delete('/answers/:id', deleteAnswer);

export default router;