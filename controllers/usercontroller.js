import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from 'path';
import pool from "../db.js"; 

dotenv.config({ path: path.resolve('CodiGo/.env') });

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// registro
export const createUser = async (req, res) => {
  const { name, email, password, avatar_url } = req.body;

  console.log('Datos recibidos en el cuerpo de la solicitud:', req.body);

  if (!name || !email || !password) {
    console.log('Faltan campos obligatorios');
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const passwordString = String(password);
    console.log('Tipo de contraseña:', typeof passwordString);  // Debería ser 'string'
    const hashedPassword = await bcrypt.hash(passwordString, 10);  // Asegura que password sea un string
    console.log('Contraseña hasheada:', hashedPassword);

    const query = `
      INSERT INTO users (name, email, password, current_level, avatar_url, created_at) 
      VALUES ($1, $2, $3, 1, $4, NOW()) 
      RETURNING id, name, email, current_level, avatar_url
    `;

    const values = [name, email, hashedPassword, avatar_url]; 

    console.log('Ejecutando la consulta SQL:', query, values);

    const result = await pool.query(query, values);
    const user = result.rows[0];

    console.log('Usuario creado:', user);

    const token = generateToken(user.id);
    console.log('Token generado:', token);

    res.status(201).json({ user, token });

  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};


// iniciar sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Todos los campos son obligatorios" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Credenciales incorrectas" });

    res.json({ user, token: generateToken(user.id) });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
};

// GET de users
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, current_level, avatar_url FROM users");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, current_level, avatar_url FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
};

// UPDATE de users
export const updateUser = async (req, res) => {
  const { name, email, avatar_url } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, avatar_url = $3 WHERE id = $4 RETURNING id, name, email, current_level, avatar_url",
      [name, email, avatar_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, current_level, avatar_url FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos del usuario", error });
  }
};

export const getUserLevel = async (req, res) => {
  try {
    const result = await pool.query("SELECT current_level FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ current_level: result.rows[0].current_level });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener nivel del usuario", error });
  }
};

export const updateUserLevel = async (req, res) => {
  const { current_level } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET current_level = $1 WHERE id = $2 RETURNING id, name, email, current_level, avatar_url",
      [current_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar nivel del usuario", error });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Usuario eliminado", user: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};
