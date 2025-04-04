import pool from "../db.js";

// Create a new answer
export const createAnswer = async (req, res) => {
  const { question_id, text, is_correct } = req.body;

  if (!question_id || !text) {
    return res.status(400).json({ message: "El ID de la pregunta y el texto de la respuesta son obligatorios" });
  }

  try {
    // Verificar que la pregunta existe
    const questionCheck = await pool.query("SELECT id, is_true_false FROM questions WHERE id = $1", [question_id]);
    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "La pregunta no existe" });
    }

    // Si la pregunta es de tipo true/false, verificar que no tenga ya 2 respuestas
    if (questionCheck.rows[0].is_true_false) {
      const answersCount = await pool.query("SELECT COUNT(*) FROM answers WHERE question_id = $1", [question_id]);
      if (parseInt(answersCount.rows[0].count) >= 2) {
        return res.status(400).json({ message: "Las preguntas de tipo verdadero/falso solo pueden tener 2 respuestas" });
      }
    }

    // Verificar que no haya más de una respuesta correcta para preguntas de tipo true/false
    if (questionCheck.rows[0].is_true_false && is_correct) {
      const correctAnswersCount = await pool.query(
        "SELECT COUNT(*) FROM answers WHERE question_id = $1 AND is_correct = true", 
        [question_id]
      );
      if (parseInt(correctAnswersCount.rows[0].count) >= 1) {
        return res.status(400).json({ message: "Las preguntas de tipo verdadero/falso solo pueden tener una respuesta correcta" });
      }
    }

    const query = "INSERT INTO answers (question_id, text, is_correct) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(query, [question_id, text, is_correct || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear respuesta:', error);
    res.status(500).json({ message: "Error al crear respuesta", error: error.message });
  }
};

// Get all answers
export const getAnswers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, q.text as question_text
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener respuestas", error: error.message });
  }
};

// Get answers by question ID
export const getAnswersByQuestion = async (req, res) => {
  const { question_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT a.*, q.text as question_text
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.question_id = $1
      ORDER BY a.id
    `, [question_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener respuestas por pregunta", error: error.message });
  }
};

// Get answer by ID
export const getAnswerById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, q.text as question_text
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Respuesta no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener respuesta", error: error.message });
  }
};

// Update answer
export const updateAnswer = async (req, res) => {
  const { question_id, text, is_correct } = req.body;
  const { id } = req.params;
  
  if (!question_id || !text) {
    return res.status(400).json({ message: "El ID de la pregunta y el texto de la respuesta son obligatorios" });
  }

  try {
    // Verificar que la pregunta existe
    const questionCheck = await pool.query("SELECT id, is_true_false FROM questions WHERE id = $1", [question_id]);
    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: "La pregunta no existe" });
    }

    // Si la respuesta será marcada como correcta y la pregunta es de tipo true/false
    if (is_correct && questionCheck.rows[0].is_true_false) {
      const correctAnswersCount = await pool.query(
        "SELECT COUNT(*) FROM answers WHERE question_id = $1 AND is_correct = true AND id != $2", 
        [question_id, id]
      );
      if (parseInt(correctAnswersCount.rows[0].count) >= 1) {
        return res.status(400).json({ message: "Las preguntas de tipo verdadero/falso solo pueden tener una respuesta correcta" });
      }
    }

    const result = await pool.query(
      "UPDATE answers SET question_id = $1, text = $2, is_correct = $3 WHERE id = $4 RETURNING *",
      [question_id, text, is_correct || false, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Respuesta no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar respuesta", error: error.message });
  }
};

// Delete answer
export const deleteAnswer = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM answers WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Respuesta no encontrada" });
    res.status(200).json({ message: "Respuesta eliminada", answer: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar respuesta:", error);
    res.status(500).json({ message: "Error al eliminar respuesta", error: error.message });
  }
};