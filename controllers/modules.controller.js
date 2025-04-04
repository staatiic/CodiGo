import pool from "../db.js";

// Create a new module
export const createModule = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "El nombre del módulo es obligatorio" });
  }

  try {
    const query = "INSERT INTO modules (name) VALUES ($1) RETURNING *";
    const result = await pool.query(query, [name]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear módulo:', error);
    res.status(500).json({ message: "Error al crear módulo", error: error.message });
  }
};

// Get all modules
export const getModules = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modules ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener módulos", error: error.message });
  }
};

// Get module by ID
export const getModuleById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modules WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Módulo no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener módulo", error: error.message });
  }
};

// Update module
export const updateModule = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  
  if (!name) {
    return res.status(400).json({ message: "El nombre del módulo es obligatorio" });
  }

  try {
    const result = await pool.query(
      "UPDATE modules SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Módulo no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar módulo", error: error.message });
  }
};

// Delete module
export const deleteModule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM modules WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Módulo no encontrado" });
    res.status(200).json({ message: "Módulo eliminado", module: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar módulo:", error);
    res.status(500).json({ message: "Error al eliminar módulo", error: error.message });
  }
};