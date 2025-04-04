import pool from "../db.js";

// Create a new question
export const createQuestion = async (req, res) => {
  const { module_id, level_id, text, is_true_false } = req.body;

  if (!module_id || !level_id || !text) {
    return res.status(400).json({ message: "El módulo, nivel y texto de la pregunta son obligatorios" });
  }

  try {
    // Verificar que el nivel existe y pertenece al módulo
    const levelCheck = await pool.query(
      "SELECT id FROM levels WHERE id = $1 AND module_id = $2", 
      [level_id, module_id]
    );
    if (levelCheck.rows.length === 0) {
      return res.status(404).json({ message: "El nivel no existe o no pertenece al módulo especificado" });
    }

    const query = `
      INSERT INTO questions (module_id, level_id, text, is_true_false) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const result = await pool.query(query, [module_id, level_id, text, is_true_false || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    res.status(500).json({ message: "Error al crear pregunta", error: error.message });
  }
};

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, m.name as module_name, l.number as level_number
      FROM questions q
      JOIN modules m ON q.module_id = m.id
      JOIN levels l ON q.level_id = l.id
      ORDER BY q.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener preguntas", error: error.message });
  }
};

// Get questions by level ID
export const getQuestionsByLevel = async (req, res) => {
  const { level_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT q.*, m.name as module_name, l.number as level_number
      FROM questions q
      JOIN modules m ON q.module_id = m.id
      JOIN levels l ON q.level_id = l.id
      WHERE q.level_id = $1
      ORDER BY q.id
    `, [level_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener preguntas por nivel", error: error.message });
  }
};

// Get questions by module ID
export const getQuestionsByModule = async (req, res) => {
  const { module_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT q.*, m.name as module_name, l.number as level_number
      FROM questions q
      JOIN modules m ON q.module_id = m.id
      JOIN levels l ON q.level_id = l.id
      WHERE q.module_id = $1
      ORDER BY l.number, q.id
    `, [module_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener preguntas por módulo", error: error.message });
  }
};

// Get question by ID
export const getQuestionById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, m.name as module_name, l.number as level_number
      FROM questions q
      JOIN modules m ON q.module_id = m.id
      JOIN levels l ON q.level_id = l.id
      WHERE q.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Pregunta no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pregunta", error: error.message });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  const { module_id, level_id, text, is_true_false } = req.body;
  const { id } = req.params;
  
  if (!module_id || !level_id || !text) {
    return res.status(400).json({ message: "El módulo, nivel y texto de la pregunta son obligatorios" });
  }

  try {
    // Verificar que el nivel existe y pertenece al módulo
    const levelCheck = await pool.query(
      "SELECT id FROM levels WHERE id = $1 AND module_id = $2", 
      [level_id, module_id]
    );
    if (levelCheck.rows.length === 0) {
      return res.status(404).json({ message: "El nivel no existe o no pertenece al módulo especificado" });
    }

    const result = await pool.query(
      "UPDATE questions SET module_id = $1, level_id = $2, text = $3, is_true_false = $4 WHERE id = $5 RETURNING *",
      [module_id, level_id, text, is_true_false || false, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Pregunta no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar pregunta", error: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM questions WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Pregunta no encontrada" });
    res.status(200).json({ message: "Pregunta eliminada", question: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    res.status(500).json({ message: "Error al eliminar pregunta", error: error.message });
  }
};