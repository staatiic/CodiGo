import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    // Verificar si hay un header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Extraer el token (quitar "Bearer ")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir el usuario decodificado al objeto req
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;