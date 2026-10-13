const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/database');

// Endpoint de prueba para generar notificación manual
router.post('/test-notification', authMiddleware, async (req, res) => {
  try {
    const { activityId } = req.body;

    // Crear notificación de prueba
    const notification = await pool.query(
      `INSERT INTO notifications (user_id, activity_id, type, message, sent_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, activityId || null, 'test', '🔔 Esta es una notificación de prueba', new Date()]
    );

    // Emitir por WebSocket si está disponible
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.userId}`).emit('new_notification', notification.rows[0]);
    }

    res.json({
      success: true,
      message: 'Notificación de prueba creada',
      notification: notification.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error creando notificación de prueba' });
  }
});

// Endpoint para forzar revisión de actividades
router.post('/check-activities', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Buscar actividades del usuario que vencen pronto
    const activities = await pool.query(
      `SELECT * FROM activities
       WHERE user_id = $1
       AND status != 'completado'
       AND due_date BETWEEN $2 AND $3`,
      [req.userId, now, oneHourLater]
    );

    const io = req.app.get('io');

    for (const activity of activities.rows) {
      const notification = await pool.query(
        `INSERT INTO notifications (user_id, activity_id, type, message, sent_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          req.userId,
          activity.id,
          'urgent',
          `⏰ Tu actividad "${activity.title}" vence pronto`,
          new Date()
        ]
      );

      if (io) {
        io.to(`user_${req.userId}`).emit('new_notification', notification.rows[0]);
      }
    }

    res.json({
      success: true,
      activitiesFound: activities.rows.length,
      message: `Se crearon ${activities.rows.length} notificaciones`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error revisando actividades' });
  }
});

module.exports = router;
