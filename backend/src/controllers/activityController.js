const pool = require('../config/database');
const { parseDueDate } = require('../utils/dateTime');

// Listar todas las actividades del usuario
exports.getActivities = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;

    let query = 'SELECT * FROM activities WHERE user_id = $1';
    const params = [req.userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ' ORDER BY due_date ASC';

    const result = await pool.query(query, params);
    res.json({ activities: result.rows });
  } catch (error) {
    next(error);
  }
};

// Crear nueva actividad
exports.createActivity = async (req, res, next) => {
  const { title, description, due_date, time_zone, priority, category } = req.body;

  try {
    // Validación
    if (!title || !due_date) {
      return res.status(400).json({ error: 'Título y fecha de vencimiento son requeridos' });
    }

    if (priority && !['alta', 'media', 'baja'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }

    const dueDate = parseDueDate(due_date, time_zone);
    if (!dueDate) {
      return res.status(400).json({ error: 'Fecha u zona horaria inválida' });
    }

    const result = await pool.query(
      `INSERT INTO activities (user_id, title, description, due_date, priority, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       RETURNING *`,
      [req.userId, title, description || null, dueDate, priority || 'media', category || null]
    );

    res.status(201).json({
      message: 'Actividad creada exitosamente',
      activity: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una actividad específica
exports.getActivityById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({ activity: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Actualizar actividad
exports.updateActivity = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, due_date, time_zone, priority, status, category } = req.body;

  try {
    // Verificar que la actividad existe y pertenece al usuario
    const check = await pool.query(
      'SELECT id FROM activities WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Validaciones
    if (priority && !['alta', 'media', 'baja'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }

    if (status && !['pendiente', 'en_proceso', 'completado'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const dueDate = due_date === undefined || due_date === null
      ? null
      : parseDueDate(due_date, time_zone);
    if (due_date !== undefined && due_date !== null && !dueDate) {
      return res.status(400).json({ error: 'Fecha u zona horaria inválida' });
    }

    const result = await pool.query(
      `UPDATE activities
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           priority = COALESCE($4, priority),
           status = COALESCE($5, status),
           category = COALESCE($6, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, dueDate, priority, status, category, id, req.userId]
    );

    res.json({
      message: 'Actividad actualizada exitosamente',
      activity: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar solo el estado
exports.updateActivityStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status || !['pendiente', 'en_proceso', 'completado'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await pool.query(
      `UPDATE activities
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      activity: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar actividad
exports.deleteActivity = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM activities WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
