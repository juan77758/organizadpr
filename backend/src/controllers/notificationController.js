const pool = require('../config/database');

// Obtener notificaciones del usuario
exports.getNotifications = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT n.*, a.title as activity_title
       FROM notifications n
       LEFT JOIN activities a ON n.activity_id = a.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [req.userId, limit]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    next(error);
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({
      message: 'Notificación marcada como leída',
      notification: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.userId]
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    next(error);
  }
};

// Obtener contador de no leídas
exports.getUnreadCount = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch (error) {
    next(error);
  }
};

// Verificar actividades AHORA (forzar)
exports.checkActivitiesNow = async (req, res, next) => {
  try {
    const notificationService = require('../services/notificationService');
    const io = req.app.get('io');

    // Forzar revisión inmediata
    await notificationService.processImminentActivities(io);

    res.json({
      message: '✓ Revisión forzada completada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
