const pool = require('../config/database');
const { sendReminderEmail } = require('./emailService');

// Crear notificación en la base de datos
exports.createNotification = async (userId, activityId, type, message) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, activity_id, type, message, sent_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, activityId, type, message]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creando notificación:', error);
    throw error;
  }
};

// Procesar recordatorios de actividades
exports.processReminders = async (io) => {
  try {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Buscar actividades que vencen en 24 horas y no han sido notificadas
    const activities = await pool.query(
      `SELECT a.*, u.email, u.name as user_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.status != 'completado'
       AND a.due_date BETWEEN $1 AND $2
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.activity_id = a.id
         AND n.type = 'email_24h'
         AND n.sent_at > CURRENT_TIMESTAMP - INTERVAL '23 hours'
       )`,
      [now, twentyFourHoursLater]
    );

    for (const activity of activities.rows) {
      // Enviar email
      await sendReminderEmail(activity.email, activity.user_name, activity);

      // Crear notificación en BD
      const message = `Tu actividad "${activity.title}" vence en menos de 24 horas`;
      const notification = await this.createNotification(
        activity.user_id,
        activity.id,
        'email_24h',
        message
      );

      // Emitir notificación por WebSocket
      if (io) {
        io.to(`user_${activity.user_id}`).emit('new_notification', notification);
      }
    }

    console.log(`✓ Procesados ${activities.rows.length} recordatorios`);
  } catch (error) {
    console.error('Error procesando recordatorios:', error);
  }
};

// Buscar actividades vencidas
exports.processOverdueActivities = async (io) => {
  try {
    const now = new Date();

    const activities = await pool.query(
      `SELECT a.*, u.email, u.name as user_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.status != 'completado'
       AND a.due_date < $1
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.activity_id = a.id
         AND n.type = 'overdue'
         AND n.sent_at > CURRENT_TIMESTAMP - INTERVAL '1 day'
       )`,
      [now]
    );

    for (const activity of activities.rows) {
      const message = `⚠️ Tu actividad "${activity.title}" está vencida`;
      const notification = await this.createNotification(
        activity.user_id,
        activity.id,
        'overdue',
        message
      );

      // Emitir notificación por WebSocket
      if (io) {
        io.to(`user_${activity.user_id}`).emit('new_notification', notification);
      }
    }

    console.log(`✓ Procesadas ${activities.rows.length} actividades vencidas`);
  } catch (error) {
    console.error('Error procesando actividades vencidas:', error);
  }
};

// Procesar actividades que vencen en los próximos 5 minutos
exports.processImminentActivities = async (io) => {
  try {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    console.log('🔔 Revisando actividades inminentes...');
    console.log(`   Hora del servidor (UTC): ${now.toISOString()}`);
    console.log(`   Hora local: ${now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`);
    console.log(`   Ventana: ${fiveMinutesAgo.toISOString()} a ${fiveMinutesLater.toISOString()}`);

    // Primero veamos TODAS las actividades sin filtro de fecha
    const allActivities = await pool.query(
      `SELECT a.*, u.email, u.name as user_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.status != 'completado'`
    );

    console.log(`   Total actividades NO completadas: ${allActivities.rows.length}`);
    allActivities.rows.forEach(act => {
      console.log(`   📋 Actividad: "${act.title}" - Due: ${act.due_date} (${new Date(act.due_date).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })})`);
    });

    // Buscar actividades que vencen en los próximos 5 minutos O que vencieron hace menos de 5 minutos
    const activities = await pool.query(
      `SELECT a.*, u.email, u.name as user_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.status != 'completado'
       AND a.due_date BETWEEN $1 AND $2
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.activity_id = a.id
         AND n.type = 'imminent'
         AND n.sent_at > CURRENT_TIMESTAMP - INTERVAL '10 minutes'
       )`,
      [fiveMinutesAgo, fiveMinutesLater]
    );

    console.log(`   Encontradas en ventana: ${activities.rows.length} actividades`);

    for (const activity of activities.rows) {
      console.log(`   📋 Procesando: ${activity.title} (vence: ${activity.due_date})`);

      // Enviar email
      try {
        await sendReminderEmail(activity.email, activity.user_name, activity);
        console.log(`   ✓ Email enviado a ${activity.email}`);
      } catch (emailError) {
        console.error(`   ✗ Error enviando email:`, emailError.message);
      }

      // Crear notificación en BD
      const message = `🚨 ¡URGENTE! Tu actividad "${activity.title}" vence pronto`;
      const notification = await this.createNotification(
        activity.user_id,
        activity.id,
        'imminent',
        message
      );

      console.log(`   ✓ Notificación creada en BD`);

      // Emitir notificación por WebSocket con bandera de alarma
      if (io) {
        io.to(`user_${activity.user_id}`).emit('new_notification', {
          ...notification,
          playSound: true,
          urgent: true
        });
        console.log(`   ✓ WebSocket emitido`);
      }

      console.log(`🔔 Notificación urgente enviada para: ${activity.title}`);
    }

    if (activities.rows.length > 0) {
      console.log(`✓ Procesadas ${activities.rows.length} actividades inminentes`);
    }
  } catch (error) {
    console.error('Error procesando actividades inminentes:', error);
  }
};
