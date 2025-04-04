import pool from "../db.js";

// Create a new level
export const createLevel = async (req, res) => {
  const { module_id, number } = req.body;

  if (!module_id || !number) {
    return res.status(400).json({ message: "El ID del módulo y el número de nivel son obligatorios" });
  }

  try {
    // Verificar que el módulo existe
    const moduleCheck = await pool.query("SELECT id FROM modules WHERE id = $1", [module_id]);
    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({ message: "El módulo no existe" });
    }

    const query = "INSERT INTO levels (module_id, number) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(query, [module_id, number]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear nivel:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: "Ya existe un nivel con ese número para este módulo" });
    }
    res.status(500).json({ message: "Error al crear nivel", error: error.message });
  }
};

// Get all levels
export const getLevels = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, m.name as module_name 
      FROM levels l
      JOIN modules m ON l.module_id = m.id
      ORDER BY m.id, l.number
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener niveles", error: error.message });
  }
};

// Get levels by module ID
export const getLevelsByModule = async (req, res) => {
  const { module_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT l.*, m.name as module_name 
      FROM levels l
      JOIN modules m ON l.module_id = m.id
      WHERE l.module_id = $1
      ORDER BY l.number
    `, [module_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener niveles por módulo", error: error.message });
  }
};

// Get level by ID
export const getLevelById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, m.name as module_name 
      FROM levels l
      JOIN modules m ON l.module_id = m.id
      WHERE l.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Nivel no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener nivel", error: error.message });
  }
};

// Update level
export const updateLevel = async (req, res) => {
  const { module_id, number } = req.body;
  const { id } = req.params;
  
  if (!module_id || !number) {
    return res.status(400).json({ message: "El ID del módulo y el número de nivel son obligatorios" });
  }

  try {
    // Verificar que el módulo existe
    const moduleCheck = await pool.query("SELECT id FROM modules WHERE id = $1", [module_id]);
    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({ message: "El módulo no existe" });
    }

    const result = await pool.query(
      "UPDATE levels SET module_id = $1, number = $2 WHERE id = $3 RETURNING *",
      [module_id, number, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Nivel no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "Ya existe un nivel con ese número para este módulo" });
    }
    res.status(500).json({ message: "Error al actualizar nivel", error: error.message });
  }
};

// Delete level
export const deleteLevel = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM levels WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Nivel no encontrado" });
    res.status(200).json({ message: "Nivel eliminado", level: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar nivel:", error);
    res.status(500).json({ message: "Error al eliminar nivel", error: error.message });
  }
};