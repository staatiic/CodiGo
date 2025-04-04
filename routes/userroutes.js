import { Router } from "express";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createUser, 
    loginUser, 
    getUsers, 
    getUserById, 
    deleteUser, 
    updateUser, 
    getCurrentUser, 
    getUserLevel, 
    updateUserLevel } from '../controllers/usercontroller.js';

const router = Router();
  
// rutas públicas 
router.post("/users", createUser); 
router.post("/login", loginUser); 

// Middleware de autenticación para todas las rutas protegidas
router.use(authMiddleware);  

// rutas protegidas
router.get('/users', getUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);
router.get("/me", getCurrentUser);
router.get("/users/:id/level", getUserLevel);
router.patch("/users/:id/level", updateUserLevel);

export default router;