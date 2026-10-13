const pool = require('../config/database');

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
  const { title, description, due_date, priority, category } = req.body;

  try {
    // Validación
    if (!title || !due_date) {
      return res.status(400).json({ error: 'Título y fecha de vencimiento son requeridos' });
    }

    if (priority && !['alta', 'media', 'baja'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }

    // Convertir la fecha de hora local (México UTC-6) a UTC
    // El frontend envía: "2026-10-12T16:05" (4:05 PM hora local México)
    // PostgreSQL necesita: "2026-10-12T22:05:00.000Z" (10:05 PM UTC)

    // Tratamos la fecha como si fuera en timezone de México (UTC-6)
    const dueDate = new Date(due_date + ':00.000-06:00');

    console.log(`📅 Fecha recibida del frontend: ${due_date} (hora local México)`);
    console.log(`📅 Fecha guardada en UTC: ${dueDate.toISOString()}`);
    console.log(`📅 Hora local verificación: ${dueDate.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`);

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
  const { title, description, due_date, priority, status, category } = req.body;

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
      [title, description, due_date, priority, status, category, id, req.userId]
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
